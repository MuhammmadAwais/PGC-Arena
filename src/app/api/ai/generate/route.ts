import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getB2Client, getB2BucketName } from "@/lib/b2/client";
import { requireAuth } from "@/lib/supabase/rbac";
import {
  generateApiRequestSchema,
  generatedMcqSchema,
} from "@/features/studio/schemas/studioSchemas";

export const maxDuration = 60; // Allow streaming up to 60s

export async function POST(req: Request) {
  try {
    // 1. Assert RBAC Authentication
    const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "Gemini API key is not configured in server environment.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. Validate Request Body
    const body = await req.json();
    const parsed = generateApiRequestSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error:
            parsed.error.issues?.[0]?.message || "Invalid generation parameters",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      pdfBase64,
      pdfUrl,
      startPage,
      endPage,
      topicPrompt,
      count,
      difficultyBias,
      cognitiveBias,
      contextData,
    } = parsed.data;

    // 3. Initialize Google AI Client with Flash model
    const google = createGoogleGenerativeAI({ apiKey });

    // 4. Construct System Directives
    const systemPrompt = `
You are an elite academic examiner, master curriculum specialist, and item writer for the Punjab Group of Colleges (PGC) and Pakistani Intermediate Education Boards (FBISE, BISE Lahore, Rawalpindi, Faisalabad, Multan).

Your mission is to generate ${count} high-yield, competitive multiple-choice questions (MCQs) for institutional tournaments and Board preparation.

ACADEMIC CONTEXT:
- Board: ${contextData?.boardName || "Punjab Boards / FBISE"}
- Class Level: Class ${contextData?.classLevel || 11}
- Subject: ${contextData?.subjectName || "Academic Curriculum"}
- Chapter: ${contextData?.chapterTitle || "General Curriculum Unit"}
- Topic: ${contextData?.topicTitle || topicPrompt || "Selected Syllabus Section"}
- Script: ${contextData?.scriptType || "LATIN"}

GENERATION RULES & CONSTRAINTS:
1. FORMULA & MATH FORMATTING:
   - All mathematical, physical, and chemical symbols, dimensions, fractions, and variables MUST be strictly wrapped in single dollar signs ($ ... $) for KaTeX rendering.
   - Example dimensions: $[M L^2 T^{-2}]$, $[M L T^{-2}]$, $[M L^{-1} T^{-2}]$.
   - Example equations: $\\tau = r \\times F$, $K.E = \\frac{1}{2} m v^2$, $\\lambda = \\frac{h}{p}$.
2. BLOOM'S TAXONOMY & COGNITIVE BIAS:
   - Target Bias: ${cognitiveBias}
   - KNOWLEDGE: Direct factual recall, definitions, SI units, fundamental constants.
   - CONCEPTUAL: Underlying physical laws, graphs, dimensional consistency, proportional reasoning.
   - APPLICATION: Numerical calculations, multi-step problem solving, real-world academic scenarios.
3. DIFFICULTY DISTRIBUTION:
   - Target Bias: ${difficultyBias}
   - Ensure distractors (incorrect options) represent genuine common misconceptions, calculation sign errors, or reciprocal mistakes made by students.
4. SCRIPT & LANGUAGE:
   - If Script is URDU_NASTALIQ, write the question stem, options, and explanation in high-quality academic Urdu.
   - If Script is ARABIC, write in formal Arabic.
   - Otherwise, write in clear, unambiguous academic English.
5. EXPLANATION:
   - Provide a concise 1-2 sentence pedagogical rationale showing the formula step or proof for why the correct answer is valid.
`.trim();

    // 5. Construct Content Payloads (Multimodal if PDF present)
    const contentParts: any[] = [];

    if (pdfBase64) {
      contentParts.push({
        type: "file",
        mediaType: "application/pdf",
        data: pdfBase64,
      });
      contentParts.push({
        type: "text",
        text: `Please thoroughly examine the attached PDF document excerpt and generate ${count} competitive MCQs targeting: ${
          topicPrompt || contextData?.topicTitle || "the provided textbook contents"
        }.`,
      });
    } else if (pdfUrl) {
      let base64Data: string | null = null;

      // 1. Try reading via S3 / B2 authenticated GetObjectCommand
      try {
        const bucketName = getB2BucketName();
        const s3Client = getB2Client();

        // Extract key from URL
        let fileKey = pdfUrl;
        if (pdfUrl.includes(bucketName)) {
          fileKey = decodeURIComponent(pdfUrl.split(`${bucketName}/`)[1] || "");
        } else if (pdfUrl.startsWith("http")) {
          const urlObj = new URL(pdfUrl);
          fileKey = decodeURIComponent(urlObj.pathname.replace(/^\/[^/]+\//, ""));
        }

        if (fileKey) {
          const getCmd = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
          });
          const s3Res = await s3Client.send(getCmd);
          if (s3Res.Body) {
            const bytes = await s3Res.Body.transformToByteArray();
            base64Data = Buffer.from(bytes).toString("base64");
          }
        }
      } catch (s3Err) {
        console.warn("S3 GetObject failed, trying direct HTTP fetch:", s3Err);
      }

      // 2. Fallback to direct HTTP fetch
      if (!base64Data) {
        try {
          const pdfRes = await fetch(pdfUrl);
          if (pdfRes.ok) {
            const pdfBuffer = await pdfRes.arrayBuffer();
            base64Data = Buffer.from(pdfBuffer).toString("base64");
          }
        } catch (pdfErr) {
          console.warn("Direct HTTP fetch failed:", pdfErr);
        }
      }

      if (base64Data) {
        // If startPage and endPage are provided, slice the PDF
        if (startPage && endPage) {
          try {
            const rawBytes = Buffer.from(base64Data, "base64");
            const srcDoc = await PDFDocument.load(rawBytes, { ignoreEncryption: true });
            const total = srcDoc.getPageCount();
            const start = Math.max(1, Math.min(startPage, total));
            const end = Math.min(total, Math.max(start, endPage));

            const pageIndices: number[] = [];
            for (let i = start - 1; i <= end - 1; i++) {
              pageIndices.push(i);
            }

            const slicedDoc = await PDFDocument.create();
            const copied = await slicedDoc.copyPages(srcDoc, pageIndices);
            copied.forEach((p) => slicedDoc.addPage(p));
            const slicedBytes = await slicedDoc.save();
            base64Data = Buffer.from(slicedBytes).toString("base64");
          } catch (sliceErr) {
            console.warn("Server PDF slicing failed, using full PDF buffer:", sliceErr);
          }
        }

        contentParts.push({
          type: "file",
          mediaType: "application/pdf",
          data: base64Data,
        });
      }

      contentParts.push({
        type: "text",
        text: `Generate ${count} competitive MCQs targeting syllabus topic: "${
          topicPrompt || contextData?.topicTitle || contextData?.chapterTitle || "General Textbook Concepts"
        }".`,
      });
    } else {
      contentParts.push({
        type: "text",
        text: `Please generate ${count} competitive MCQs based on the following syllabus requirements:\n\n${
          topicPrompt ||
          `Generate high-yield questions for ${contextData?.subjectName} - Chapter: ${contextData?.chapterTitle} - Topic: ${contextData?.topicTitle}`
        }`,
      });
    }

    // 6. Stream Structured Object Array
    const result = streamObject({
      model: google("gemini-3.6-flash"),
      system: systemPrompt,
      schema: z.object({
        questions: z.array(generatedMcqSchema),
      }),
      messages: [
        {
          role: "user",
          content: contentParts,
        },
      ],
      temperature: 0.4,
    });

    return result.toTextStreamResponse();
  } catch (err: any) {
    console.error("AI Generation Error:", err);
    return new Response(
      JSON.stringify({
        error:
          err.message || "Failed to initiate AI question generation stream.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
