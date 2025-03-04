'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTranslator } from '../context/translatorContext';
import { Button } from '../components/ui/button';

interface TextCharProps {
  char: string;
  isActive: boolean;
  isHighlighted: boolean;
  index: number;
  onMouseEnter: (index: number) => void;
  onMouseLeave: () => void;
}

const TextChar: React.FC<TextCharProps> = ({
  char,
  isActive,
  isHighlighted,
  index,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <span
      className={`char-container ${isActive ? 'active' : ''} ${isHighlighted ? 'highlight' : ''}`}
      onMouseEnter={() => onMouseEnter(index)}
      onMouseLeave={onMouseLeave}
    >
      {char}
    </span>
  );
};

const TextDisplay: React.FC = () => {
  const {
    translatedText,
    charSpeed,
    highlightDuration,
    isAnimating,
    setIsAnimating,
    isSpeaking,
    setIsSpeaking,
    currentHighlightIndex,
    setCurrentHighlightIndex,
  } = useTranslator();

  const [visibleChars, setVisibleChars] = useState<number>(0);
  const textContentRef = useRef<HTMLDivElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Nettoyage des intervalles et timeouts
  const clearAllTimers = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
      animationIntervalRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Gestion de l'animation
  useEffect(() => {
    if (!isAnimating || !translatedText.length) return;

    // Réinitialiser l'état avant de commencer une nouvelle animation
    setVisibleChars(0);
    setCurrentHighlightIndex(null);
    
    let charIndex = 0;
    const totalChars = translatedText.length;

    // Nettoyer les timers existants
    clearAllTimers();

    animationIntervalRef.current = setInterval(() => {
      if (charIndex < totalChars) {
        setVisibleChars(charIndex + 1);
        setCurrentHighlightIndex(charIndex);

        // Suppression du surlignage après la durée spécifiée
        timeoutRef.current = setTimeout(() => {
          setCurrentHighlightIndex(null);
        }, highlightDuration);

        charIndex++;
      } else {
        setIsAnimating(false);
        clearAllTimers();
      }
    }, charSpeed);

    // Nettoyer les intervalles au démontage du composant
    return () => {
      clearAllTimers();
    };
  }, [
    isAnimating,
    translatedText,
    charSpeed,
    highlightDuration,
    setIsAnimating,
    setCurrentHighlightIndex,
  ]);

  // Fonction pour démarrer l'animation
  const startAnimation = () => {
    // Arrêter toute animation en cours avant d'en démarrer une nouvelle
    clearAllTimers();
    setVisibleChars(0);
    setCurrentHighlightIndex(null);
    setIsAnimating(true);
  };

  // Synthèse vocale
  const speakJapanese = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isSpeaking) return;

    if (!translatedText.length) return;

    const japaneseText = translatedText.map((item) => item.japanese).join('');

    // Annuler toute instance précédente
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(japaneseText);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.8; // Légèrement plus lent

    setIsSpeaking(true);

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Gestion du survol
  const handleMouseEnter = (index: number) => {
    if (!isAnimating) {
      setCurrentHighlightIndex(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isAnimating) {
      setCurrentHighlightIndex(null);
    }
  };

  return (
    <div className="text-display">
      <div className="text-content" ref={textContentRef}>
        {translatedText.length > 0 ? (
          <>
            {/* Ligne japonaise */}
            <div className="japanese-line">
              {translatedText.map((item, index) => (
                <TextChar
                  key={`jp-${index}`}
                  char={item.japanese}
                  isActive={index < visibleChars}
                  isHighlighted={currentHighlightIndex === index}
                  index={index}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>

            {/* Ligne phonétique */}
            <div className="phonetic-line">
              {translatedText.map((item, index) => (
                <TextChar
                  key={`ph-${index}`}
                  char={item.phonetic}
                  isActive={index < visibleChars}
                  isHighlighted={currentHighlightIndex === index}
                  index={index}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <p>Le texte traduit apparaîtra ici</p>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="flex justify-center mt-6 gap-4">
        <Button
          onClick={speakJapanese}
          disabled={isSpeaking || !translatedText.length}
          className="button-primary"
        >
          {isSpeaking ? (
            <span className="flex items-center">
              <span className="h-2 w-2 mr-2 rounded-full bg-white relative overflow-hidden">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              </span>
              Lecture...
            </span>
          ) : (
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-2"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
              Prononcer
            </span>
          )}
        </Button>
        <Button
          onClick={startAnimation}
          disabled={isAnimating || !translatedText.length}
          className="button-primary"
        >
          <span className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mr-2"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Animer
          </span>
        </Button>
      </div>
    </div>
  );
};

export default TextDisplay;