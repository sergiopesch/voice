export type UserRole = 'admin' | 'user';

export interface User {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
    avatar_url?: string;
}

export type AIProvider = 'openai' | 'google' | 'mistral';

export interface AIModel {
    id: string;
    name: string;
    provider: AIProvider;
    description: string;
    maxTokens: number;
    contextWindow?: number;
}

export interface VoiceState {
    isListening: boolean;
    isProcessing: boolean;
    transcription: string;
    showTranscription: boolean;
    error: string | null;
}

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
} 