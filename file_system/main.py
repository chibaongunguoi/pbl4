import multipart
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pathlib import Path
import os
import time
import uuid

app = FastAPI()

# Allow localhost for simple cross-origin requests from the NextJS app.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT_DIR = Path(__file__).parent.resolve()
VAR_DIR = ROOT_DIR / "var"

ALLOWED_MIMETYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}


def _ensure_dirs():
    if not VAR_DIR.exists():
        VAR_DIR.mkdir(parents=True, exist_ok=True)


def startup_event():
    _ensure_dirs()


app.add_event_handler("startup", startup_event)


async def upload_file(
    file: UploadFile = File(...),
    owner: Optional[str] = Query(None),
    path: Optional[str] = Query(None),
):
    """
    Upload a file (pdf, jpg, png). Returns a JSON payload with file URL.
    Optional 'owner' query parameter is used to tag filenames.
    """
    # 'path' is an optional relative path under VAR_DIR. If not specified,
    # the file will be stored directly under VAR_DIR. This function no
    # longer enforces a fallback segment — the file system is
    # neutral to whatever folders exist under VAR_DIR.
    if file.content_type not in ALLOWED_MIMETYPES:
        raise HTTPException(status_code=400, detail="File type not allowed")

    max_size = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    ext = ALLOWED_MIMETYPES[file.content_type]
    safe_segments = [
        "".join(ch if (ch.isalnum() or ch == "_") else "_" for ch in seg)[:100]
        for seg in (path or "").split("/")
        if seg != ""
    ]
    # Do not enforce a default base segment; when no path is provided
    # the file will be stored under VAR_DIR (root of the file system).
    dest_dir = VAR_DIR.joinpath(*safe_segments)
    # Prevent writing outside VAR_DIR by ensuring resolved path is within VAR_DIR
    try:
        resolved = dest_dir.resolve()
        var_resolved = VAR_DIR.resolve()
        if not resolved.is_relative_to(var_resolved):
            raise HTTPException(status_code=400, detail="Invalid upload path")
    except Exception:
        # If resolve fails or not inside VAR_DIR
        raise HTTPException(status_code=400, detail="Invalid upload path")
    if not dest_dir.exists():
        dest_dir.mkdir(parents=True, exist_ok=True)

    owner_name = (owner or "anon").replace(" ", "_")
    # Sanitize owner_name to alphanum and underscores
    owner_name = "".join(c if (c.isalnum() or c == "_") else "_" for c in owner_name)[
        :50
    ]
    filename = f"{owner_name}_{int(time.time())}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = dest_dir / filename

    with open(filepath, "wb") as f:
        f.write(contents)

    if len(safe_segments) > 0:
        url = f"/files/{'/'.join(safe_segments)}/{filename}"
    else:
        url = f"/files/{filename}"
    return JSONResponse({"success": True, "url": url})


async def get_file(file_path: str):
    requested = Path(file_path)
    # Normalize segments and prevent path traversal
    segments = [seg for seg in file_path.split("/") if seg != ""]
    if any(seg == ".." for seg in segments):
        raise HTTPException(status_code=400, detail="Invalid path")
    # Build path from segments and ensure it is inside VAR_DIR
    path = VAR_DIR.joinpath(*segments)
    try:
        resolved = path.resolve()
        var_resolved = VAR_DIR.resolve()
        if not resolved.is_relative_to(var_resolved):
            print(f"get_file: attempted to access outside VAR_DIR: {file_path} -> {resolved}")
            raise HTTPException(status_code=404, detail="Not found")
    except Exception as e:
        print(f"get_file: resolve error for {file_path}: {e}")
        raise HTTPException(status_code=404, detail="Not found")
    if not path.exists() or not path.is_file():
        # Do not perform fallback lookup. If the file is not found under the
        # requested `VAR_DIR` path, return 404 immediately. Explicit handling
        # of other historic public storage layouts or alternative locations
        # should be done with a migration or separate process; the file-system
        # service is strict and does not attempt to guess or search
        # alternative locations.
        raise HTTPException(status_code=404, detail="File not found")

    # Serve file with proper headers and a small debug header so responses
    # served by the file system are identifiable in the browser DevTools
    print(f"get_file: serving {file_path} -> {path.resolve()}")
    return FileResponse(path, media_type=None, headers={"X-Source": "file-system"})


# An alias route was removed to avoid naming dependency on any particular
# subfolder. We keep the normalized '/files/.../path' route only.


# Register the API routes at module import time so uvicorn imports also
# include the endpoints. This ensures the endpoints work regardless of
# whether the app is started via `python main.py` or `uvicorn file_system.main:app`.
# We'll register the routes after all handlers are defined — see below


async def viewer(path: str = Query(None)):
    """
    Small HTML viewer that lists links to files in the path.
    The 'path' is a relative path under VAR_DIR. This endpoint validates
    the resolved path resides under VAR_DIR and lists files (or a single
    file) inside it. It does not depend on any specific base folder name.
    """
    if ".." in path.split("/"):
        raise HTTPException(status_code=400, detail="Invalid path")

    segments = [seg for seg in (path or "").split("/") if seg != ""]
    root = VAR_DIR.joinpath(*segments) if len(segments) > 0 else VAR_DIR
    try:
        resolved = root.resolve()
        var_resolved = VAR_DIR.resolve()
        if not resolved.is_relative_to(var_resolved):
            raise HTTPException(status_code=400, detail="Invalid path")
    except Exception:
        raise HTTPException(status_code=404, detail="Not found")

    if not root.exists():
        raise HTTPException(status_code=404, detail="Path not found")

    # If the path is a file, just display the single file
    if root.is_file():
        items = [root.name]
        segments = list(root.relative_to(VAR_DIR).parts)
    else:
        items = [
            p.name
            for p in sorted(root.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True)
            if p.is_file()
        ]
    rows = []
    for name in items:
        url = (
            f"/files/{'/'.join(segments)}/{name}"
            if len(segments) > 0
            else f"/files/{name}"
        )
        # show inline preview for images
        rows.append(f'<div><a target="_blank" href="{url}">{name}</a><br/>')
        if name.lower().endswith((".png", ".jpg", ".jpeg")):
            rows.append(
                f'<img src="{url}" style="max-width:300px;max-height:300px;margin:4px"/>'
            )
        rows.append("</div>")

    html = f"<html><head><title>File system viewer ({path})</title></head><body><h1>Files: {path}</h1>{''.join(rows)}</body></html>"
    return HTMLResponse(content=html)


# Register the API routes at module import time so uvicorn imports also
# include the endpoints. This ensures the endpoints work regardless of
# whether the app is started via `python main.py` or `uvicorn file_system.main:app`.
app.add_api_route("/upload", upload_file, methods=["POST"])
app.add_api_route("/files/{file_path:path}", get_file, methods=["GET", "HEAD"])
app.add_api_route("/viewer", viewer, methods=["GET"])
if __name__ == "__main__":
    import uvicorn

    app.add_api_route("/upload", upload_file, methods=["POST"])
    app.add_api_route("/files/{file_path:path}", get_file, methods=["GET", "HEAD"])
    app.add_api_route("/viewer", viewer, methods=["GET"])
    host = os.environ.get("FILE_SYSTEM_HOST", "0.0.0.0")
    port = int(os.environ.get("FILE_SYSTEM_PORT", "8001"))
    uvicorn.run(app, host=host, port=port)
