import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("AI Optimize: Starting request...");
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("AI Optimize Error: GEMINI_API_KEY is missing.");
      return NextResponse.json({ 
        error: "API Key not configured. Please add GEMINI_API_KEY to your Vercel/environment settings." 
      }, { status: 500 });
    }

    const body = await req.json();
    const { code, language } = body;
    console.log(`AI Optimize: Received code for language: ${language || "unknown"}`);

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    console.log("AI Optimize: Initializing Gemini model...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

    console.log("AI Optimize: Sending content to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    console.log("AI Optimize: Generated content successfully.");

    // Clean up markdown code blocks if the AI accidentally included them
    if (text.startsWith("```") && text.endsWith("```")) {
      const lines = text.split("\n");
      text = lines.slice(1, -1).join("\n");
    }

    return NextResponse.json({ optimizedCode: text });
  } catch (error: any) {
    console.error("AI Optimize Critical Error:", error);
    return NextResponse.json({ 
      error: "AI processing failed. Check internal logs for details.", 
      details: error.message 
    }, { status: 500 });
  }
}
