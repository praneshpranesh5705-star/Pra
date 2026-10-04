import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You are NovaForge AI, an advanced engineering, education and innovation assistant.
Your job is to solve the user's actual problem, not merely summarize their upload.
Use the uploaded file/image as primary context. Be precise and transparent.
For mathematics: show formulas, substitutions, calculations and final answer.
For science/engineering: explain principles, assumptions, units, calculations, risks and implementation.
For programming: identify bugs, explain why they happen, and provide corrected complete code when useful.
For books/PDFs: answer from the supplied content, cite page/section names when available, distinguish source facts from your own inference.
For innovation: turn concepts into feasible architecture, components, software modules, data flow, cost considerations, testing and future upgrades.
Never claim to have performed a real-world action you did not perform.
Return clear Markdown with headings, numbered steps and a final answer.`;

export async function POST(req: Request) {
  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({error:"GEMINI_API_KEY is not configured."},{status:500});

    const form = await req.formData();
    const prompt = String(form.get("prompt") || "Analyze the uploaded material and solve the problem.");
    const file = form.get("file");
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const parts:any[] = [{text: SYSTEM + "\n\nUSER REQUEST:\n" + prompt}];

    if (file instanceof File) {
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.length > 15 * 1024 * 1024) {
        return NextResponse.json({error:"File is larger than 15 MB. Please upload a smaller file."},{status:413});
      }
      parts.push({
        inline_data:{
          mime_type:file.type || "application/octet-stream",
          data:bytes.toString("base64")
        }
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          contents:[{role:"user",parts}],
          generationConfig:{temperature:0.2,topP:0.9,maxOutputTokens:8192}
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({error:data?.error?.message || "Gemini request failed."},{status:response.status});
    }

    const answer = data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text || "").join("\n").trim();
    if (!answer) return NextResponse.json({error:"The AI returned no answer."},{status:502});

    return NextResponse.json({answer, model});
  } catch (error) {
    return NextResponse.json({error:error instanceof Error ? error.message : "Unexpected server error."},{status:500});
  }
}