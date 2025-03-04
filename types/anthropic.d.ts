// translatoranimator/types/anthropic.d.ts
declare module '@anthropic-ai/sdk' {
  export interface MessageParams {
    model: string;
    max_tokens: number;
    system?: string;
    messages: {
      role: 'user' | 'assistant';
      content: string;
    }[];
  }

  export interface ContentBlock {
    type: string;
    text: string;
  }

  export interface Message {
    id: string;
    type: string;
    role: string;
    content: ContentBlock[];
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  }

  export interface MessagesClient {
    create: (params: MessageParams) => Promise<Message>;
  }

  export interface AnthropicOptions {
    apiKey: string;
  }

  export default class Anthropic {
    constructor(options: AnthropicOptions);
    messages: MessagesClient;
  }
} 