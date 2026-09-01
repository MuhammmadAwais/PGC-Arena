import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getB2Client, getB2BucketName, getB2FileUrl } from "@/lib/b2/client";
import { requireAuth } from "@/lib/supabase/rbac";
import { presignRequestSchema } from "@/features/library/schemas/librarySchemas";

export async function POST(req: Request) {
  try {
    // 1. Assert RBAC Authentication
    const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    // 2. Validate Payload
    const body = await req.json();
    const parsed = presignRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid upload parameters" },
        { status: 400 }
      );
    }

    const { filename, contentType } = parsed.data;

    // 3. Clean filename and generate unique S3/B2 file key
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueId = crypto.randomUUID().slice(0, 8);
    const timestamp = Date.now();
    const fileKey = `textbooks/${timestamp}_${uniqueId}_${sanitized}`;

    const bucketName = getB2BucketName();
    const s3Client = getB2Client();

    // 4. Create PutObjectCommand & Generate Presigned PUT URL
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour expiration
    });

    const fileUrl = getB2FileUrl(fileKey);

    return NextResponse.json({
      success: true,
      presignedUrl,
      fileKey,
      fileUrl,
    });
  } catch (err: any) {
    console.error("Presigned URL Generation Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate presigned upload URL." },
      { status: 500 }
    );
  }
}
