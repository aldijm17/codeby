import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert software engineer. Optimize the following ${language || "code"} snippet.
      Rules:
      1. Refactor for better performance and readability.
      2. Add concise and helpful comments.
      3. Ensure best practices for the specific language.
      4. DO NOT change the core functionality.
      5. ONLY return the optimized code, no explanations or markdown backticks unless they are part of the comments.
      
      CODE TO OPTIMIZE:
      ${code}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean up markdown code blocks if the AI accidentally included them
    if (text.startsWith("```") && text.endsWith("```")) {
      const lines = text.split("\n");
      text = lines.slice(1, -1).join("\n");
    }

    return NextResponse.json({ optimizedCode: text });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: error.message || "AI processing failed" }, { status: 500 });
  }
}
