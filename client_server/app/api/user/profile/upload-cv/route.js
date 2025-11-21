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
  // Path tells the File System where to store the file. Keep legacy behavior under uploads/cv
  const resp = await fetch(`${fileSystemUrl}/upload?owner=${owner}&path=uploads/cv`, { method: "POST", body: forwardForm });
        const json = await resp.json();
        if (!resp.ok) {
          return NextResponse.json({ error: json.error || json.detail || "Upload failed" }, { status: resp.status });
        }
        // If url is relative (from file service), prefix with host
        const returnedUrl = json.url || null;
        const fullUrl = returnedUrl && returnedUrl.startsWith("/") ? `${fileSystemUrl}${returnedUrl}` : returnedUrl;
        return NextResponse.json({ success: true, url: fullUrl }, { status: 200 });
      } catch (forwardErr) {
        console.error("Forward to file system failed:", forwardErr);
        // fallthrough to fallback approach below
      }
    }

    // Fallback: save to public/uploads/cv as before
    const uploadDir = path.join(process.cwd(), "public", "uploads", "cv");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedUsername = decoded.username.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${sanitizedUsername}_${timestamp}.pdf`;
    const filepath = path.join(uploadDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/cv/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl 
    }, { status: 200 });

  } catch (err) {
    console.error("Upload CV error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
