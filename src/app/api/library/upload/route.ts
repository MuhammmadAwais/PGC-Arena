import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getB2Client, getB2BucketName, getB2FileUrl } from "@/lib/b2/client";
import { requireAuth } from "@/lib/supabase/rbac";

export const maxDuration = 120; // 2 minutes for 50MB+ uploads

export async function POST(req: Request) {
  try {
    // 1. Assert RBAC Authentication
    const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided for upload." },
        { status: 400 }
      );
    }

    // 2. Clean filename and generate unique S3/B2 file key
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const timestamp = Date.now();
    const fileKey = `textbooks/${timestamp}_${uniqueId}_${sanitized}`;

    const bucketName = getB2BucketName();
    const s3Client = getB2Client();

    // 3. Convert file to ArrayBuffer/Uint8Array for S3 PutObjectCommand
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type || "application/pdf",
    });

    await s3Client.send(command);

    const fileUrl = getB2FileUrl(fileKey);

    return NextResponse.json({
      success: true,
      fileKey,
      fileUrl,
    });
  } catch (err: any) {
    console.error("Server B2 Upload Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to upload file to Backblaze B2 repository." },
      { status: 500 }
    );
  }
}
