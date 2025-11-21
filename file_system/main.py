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
    path: Optional[str] = Query("uploads"),
):
    """
    Upload a file (pdf, jpg, png). Returns a JSON payload with file URL.
    Optional 'owner' query parameter is used to tag filenames.
    """
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
    if len(safe_segments) == 0:
        safe_segments = ["uploads"]
    dest_dir = VAR_DIR.joinpath(*safe_segments)
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

    url = f"/files/{'/'.join(safe_segments)}/{filename}"
    return JSONResponse({"success": True, "url": url})


async def get_file(file_path: str):
    requested = Path(file_path)
    if ".." in requested.parts:
        raise HTTPException(status_code=400, detail="Invalid path")

    path = VAR_DIR.joinpath(*requested.parts)
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    # Serve file with proper headers
    return FileResponse(path, media_type=None)


async def viewer(path: str = Query("uploads")):
    # Small HTML viewer that lists links to files in the path
    if ".." in path.split("/"):
        raise HTTPException(status_code=400, detail="Invalid path")

    segments = [seg for seg in (path or "").split("/") if seg != ""]
    root = VAR_DIR.joinpath(*segments) if segments else VAR_DIR
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


if __name__ == "__main__":
    import uvicorn

    app.add_api_route("/upload", upload_file, methods=["POST"])
    app.add_api_route("/files/{file_path:path}", get_file, methods=["GET"])
    app.add_api_route("/viewer", viewer, methods=["GET"])
    host = os.environ.get("FILE_SYSTEM_HOST", "0.0.0.0")
    port = int(os.environ.get("FILE_SYSTEM_PORT", "8001"))
    uvicorn.run(app, host=host, port=port)
