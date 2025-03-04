'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useTranslator } from '../context/translatorContext';
import { translateText } from '../services/translationService';
import { FormalityLevel } from '../context/translatorContext';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

// Constantes pour la limitation de l'input
const MAX_INPUT_LENGTH = 500; // Limite de caractères pour l'input
const INPUT_COOLDOWN_MS = 2000; // Temps de refroidissement entre les requêtes (2 secondes)

const TranslatorInput: React.FC = () => {
  const {
    inputText,
    setInputText,
    inputLanguage,
    setInputLanguage,
    formalityLevel,
    setFormalityLevel,
    setTranslatedText,
    setIsAnimating,
    isAnimating,
  } = useTranslator();

  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTranslationTime, setLastTranslationTime] = useState<number>(0);
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour valider le texte d'entrée
  const validateInput = (text: string): { isValid: boolean; message: string | null } => {
    // Vérifier la longueur maximale
    if (text.length > MAX_INPUT_LENGTH) {
      return { 
        isValid: false, 
        message: `Le texte ne doit pas dépasser ${MAX_INPUT_LENGTH} caractères.` 
      };
    }

    // Vérifier les caractères spéciaux potentiellement dangereux (comme les tags HTML)
    if (/<script|<iframe|javascript:/i.test(text)) {
      return { 
        isValid: false, 
        message: "Le texte contient des caractères non autorisés." 
      };
    }

    return { isValid: true, message: null };
  };

  // Gestion du timer de cooldown
  useEffect(() => {
    if (remainingCooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        const newRemaining = Math.max(0, 
          lastTranslationTime + INPUT_COOLDOWN_MS - Date.now());
        setRemainingCooldown(newRemaining);
        
        if (newRemaining === 0 && cooldownTimerRef.current) {
          clearInterval(cooldownTimerRef.current);
        }
      }, 100);
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [remainingCooldown, lastTranslationTime]);

  // Gérer le changement de texte avec validation
  const handleTextChange = (text: string) => {
    const validation = validateInput(text);
    
    if (!validation.isValid) {
      setErrorMessage(validation.message);
    } else if (errorMessage && !/<script|<iframe|javascript:/i.test(text)) {
      setErrorMessage(null);
    }
    
    // Mettre à jour le texte même s'il y a une erreur de validation
    // pour permettre à l'utilisateur de le corriger
    setInputText(text);
  };

  // Fonction pour gérer la traduction
  const handleTranslate = async () => {
    // Vérifier le refroidissement entre les requêtes
    const now = Date.now();
    const timeSinceLastTranslation = now - lastTranslationTime;
    
    if (timeSinceLastTranslation < INPUT_COOLDOWN_MS) {
      const cooldownRemaining = INPUT_COOLDOWN_MS - timeSinceLastTranslation;
      setRemainingCooldown(cooldownRemaining);
      setErrorMessage(`Veuillez attendre ${Math.ceil(cooldownRemaining / 1000)} secondes avant de traduire à nouveau.`);
      return;
    }

    // Valider l'entrée avant de traduire
    const validation = validateInput(inputText);
    if (!validation.isValid) {
      setErrorMessage(validation.message);
      return;
    }

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

      // Appel à l'API de traduction avec le texte d'entrée, la langue source et le niveau de formalité
      const result = await translateText(
        targetLang, 
        inputText, 
        inputLanguage,
        formalityLevel
      );
      
      // Mettre à jour le timestamp de dernière traduction
      setLastTranslationTime(Date.now());
      
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
    <div className="bg-card rounded-xl p-4 md:p-6 mb-4 md:mb-8 shadow-md">
      <div className="flex flex-col space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg md:text-xl font-bold text-primary">
            Texte à traduire
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={inputLanguage}
              onValueChange={(value) => setInputLanguage(value as 'auto' | 'ja' | 'fr' | 'en')}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Langue d'entrée" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatique</SelectItem>
                <SelectItem value="ja">Japonais</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">Anglais</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={formalityLevel}
              onValueChange={(value) => setFormalityLevel(value as FormalityLevel)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Niveau de formalité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formel</SelectItem>
                <SelectItem value="neutral">Neutre</SelectItem>
                <SelectItem value="casual">Familier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Textarea
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Entrez votre texte ici..."
          className="min-h-[120px] md:min-h-[150px] resize-y"
          maxLength={MAX_INPUT_LENGTH}
        />
        
        {/* Compteur de caractères */}
        <div className="text-xs text-muted-foreground text-right">
          {inputText.length}/{MAX_INPUT_LENGTH} caractères
        </div>

        {errorMessage && (
          <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <Button
          onClick={handleTranslate}
          disabled={isTranslating || isAnimating || !inputText.trim() || !!errorMessage || remainingCooldown > 0}
          className="w-full"
        >
          {isTranslating ? 'Traduction en cours...' : remainingCooldown > 0 
            ? `Attendre (${Math.ceil(remainingCooldown / 1000)}s)` 
            : 'Traduire'}
        </Button>
      </div>
    </div>
  );
};

export default TranslatorInput; 