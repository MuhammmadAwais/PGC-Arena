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

// ── 1. Types & Matrix Config ──────────────────────────────────────────
export interface GenerationConfig {
  subjectCode?: string | null;
  difficulty?: "BALANCED" | "EASY" | "MEDIUM" | "HARD" | null;
  cognitiveType?: "MIXED" | "KNOWLEDGE" | "CONCEPTUAL" | "APPLICATION" | null;
  count: number;
}

export const STEM_SUBJECTS = ["PHY", "MATH", "CHEM", "CS", "BIO", "STAT"];

// Available & Validated Gemini Models on the active API key
export const AVAILABLE_GEMINI_MODELS = [
  { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", tag: "Premium / STEM", desc: "Top math & formula accuracy" },
  { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", tag: "Balanced", desc: "High throughput & general subjects" },
  { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash Lite", tag: "Fast / Free-Tier", desc: "Lightweight & high rate-limit tolerance" },
  { id: "gemini-flash-lite-latest", name: "Gemini Flash Lite (Latest)", tag: "Fallback", desc: "Standard low-latency fallback" },
] as const;

/**
 * ── 2. Select Model (Hybrid Model Router) ─────────────────────────────
 * Dynamically routes traffic between premium (gemini-3.6-flash) and lite (gemini-3.5-flash-lite)
 * models based on STEM overrides and complexity scoring.
 */
export function selectModel(config: GenerationConfig): {
  modelId: string;
  score: number;
  reason: string;
} {
  const normSubject = (config.subjectCode || "").trim().toUpperCase();

  // A. Absolute Overrides
  if (normSubject && STEM_SUBJECTS.includes(normSubject)) {
    return {
      modelId: "gemini-3.6-flash",
      score: 15,
      reason: `STEM Absolute Override (${normSubject})`,
    };
  }

  if (config.count > 25) {
    return {
      modelId: "gemini-3.6-flash",
      score: 15,
      reason: `High Volume Absolute Override (${config.count} MCQs)`,
    };
  }

  // B. Complexity Matrix (Max Score 15)
  let score = 0;

  // 1. Difficulty Weight: EASY (+1), MEDIUM/BALANCED (+3), HARD (+5)
  if (config.difficulty === "HARD") {
    score += 5;
  } else if (config.difficulty === "MEDIUM" || config.difficulty === "BALANCED") {
    score += 3;
  } else {
    score += 1;
  }

  // 2. Cognitive Weight: KNOWLEDGE (+1), CONCEPTUAL/MIXED (+3), APPLICATION (+5)
  if (config.cognitiveType === "APPLICATION") {
    score += 5;
  } else if (
    config.cognitiveType === "CONCEPTUAL" ||
    config.cognitiveType === "MIXED"
  ) {
    score += 3;
  } else {
    score += 1;
  }

  // 3. Quantity Weight: 1-10 (+1), 11-20 (+3), 21-25 (+5)
  if (config.count >= 21) {
    score += 5;
  } else if (config.count >= 11) {
    score += 3;
  } else {
    score += 1;
  }

  // C. Threshold Routing
  if (score >= 9) {
    return {
      modelId: "gemini-3.6-flash",
      score,
      reason: `High Complexity Score (${score}/15)`,
    };
  }

  return {
    modelId: "gemini-3.5-flash-lite",
    score,
    reason: `Low Complexity Score (${score}/15)`,
  };
}

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
          error: "Gemini API key is not configured in server environment (.env.local).",
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
      model: explicitModel,
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

    // 3. Dynamic Hybrid Model Selection
    const genConfig: GenerationConfig = {
      subjectCode: contextData?.subjectCode || null,
      difficulty: difficultyBias,
      cognitiveType: cognitiveBias,
      count,
    };

    let { modelId: targetModelId, score: complexityScore, reason: routeReason } =
      selectModel(genConfig);

    if (explicitModel && explicitModel !== "auto") {
      targetModelId = explicitModel;
      routeReason = `Manual User Selection (${explicitModel})`;
    }

    const isPremiumModel = targetModelId === "gemini-3.6-flash";

    // 4. Initialize Google AI Client
    const google = createGoogleGenerativeAI({ apiKey });

    // 5. Construct System Directives
    const systemPrompt = `
You are an elite academic examiner, master curriculum specialist, and item writer for the Punjab Group of Colleges (PGC) and Pakistani Intermediate Education Boards (FBISE, BISE Lahore, Rawalpindi, Faisalabad, Multan).

Your mission is to generate ${count} high-yield, competitive multiple-choice questions (MCQs) for institutional tournaments and Board preparation.
Routing Profile: ${targetModelId} [Complexity Score: ${complexityScore}/15 | ${routeReason}]

ACADEMIC CONTEXT:
- Board: ${contextData?.boardName || "Punjab Boards / FBISE"}
- Class Level: Class ${contextData?.classLevel || 11}
- Subject: ${contextData?.subjectName || "Academic Curriculum"} (${contextData?.subjectCode || "N/A"})
- Chapter: ${contextData?.chapterTitle || "General Curriculum Unit"}
- Topic: ${contextData?.topicTitle || topicPrompt || "Selected Syllabus Section"}
- Script: ${contextData?.scriptType || "LATIN"}

GENERATION RULES & CONSTRAINTS:
1. FORMULA & MATH FORMATTING:
   - All mathematical, physical, and chemical symbols, dimensions, fractions, and variables MUST be strictly wrapped in single dollar signs ($ ... $) for KaTeX rendering.
   - Example dimensions: $[M L^2 T^{-2}]$, $[M L T^{-2}]$, $[M L^{-1} T^{-2}]$.
   - Example equations: $\\tau = r \\times F$, $K.E = \\frac{1}{2} m v^2$, $\\lambda = \\frac{h}{p}$, $H_2SO_4$.
   ${
     isPremiumModel
       ? `- HIGH-PRECISION STEM DIRECTIVE: Zero LaTeX hallucinations. Every numerator, denominator, Greek symbol (\\alpha, \\beta, \\lambda, \\mu, \\Delta, \\omega), vector arrow (\\vec{F}), and unit (m/s^2, J, N, kg, Pa) must be mathematically sound.`
       : `- Ensure clear, concise and unambiguous options.`
   }
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

    // 6. Construct Content Payloads (Multimodal if PDF present)
    const contentParts: any[] = [];

    if (pdfBase64) {
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      contentParts.push({
        type: "file",
        mediaType: "application/pdf",
        data: Buffer.from(cleanBase64, "base64"),
      });
      contentParts.push({
        type: "text",
        text: `Please thoroughly examine the attached PDF document excerpt and generate ${count} competitive MCQs targeting: ${
          topicPrompt || contextData?.topicTitle || "the provided textbook contents"
        }.`,
      });
    } else if (pdfUrl) {
      let base64Data: string | null = null;

      // Try reading via S3 / B2 authenticated GetObjectCommand
      try {
        const bucketName = getB2BucketName();
        const s3Client = getB2Client();

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

      // Fallback to direct HTTP fetch
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
            const srcDoc = await PDFDocument.load(rawBytes, {
              ignoreEncryption: true,
            });
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
            console.warn(
              "Server PDF slicing failed, using full PDF buffer:",
              sliceErr
            );
          }
        }

        const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
        contentParts.push({
          type: "file",
          mediaType: "application/pdf",
          data: Buffer.from(cleanBase64, "base64"),
        });
      }

      contentParts.push({
        type: "text",
        text: `Generate ${count} competitive MCQs targeting syllabus topic: "${
          topicPrompt ||
          contextData?.topicTitle ||
          contextData?.chapterTitle ||
          "General Textbook Concepts"
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

    // 7. Stream Structured Object Array with Fallback Resilience
    const fallbackModels = [targetModelId, "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-lite-latest"];
    const uniqueFallbackModels = Array.from(new Set(fallbackModels));

    let lastError: any = null;

    for (const modelToTry of uniqueFallbackModels) {
      try {
        const model = google(modelToTry);

        const result = streamObject({
          model,
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
          temperature: isPremiumModel ? 0.35 : 0.4,
        });

        const response = result.toTextStreamResponse();
        response.headers.set("x-selected-model", modelToTry);
        response.headers.set("x-complexity-score", String(complexityScore));

        return response;
      } catch (tryErr: any) {
        lastError = tryErr;
        console.warn(`Model ${modelToTry} attempt failed, trying fallback:`, tryErr.message);
      }
    }

    throw lastError || new Error("All candidate Gemini models failed to respond.");
  } catch (err: any) {
    console.error("AI Generation Error:", err);

    const errMsg = err?.message || String(err);
    const isRateLimited =
      err?.statusCode === 429 ||
      err?.status === 429 ||
      errMsg.includes("429") ||
      errMsg.includes("RESOURCE_EXHAUSTED") ||
      errMsg.includes("quota") ||
      errMsg.includes("Too Many Requests") ||
      errMsg.includes("high demand");

    if (isRateLimited) {
      return new Response(
        JSON.stringify({
          error:
            "Google AI free-tier quota limit reached (429 Rate Throttled / High Demand). Please pause for 15-30 seconds before generating again.",
          throttled: true,
          retryAfterSeconds: 20,
        }),
        {
          status: 429,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
