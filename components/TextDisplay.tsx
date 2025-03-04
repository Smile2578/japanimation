'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTranslator } from '../context/translatorContext';
import { Button } from '../components/ui/button';

// Type pour l'API Web Audio
type WebAudioAPI = {
  AudioContext: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

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
      className={`char-container inline-block px-0.5 transition-all duration-200 ease-in-out ${
        isActive ? 'opacity-100' : 'opacity-0'
      } ${isHighlighted ? 'bg-primary/20 rounded text-primary font-bold' : ''}`}
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
    ttsSpeed,
  } = useTranslator();

  const [visibleChars, setVisibleChars] = useState<number>(0);
  const [hasTTSSupport, setHasTTSSupport] = useState<boolean>(true);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const textContentRef = useRef<HTMLDivElement>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Vérifier la compatibilité TTS à l'initialisation
  useEffect(() => {
    checkTTSSupport();
    
    // Initialiser l'élément audio pour la solution de repli
    audioRef.current = new Audio();
    audioRef.current.onended = () => {
      setIsSpeaking(false);
    };
    audioRef.current.onerror = () => {
      setIsSpeaking(false);
      setAudioError("Erreur lors de la lecture audio");
    };
    
    // Créer un AudioContext pour les interactions mobiles
    const initAudioContext = () => {
      try {
        // Gestion correcte du préfixe webkit pour Safari
        const windowWithAudio = window as unknown as WebAudioAPI;
        const AudioContextClass = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
        
        if (AudioContextClass) {
          const context = new AudioContextClass();
          setAudioContext(context);
        }
      } catch (error) {
        console.error("AudioContext non supporté:", error);
      }
    };
    
    // Initialiser l'AudioContext au premier clic/tap (pour iOS)
    const handleUserInteraction = () => {
      if (!audioContext) {
        initAudioContext();
      }
      // Retirer les listeners après la première interaction
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
    
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);
    
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // Vérifier si le navigateur supporte le TTS
  const checkTTSSupport = () => {
    if (typeof window === 'undefined') {
      setHasTTSSupport(false);
      return;
    }
    
    const hasWebSpeech = 'speechSynthesis' in window;
    
    if (hasWebSpeech) {
      // Vérifier si des voix japonaises sont disponibles
      try {
        window.speechSynthesis.getVoices(); // Force la synchronisation des voix
        const hasJapaneseVoice = window.speechSynthesis.getVoices()
          .some(voice => voice.lang.includes('ja'));
        
        setHasTTSSupport(hasJapaneseVoice);
        
        // Sur certains navigateurs, les voix peuvent être chargées de façon asynchrone
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedHasJapaneseVoice = window.speechSynthesis.getVoices()
            .some(voice => voice.lang.includes('ja'));
          setHasTTSSupport(updatedHasJapaneseVoice);
        };
      } catch (error) {
        console.error("Erreur lors de la vérification des voix:", error);
        setHasTTSSupport(false);
      }
    } else {
      setHasTTSSupport(false);
    }
  };

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

  // Fonction de débogage du mapping
  const debugMapping = () => {
    if (translatedText && translatedText.length > 0) {
      console.log('==== DÉBOGAGE DU MAPPING DANS TEXT DISPLAY ====');
      console.log('Nombre total de mappings:', translatedText.length);
      
      // Créer une représentation visuelle du mapping
      const japaneseText = translatedText.map(item => item.japanese).join('');
      const phoneticText = translatedText.map(item => item.phonetic).join('');
      
      console.log('Texte japonais complet:', japaneseText);
      console.log('Texte phonétique complet:', phoneticText);
      
      // Afficher le tableau d'alignement pour visualiser la correspondance
      console.log('Tableau d\'alignement:');
      const alignmentTable = [];
      for (let i = 0; i < translatedText.length; i++) {
        alignmentTable.push({
          index: i,
          jap: translatedText[i].japanese,
          rom: translatedText[i].phonetic,
          unicode: translatedText[i].japanese.charCodeAt(0).toString(16)
        });
      }
      console.table(alignmentTable);
      console.log('==== FIN DU DÉBOGAGE DU MAPPING ====');
    }
  };

  // Gestion de l'animation
  useEffect(() => {
    if (!isAnimating || !translatedText.length) return;

    // Réinitialiser l'état avant de commencer une nouvelle animation
    setVisibleChars(0);
    setCurrentHighlightIndex(null);
    
    // Déboguer le mapping au début de l'animation
    debugMapping();
    
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

  // Utiliser l'API de synthèse vocale du navigateur
  const performNativeTTS = (text: string): boolean => {
    if (!window.speechSynthesis) return false;
    
    try {
      // Annuler toute instance précédente
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = ttsSpeed; 

      // Trouver une voix japonaise si disponible
      const voices = window.speechSynthesis.getVoices();
      const japaneseVoice = voices.find(voice => voice.lang.includes('ja'));
      if (japaneseVoice) {
        utterance.voice = japaneseVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
        setAudioError(null);
      };

      utterance.onerror = (event) => {
        console.error("Erreur TTS:", event);
        setIsSpeaking(false);
        setAudioError("Erreur lors de la synthèse vocale");
        
        // Tenter d'utiliser la solution de repli si l'API native échoue
        performFallbackTTS(text);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.error("Erreur lors de l'utilisation de l'API Web Speech:", error);
      return false;
    }
  };

  // Solution de repli utilisant l'API route serveur sécurisée
  const performFallbackTTS = async (text: string): Promise<boolean> => {
    try {
      setIsUsingFallback(true);
      
      // Appeler notre API route interne au lieu de VoiceRSS directement
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          rate: ttsSpeed
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || 'Erreur du service TTS');
      }
      
      // Création d'un blob audio à partir de la réponse
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        
        // Nettoyer les URL objectURL précédentes
        audioRef.current.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsSpeaking(false);
        };
        
        await audioRef.current.play();
        return true;
      }
      
      // Nettoyer l'URL si nous n'avons pas pu lire l'audio
      URL.revokeObjectURL(audioUrl);
      return false;
    } catch (error) {
      console.error("Erreur lors de l'utilisation du TTS de secours:", error);
      setAudioError(error instanceof Error ? error.message : "Le service de synthèse vocale n'est pas disponible");
      setIsSpeaking(false);
      setIsUsingFallback(false);
      return false;
    }
  };

  // Synthèse vocale avec solution hybride (native + repli)
  const speakJapanese = async () => {
    // Vérifier si le texte est disponible
    if (!translatedText.length || isSpeaking) return;
    
    // Effacer les erreurs précédentes
    setAudioError(null);
    
    // Extraire le texte japonais
    const japaneseText = translatedText.map((item) => item.japanese).join('');
    
    // Démarrer l'état de lecture
    setIsSpeaking(true);
    
    // Tenter d'utiliser l'API Web Speech native d'abord
    if (hasTTSSupport) {
      const nativeSuccess = performNativeTTS(japaneseText);
      
      // Si l'API native échoue, utiliser la solution de repli
      if (!nativeSuccess) {
        const fallbackSuccess = await performFallbackTTS(japaneseText);
        
        // Si les deux méthodes échouent
        if (!fallbackSuccess) {
          setIsSpeaking(false);
          setAudioError("La synthèse vocale n'est pas disponible sur votre appareil");
        }
      }
    } else {
      // Utiliser directement la solution de repli si l'API native n'est pas supportée
      const fallbackSuccess = await performFallbackTTS(japaneseText);
      
      if (!fallbackSuccess) {
        setIsSpeaking(false);
        setAudioError("La synthèse vocale n'est pas disponible sur votre appareil");
      }
    }
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
    <div className="text-display flex flex-col w-full max-w-full overflow-hidden">
      <div className="text-content relative bg-card rounded-xl p-4 md:p-6 shadow-md w-full overflow-auto" ref={textContentRef}>
        {translatedText.length > 0 ? (
          <>
            {/* Ligne japonaise */}
            <div className="japanese-line mb-4 text-xl md:text-2xl lg:text-3xl font-medium leading-loose break-all">
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
            <div className="phonetic-line text-sm md:text-base lg:text-lg text-muted-foreground leading-loose break-all">
              {translatedText.map((item, index) => (
                <TextChar
                  key={`ph-${index}`}
                  char={item.phonetic || '?'}
                  isActive={index < visibleChars}
                  isHighlighted={currentHighlightIndex === index}
                  index={index}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                />
              ))}
            </div>
            
            {/* Message d'information sur la phonétique */}
            {translatedText.some(item => item.phonetic === '[?]') ? (
              <div className="mt-2 text-xs text-amber-500 dark:text-amber-400">
                Note: Certains caractères ne peuvent pas être romanisés avec le dictionnaire. Utilisation du mode de secours.
              </div>
            ) : translatedText.some(item => !item.phonetic || item.phonetic === '?') ? (
              <div className="mt-2 text-xs text-amber-500 dark:text-amber-400">
                Note: Romanisation limitée pour certains caractères.
              </div>
            ) : (
              <div className="mt-2 text-xs text-emerald-500 dark:text-emerald-400">
                Phonétique fournie par Claude AI
              </div>
            )}
            
            {/* Message d'erreur audio si présent */}
            {audioError && (
              <div className="mt-2 text-xs text-red-500 dark:text-red-400">
                {audioError}
              </div>
            )}
            
            {/* Message de mode de repli TTS si actif */}
            {isUsingFallback && isSpeaking && (
              <div className="mt-2 text-xs text-amber-500 dark:text-amber-400">
                Utilisation du service de synthèse vocale alternatif
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground py-10">
            <p>Le texte traduit apparaîtra ici</p>
          </div>
        )}
      </div>

      {/* Contrôles */}
      <div className="flex flex-wrap justify-center mt-4 gap-2 md:gap-4">
        <Button
          onClick={speakJapanese}
          disabled={isSpeaking || !translatedText.length}
          className="button-primary w-full sm:w-auto"
        >
          {isSpeaking ? (
            <span className="flex items-center justify-center">
              <span className="h-2 w-2 mr-2 rounded-full bg-white relative overflow-hidden">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              </span>
              Lecture...
            </span>
          ) : (
            <span className="flex items-center justify-center">
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
          className="button-primary w-full sm:w-auto"
        >
          <span className="flex items-center justify-center">
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