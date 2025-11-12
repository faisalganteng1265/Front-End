import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('General API route called');
    const { message, history } = await request.json();
    console.log('Message received:', message);

    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('API key not found in environment');
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    console.log('API key found, initializing Groq for general mode...');

    // System prompt untuk mode umum (general)
    const generalSystemPrompt = `Kamu adalah asisten AI yang cerdas dan membantu.
Jawab pertanyaan dengan informatif, akurat, dan ramah.
Gunakan bahasa Indonesia yang baik dan mudah dipahami.
Kamu bisa menjawab berbagai topik: teknologi, sains, budaya, kehidupan sehari-hari, dan lainnya.`;

    // Build conversation history - filter welcome messages
    const chatHistory = (history || [])
      .filter((msg: any) => {
        const content = msg.content || '';
        // Filter welcome message untuk mode umum
        return !content.includes('Halo! Saya asisten AI yang siap membantu');
      })
      .slice(-10) // Only keep last 10 messages for context
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

    // Build messages array with system prompt
    const messages = [
      {
        role: 'system' as const,
        content: generalSystemPrompt,
      },
      ...chatHistory,
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile', // Fast and good quality
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
    });

    const text = completion.choices[0]?.message?.content || 'Maaf, tidak ada respons.';

    console.log('General mode response generated successfully');
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Error in general chat API:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
