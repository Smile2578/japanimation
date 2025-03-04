'use client';

import React, { useState } from 'react';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTranslator } from '../context/translatorContext';
import { translateText } from '../services/translationService';

const TranslatorInput: React.FC = () => {
  const {
    inputText,
    setInputText,
    inputLanguage,
    setInputLanguage,
    setTranslatedText,
    setIsAnimating,
    isAnimating,
  } = useTranslator();

  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fonction pour gérer la traduction
  const handleTranslate = async () => {
    if (!inputText.trim() || isTranslating || isAnimating) return;

    setIsTranslating(true);
    setErrorMessage(null);

    try {
      let targetLang: string;
      
      // Déterminer la langue cible
      if (inputLanguage === 'ja') {
        // Si le texte d'entrée est en japonais, traduire vers le français
        targetLang = 'fr';
      } else {
        // Sinon, traduire vers le japonais
        targetLang = 'ja';
      }

      // Appel à l'API de traduction avec le texte d'entrée et la langue source
      const result = await translateText(targetLang, inputText, inputLanguage);
      setTranslatedText(result);
      
      // Démarrer automatiquement l'animation
      setIsAnimating(true);
    } catch (error) {
      console.error('Erreur lors de la traduction:', error);
      // Afficher le message d'erreur à l'utilisateur
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 mb-8 shadow-md">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">
            Texte à traduire
          </h2>
          <Select
            value={inputLanguage}
            onValueChange={(value) => setInputLanguage(value as 'auto' | 'ja' | 'fr' | 'en')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Langue d'entrée" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Détection automatique</SelectItem>
              <SelectItem value="ja">Japonais</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">Anglais</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Textarea
          placeholder="Entrez votre texte ici..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-[120px] resize-y bg-secondary text-foreground text-lg p-4 border-none focus:ring-primary"
        />
        
        {errorMessage && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
            {errorMessage}
          </div>
        )}
        
        <button
          onClick={handleTranslate}
          disabled={!inputText.trim() || isTranslating || isAnimating}
          className="button-primary w-full"
        >
          {isTranslating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Traduction en cours...
            </span>
          ) : (
            'Traduire et animer'
          )}
        </button>
      </div>
    </div>
  );
};

export default TranslatorInput; 