import { anthropic } from '@/lib/claude/client';
import { buildSystemPrompt, type TutorContext } from '@/lib/claude/prompts';
import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json() as {
      messages: { role: 'user' | 'assistant'; content: string }[];
      context: TutorContext;
    };

    const systemPrompt = buildSystemPrompt(context);

    // Filter out empty assistant messages (streaming placeholders)
    const cleanMessages = messages.filter(
      (m) => m.content.trim().length > 0
    );

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: cleanMessages,
    });

    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Tutor API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to connect to CodeBot' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
