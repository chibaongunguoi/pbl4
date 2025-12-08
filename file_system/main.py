from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from pathlib import Path
import os
import time
import uuid

app = FastAPI()

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
    dest_dir = VAR_DIR.joinpath(*safe_segments)
    try:
        resolved = dest_dir.resolve()
        var_resolved = VAR_DIR.resolve()
        if not resolved.is_relative_to(var_resolved):
            raise HTTPException(status_code=400, detail="Invalid upload path")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid upload path")
    if not dest_dir.exists():
        dest_dir.mkdir(parents=True, exist_ok=True)

    owner_name = (owner or "anon").replace(" ", "_")
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
    segments = [seg for seg in file_path.split("/") if seg != ""]
    if any(seg == ".." for seg in segments):
        raise HTTPException(status_code=400, detail="Invalid path")
    path = VAR_DIR.joinpath(*segments)
    try:
        resolved = path.resolve()
        var_resolved = VAR_DIR.resolve()
        if not resolved.is_relative_to(var_resolved):
            print(
                f"get_file: attempted to access outside VAR_DIR: {file_path} -> {resolved}"
            )
            raise HTTPException(status_code=404, detail="Not found")
    except Exception as e:
        print(f"get_file: resolve error for {file_path}: {e}")
        raise HTTPException(status_code=404, detail="Not found")
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    print(f"get_file: serving {file_path} -> {path.resolve()}")
    return FileResponse(path, media_type=None, headers={"X-Source": "file-system"})


async def viewer(path: str = Query(None)):
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

    if root.is_file():
        items = [root.name]
        segments = list(root.relative_to(VAR_DIR).parts)
    else:
        items = [
            p.name
            for p in sorted(
                root.glob("*"), key=lambda p: p.stat().st_mtime, reverse=True
            )
            if p.is_file()
        ]
    rows = []
    for name in items:
        url = (
            f"/files/{'/'.join(segments)}/{name}"
            if len(segments) > 0
            else f"/files/{name}"
        )
        rows.append(f'<div><a target="_blank" href="{url}">{name}</a><br/>')
        if name.lower().endswith((".png", ".jpg", ".jpeg")):
            rows.append(
                f'<img src="{url}" style="max-width:300px;max-height:300px;margin:4px"/>'
            )
        rows.append("</div>")

    html = f"<html><head><title>File system viewer ({path})</title></head><body><h1>Files: {path}</h1>{''.join(rows)}</body></html>"
    return HTMLResponse(content=html)


app.add_api_route("/upload", upload_file, methods=["POST"])
app.add_api_route("/files/{file_path:path}", get_file, methods=["GET", "HEAD"])
app.add_api_route("/viewer", viewer, methods=["GET"])
if __name__ == "__main__":
    import uvicorn

    app.add_api_route("/upload", upload_file, methods=["POST"])
    app.add_api_route("/files/{file_path:path}", get_file, methods=["GET", "HEAD"])
    app.add_api_route("/viewer", viewer, methods=["GET"])
    host = os.environ.get("FILE_SYSTEM_HOST", "localhost")
    port = int(os.environ.get("FILE_SYSTEM_PORT", "37003"))
    uvicorn.run(app, host=host, port=port)
