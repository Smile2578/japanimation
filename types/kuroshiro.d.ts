// src/types/kuroshiro.d.ts
declare module 'kuroshiro' {
  export interface KuroshiroConfig {
    to: 'hiragana' | 'katakana' | 'romaji';
    mode: 'normal' | 'spaced' | 'okurigana' | 'furigana';
    romajiSystem?: 'nippon' | 'passport' | 'hepburn';
  }

  export default class Kuroshiro {
    constructor();
    init(analyzer: unknown): Promise<void>;
    convert(text: string, options: KuroshiroConfig): Promise<string>;
    _analyzer: {
      tokenize: (text: string) => Promise<Array<{
        surface_form: string;
        reading?: string;
        pos?: string;
      }>>;
    };
  }
}

declare module 'kuroshiro-analyzer-kuromoji' {
  export default class KuromojiAnalyzer {
    constructor(options?: { dictPath?: string });
    init(): Promise<void>;
    tokenize(text: string): Promise<Array<{
      surface_form: string;
      reading?: string;
      pos?: string;
    }>>;
  }
} 