import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    const geminiPrompt = `
        You're a social media content writer. Given a topic, generate two versions of a post:
        1. A short, crisp anf engaging post for Twitter (280 characters max).
        2. A slightly longer and expressive post for Instagram.

        Topic: ${prompt}

        Return the result in this format:

        [Twitter]
        <your tweet text here>

        [Instagram]
        <your Instagram post text here>
        `;


    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: geminiPrompt
    });


    return NextResponse.json({ message: response.text, raw: response });
  } catch (error) {
    console.log(error)

    return error
  }
}
