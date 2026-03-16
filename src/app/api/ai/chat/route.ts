import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("Chat API Request started");
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("Chat API: GEMINI_API_KEY is missing");
      return NextResponse.json({ 
        error: "API Key not configured. Please add GEMINI_API_KEY to your Vercel settings." 
      }, { status: 500 });
    }

    const body = await req.json();
    console.log("Chat API: Received body:", JSON.stringify(body, null, 2));
    const { message, history, code, language } = body;

    if (!message) {
      console.error("Chat API: No message provided");
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    console.log("Chat API: Initializing Gemini with gemini-pro");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Chat API: Starting chat with history count:", history?.length || 0);
    // Ensure history starts with a 'user' role and has correct format
    const cleanedHistory = (history || [])
      .filter((msg: any, index: number) => {
        if (index === 0 && msg.role !== "user") return false;
        return msg.role && msg.parts && Array.isArray(msg.parts);
      })
      .map((msg: any) => ({
        role: msg.role,
        parts: msg.parts.map((p: any) => ({ text: p.text || String(p) }))
      }));

    console.log("Chat API: Starting chat with cleaned history count:", cleanedHistory.length);
    const chat = model.startChat({
      history: cleanedHistory,
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    let fullMessage = message;
    if (code) {
      fullMessage = `CONTEXT: The user is currently looking at this ${language || "code"} snippet:\n\n${code}\n\nUSER MESSAGE: ${message}`;
    }

    console.log("Chat API: Sending message...");
    const result = await chat.sendMessage(fullMessage);
    const response = await result.response;
    const text = response.text();

    console.log("Chat API: Success!");
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Chat API: Critical error:", error);
    return NextResponse.json({ 
      error: "Chat failed. Please try again.", 
      details: error.message 
    }, { status: 500 });
  }
}
