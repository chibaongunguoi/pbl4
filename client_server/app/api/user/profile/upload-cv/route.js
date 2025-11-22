import { NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";
import getConfigs from "@/app/lib/config";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(req) {
  try {
    const token = req.cookies.get("auth")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("cv");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Try to forward to file system service when configured
  const configs = getConfigs();
  const fileSystemUrl = process.env.FILE_SYSTEM_URL || (configs.FILE_SYSTEM_HOST ? `http://${configs.FILE_SYSTEM_HOST}:${configs.FILE_SYSTEM_PORT || 37003}` : null);
    if (fileSystemUrl) {
      try {
        const forwardForm = new FormData();
        // Node/Next's File object should be usable in FormData append
        forwardForm.append("file", file, `${decoded.username}_${Date.now()}.pdf`);
  const owner = encodeURIComponent(decoded.username || "");
  // Path tells the File System where to store the file. Use a neutral path
  // without mentioning any special base segment.
  const resp = await fetch(`${fileSystemUrl}/upload?owner=${owner}&path=cv`, { method: "POST", body: forwardForm });
        const json = await resp.json();
        if (!resp.ok) {
          return NextResponse.json({ error: json.error || json.detail || "Upload failed" }, { status: resp.status });
        }
        // If url is relative (from file service), prefix with host
        let returnedUrl = json.url || null;
  // Normalize FS url to a client-facing path (/files/...) so we don't return host:port
        if (returnedUrl) {
          try {
            const u = new URL(returnedUrl);
            // Use pathname of absolute URL
            returnedUrl = u.pathname;
          } catch (e) {
            // not an absolute URL, returnedUrl stays as-is
          }
          // Keep /files/... path as canonical, do not translate it to another
          // base folder name; the viewer will handle mapping to a UI route.
          if (returnedUrl.startsWith("/files/")) {
            returnedUrl = returnedUrl;
          }
        }
        return NextResponse.json({ success: true, url: returnedUrl }, { status: 200 });
      } catch (forwardErr) {
        console.error("Forward to file system failed:", forwardErr);
        // fallthrough to fallback approach below
      }
    }

  // Fallback: save to public files directory for CVs
  const publicFilesDir = path.join(process.cwd(), "public", "files", "cv");
    if (!existsSync(publicFilesDir)) {
      await mkdir(publicFilesDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedUsername = decoded.username.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${sanitizedUsername}_${timestamp}.pdf`;
  const filepath = path.join(publicFilesDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
  const publicUrl = `/files/cv/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    }, { status: 200 });

  } catch (err) {
    console.error("Upload CV error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
