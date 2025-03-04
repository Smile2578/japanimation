'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TextMapping {
  japanese: string;
  phonetic: string;
  index: number;
}

export type FormalityLevel = 'formal' | 'neutral' | 'casual';

export interface TranslatorContextType {
  inputText: string;
  setInputText: (text: string) => void;
  translatedText: TextMapping[];
  setTranslatedText: (translatedText: TextMapping[]) => void;
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
  visibleChars: number;
  setVisibleChars: (visibleChars: number) => void;
  inputLanguage: 'auto' | 'ja' | 'fr' | 'en';
  setInputLanguage: (lang: 'auto' | 'ja' | 'fr' | 'en') => void;
  formalityLevel: FormalityLevel;
  setFormalityLevel: (level: FormalityLevel) => void;
  isTranslating: boolean;
  setIsTranslating: (isTranslating: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (error: string | null) => void;
  dictionaryWarning: boolean;
  setDictionaryWarning: (warning: boolean) => void;
  charSpeed: number;
  setCharSpeed: (speed: number) => void;
  highlightDuration: number;
  setHighlightDuration: (duration: number) => void;
  ttsSpeed: number;
  setTtsSpeed: (speed: number) => void;
  isDarkTheme: boolean;
  setIsDarkTheme: (isDark: boolean) => void;
  isSpeaking: boolean;
  setIsSpeaking: (isSpeaking: boolean) => void;
  currentHighlightIndex: number | null;
  setCurrentHighlightIndex: (index: number | null) => void;
  loadUserPreferences: () => void;
  saveUserPreferences: () => void;
}

const TranslatorContext = createContext<TranslatorContextType | undefined>(undefined);

interface TranslatorProviderProps {
  children: ReactNode;
}

export const TranslatorProvider = ({ children }: TranslatorProviderProps) => {
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<TextMapping[]>([]);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [visibleChars, setVisibleChars] = useState<number>(0);
  const [inputLanguage, setInputLanguage] = useState<'auto' | 'ja' | 'fr' | 'en'>('auto');
  const [formalityLevel, setFormalityLevel] = useState<FormalityLevel>('neutral');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dictionaryWarning, setDictionaryWarning] = useState<boolean>(false);
  const [charSpeed, setCharSpeed] = useState<number>(100);
  const [highlightDuration, setHighlightDuration] = useState<number>(300);
  const [ttsSpeed, setTtsSpeed] = useState<number>(1);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState<number | null>(null);

  const loadUserPreferences = () => {
    if (typeof window === 'undefined') return;
    
    const theme = localStorage.getItem('theme');
    if (theme) {
      setIsDarkTheme(theme === 'dark');
    }
    
    const savedCharSpeed = localStorage.getItem('charSpeed');
    if (savedCharSpeed) {
      setCharSpeed(parseInt(savedCharSpeed, 10));
    }
    
    const savedHighlightDuration = localStorage.getItem('highlightDuration');
    if (savedHighlightDuration) {
      setHighlightDuration(parseInt(savedHighlightDuration, 10));
    }
    
    const savedTtsSpeed = localStorage.getItem('ttsSpeed');
    if (savedTtsSpeed) {
      setTtsSpeed(parseFloat(savedTtsSpeed));
    }
    
    const savedInputLanguage = localStorage.getItem('inputLanguage');
    if (savedInputLanguage) {
      setInputLanguage(savedInputLanguage as 'auto' | 'ja' | 'fr' | 'en');
    }
    
    const savedFormalityLevel = localStorage.getItem('formalityLevel');
    if (savedFormalityLevel) {
      setFormalityLevel(savedFormalityLevel as FormalityLevel);
    }
  };

  const saveUserPreferences = () => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
    localStorage.setItem('charSpeed', charSpeed.toString());
    localStorage.setItem('highlightDuration', highlightDuration.toString());
    localStorage.setItem('ttsSpeed', ttsSpeed.toString());
    localStorage.setItem('inputLanguage', inputLanguage);
    localStorage.setItem('formalityLevel', formalityLevel);
  };

  useEffect(() => {
    loadUserPreferences();
  }, []);
  
  // Mise à jour du thème quand isDarkTheme change
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const value = {
    inputText,
    setInputText,
    translatedText,
    setTranslatedText,
    isAnimating,
    setIsAnimating,
    visibleChars,
    setVisibleChars,
    inputLanguage,
    setInputLanguage,
    formalityLevel,
    setFormalityLevel,
    isTranslating,
    setIsTranslating,
    errorMessage,
    setErrorMessage,
    dictionaryWarning,
    setDictionaryWarning,
    charSpeed,
    setCharSpeed,
    highlightDuration,
    setHighlightDuration,
    ttsSpeed,
    setTtsSpeed,
    isDarkTheme,
    setIsDarkTheme,
    isSpeaking,
    setIsSpeaking,
    currentHighlightIndex,
    setCurrentHighlightIndex,
    loadUserPreferences,
    saveUserPreferences
  };

  return (
    <TranslatorContext.Provider value={value}>
      {children}
    </TranslatorContext.Provider>
  );
};

export const useTranslator = (): TranslatorContextType => {
  const context = useContext(TranslatorContext);
  if (context === undefined) {
    throw new Error('useTranslator must be used within a TranslatorProvider');
  }
  return context;
}; 