import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "logos");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    // Write file
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const logoUrl = `/uploads/logos/${filename}`;

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