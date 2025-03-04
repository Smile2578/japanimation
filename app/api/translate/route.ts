import { NextRequest, NextResponse } from 'next/server';
import { translateWithClaude } from '@/services/anthropicService';

// Constantes pour la validation des entrées
const MAX_TEXT_LENGTH = 1000; // Limite plus élevée côté serveur pour tenir compte des différents clients

// Fonction utilitaire de validation des entrées
function validateInput(text: string): { isValid: boolean; message: string | null } {
  // Vérifier la longueur du texte
  if (!text || text.length === 0) {
    return { isValid: false, message: 'Le texte à traduire est requis' };
  }
  
  if (text.length > MAX_TEXT_LENGTH) {
    return { 
      isValid: false, 
      message: `Le texte ne doit pas dépasser ${MAX_TEXT_LENGTH} caractères` 
    };
  }
  
  // Vérifier les contenus potentiellement dangereux
  if (/<script|<iframe|javascript:|data:/i.test(text)) {
    return { 
      isValid: false, 
      message: 'Le texte contient des éléments non autorisés' 
    };
  }
  
  return { isValid: true, message: null };
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const { text, sourceLang, targetLang, formalityLevel } = await request.json();

    // Validation des entrées
    const validation = validateInput(text);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    if (!targetLang) {
      return NextResponse.json(
        { error: 'La langue cible est requise' },
        { status: 400 }
      );
    }

    // Adapter les codes de langue pour la requête
    const sourceLanguage = sourceLang === 'auto' 
      ? 'automatiquement détectée' 
      : sourceLang === 'ja' 
        ? 'japonais' 
        : sourceLang === 'fr' 
          ? 'français' 
          : 'anglais';
    
    const targetLanguage = targetLang === 'ja' 
      ? 'japonais' 
      : targetLang === 'fr' 
        ? 'français' 
        : 'anglais';
    
    // Définir les instructions de style en fonction du niveau de formalité
    let styleInstructions = '';
    
    switch (formalityLevel) {
      case 'formal':
        styleInstructions = `IMPORTANT: Utilise un style de langage formel, respectueux et soutenu. 
        Préfère les formulations polies, utilise des expressions respectueuses. 
        Si la traduction est en japonais, utilise des formes honorifiques et les terminaisons polies (desu/masu).`;
        break;
      case 'neutral':
        styleInstructions = `IMPORTANT: Utilise un style de langage standard et neutre.
        Ni trop formel, ni trop familier, adapté à un contexte professionnel ou éducatif.
        Si la traduction est en japonais, utilise un niveau de politesse standard.`;
        break;
      case 'casual':
        styleInstructions = `IMPORTANT: Utilise un style de langage familier, décontracté et conversationnel.
        Utilise des expressions du quotidien, comme on parlerait à un ami.
        Si la traduction est en japonais, utilise des formes courtes et informelles.`;
        break;
      default:
        styleInstructions = `IMPORTANT: Utilise un style de langage standard et neutre.`;
    }

    // Construction du prompt pour la traduction
    const prompt = `Traduis le texte suivant de ${sourceLanguage} vers ${targetLanguage}.
    
    ${styleInstructions}
    
    Ne traduis que le texte fourni, sans ajouter d'explications ou de commentaires.
    Assure-toi que la traduction est précise et naturelle dans la langue cible.
    
    Texte à traduire : "${text}"
    
    Traduction :`;

    console.log('Envoi du prompt de traduction à Claude');
    const translatedText = await translateWithClaude(prompt);
    console.log('Réponse reçue de Claude');

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la traduction' },
      { status: 500 }
    );
  }
}

// Route pour la romanisation
export async function PUT(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const { japaneseText } = await request.json();

    // Validation des entrées
    const validation = validateInput(japaneseText);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Construction du prompt pour la romanisation
    const prompt = `Convertis le texte japonais suivant en romaji (romanisation du japonais).

    Voici quelques règles à suivre :
    - Utilise le système Hepburn modifié pour la romanisation
    - Pour les sons longs, utilise des macrons pour les voyelles longues (ā, ī, ū, ē, ō) ou double les voyelles (aa, ii, uu, ee, oo)
    - N'utilise que le romaji, sans explications ni commentaires
    - Ne traduis pas le texte, conserve le sens original
    - Si le texte contient des caractères non-japonais (comme des chiffres ou mots étrangers), laisse-les tels quels

    Texte japonais : "${japaneseText}"

    Romaji :`;

    console.log('Envoi du prompt de romanisation à Claude');
    const romajiText = await translateWithClaude(prompt);
    console.log('Réponse reçue de Claude');

    return NextResponse.json({ romajiText });
  } catch (error) {
    console.error('Erreur lors de la romanisation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la romanisation' },
      { status: 500 }
    );
  }
} 