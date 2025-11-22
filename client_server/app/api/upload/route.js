import { NextResponse } from "next/server";
import getConfigs from "@/app/lib/config";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const configs = getConfigs();
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: "Không có file được chọn" 
      }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)" 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: "File ảnh không được vượt quá 5MB" 
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${originalName}`;

    // Try to forward to file system service when configured
    const fileSystemUrl = process.env.FILE_SYSTEM_URL || (configs.FILE_SYSTEM_HOST ? `http://${configs.FILE_SYSTEM_HOST}:${configs.FILE_SYSTEM_PORT || 37003}` : null);
    if (fileSystemUrl) {
      try {
        const forwardForm = new FormData();
        forwardForm.append("file", file, filename);
          const resp = await fetch(`${fileSystemUrl}/upload?path=logos`, { method: "POST", body: forwardForm });
        const json = await resp.json();
        if (!resp.ok) {
          return NextResponse.json({ success: false, error: json.error || json.detail || "Upload failed" }, { status: resp.status });
        }
        let returnedUrl = json.url || null;
        if (returnedUrl) {
          try {
            const u = new URL(returnedUrl);
            returnedUrl = u.pathname;
          } catch (e) {
          }
          if (returnedUrl.startsWith("/files/")) {
            // Do not translate '/files/...' into another base path; keep the
            // canonical '/files/...' path in client responses.
              // Keep '/files/...' canonical in client responses; the viewer will
              // map that to the UI view path. Do nothing to the returned value.
          }
        }
        return NextResponse.json({ success: true, logoUrl: returnedUrl, message: "Upload ảnh thành công" }, { status: 200 });
      } catch (err) {
        console.error("Forward to file system failed:", err);
        // fallthrough to fallback
      }
    }

  // Create public files directory if it doesn't exist (fallback)
  const publicFilesDir = path.join(process.cwd(), "public", "files", "logos");
    try {
  await mkdir(publicFilesDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    // Write file
  const filePath = path.join(publicFilesDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const logoUrl = `/files/logos/${filename}`;

    return NextResponse.json({ 
      success: true, 
      logoUrl: logoUrl,
      message: "Upload ảnh thành công"
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Lỗi khi upload ảnh" 
    }, { status: 500 });
  }
}