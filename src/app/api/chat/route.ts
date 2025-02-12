import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MistralClient } from '@mistralai/mistralai';
import { AIModel } from '@/types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const mistral = new MistralClient(process.env.MISTRAL_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { message, model } = await req.json();
        const selectedModel = model as AIModel;

        if (!message) {
            return NextResponse.json(
                { error: 'No message provided' },
                { status: 400 }
            );
        }

        let response: string;

        switch (selectedModel.provider) {
            case 'openai':
                const completion = await openai.chat.completions.create({
                    model: selectedModel.id,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant engaging in voice conversation. Keep responses concise and natural, as they will be spoken aloud.',
                        },
                        {
                            role: 'user',
                            content: message,
                        },
                    ],
                    max_tokens: selectedModel.maxTokens,
                    temperature: 0.7,
                });
                response = completion.choices[0]?.message?.content || '';
                break;

            case 'mistral':
                const mistralResponse = await mistral.chat({
                    model: selectedModel.id,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant engaging in voice conversation. Keep responses concise and natural, as they will be spoken aloud.',
                        },
                        {
                            role: 'user',
                            content: message,
                        },
                    ],
                    max_tokens: selectedModel.maxTokens,
                    temperature: 0.7,
                });
                response = mistralResponse.choices[0]?.message?.content || '';
                break;

            case 'google':
                // Handle Google models (implementation depends on Gemini API)
                throw new Error('Google models not yet implemented');

            default:
                throw new Error('Unsupported model provider');
        }

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json(
            { error: 'Failed to get AI response' },
            { status: 500 }
        );
    }
} 