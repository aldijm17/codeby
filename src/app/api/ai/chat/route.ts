import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "API Key not configured. Please add GEMINI_API_KEY to your Vercel settings." 
      }, { status: 500 });
    }

    const { message, history, code, language } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: history || [],
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    // Provide context about the current snippet if it's a new chat or context is needed
    let fullMessage = message;
    if (code) {
      fullMessage = `CONTEXT: The user is currently looking at this ${language || "code"} snippet:\n\n${code}\n\nUSER MESSAGE: ${message}`;
    }

    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ 
      error: "Chat failed. Please try again.", 
      details: error.message 
    }, { status: 500 });
  }
}
