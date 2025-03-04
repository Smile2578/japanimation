import { NextRequest, NextResponse } from 'next/server';
import { translateWithClaude } from '@/services/anthropicService';

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données de la requête
    const { text, sourceLang, targetLang, formalityLevel } = await request.json();

    // Vérifier que les données nécessaires sont présentes
    if (!text) {
      return NextResponse.json(
        { error: 'Le texte à traduire est requis' },
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
        styleInstructions = `IMPORTANT: Utilise un style de langage courant, naturel et informel.
        Préfère les expressions familières et quotidiennes plutôt que des formulations polies ou soutenues.
        Si la traduction est en japonais, utilise un langage décontracté et les formes courtes.`;
        break;
      default:
        styleInstructions = `IMPORTANT: Utilise un style de langage standard et neutre.`;
    }

    // Construire le prompt pour Claude
    const prompt = `Traduis le texte suivant de ${sourceLanguage} vers ${targetLanguage}. 
    
    ${styleInstructions}
    
    Ne fournis que la traduction, sans autre commentaire ni contexte.
      
    Texte à traduire: "${text}"`;

    // Appeler le service de traduction
    const translatedText = await translateWithClaude(prompt);

    // Retourner la réponse
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la traduction' },
      { status: 500 }
    );
  }
}

// Route pour la romanisation
export async function PUT(request: NextRequest) {
  try {
    // Récupérer le texte japonais
    const { japaneseText } = await request.json();

    // Vérifier que le texte est présent
    if (!japaneseText) {
      return NextResponse.json(
        { error: 'Le texte japonais est requis' },
        { status: 400 }
      );
    }

    // Construire le prompt pour Claude
    const prompt = `Convertis le texte japonais suivant en romaji (alphabet latin). Assure-toi de donner la romanisation la plus précise pour chaque caractère. Ne fournis que la romanisation, sans autre commentaire ni contexte.
    
    Texte japonais: "${japaneseText}"`;

    // Appeler le service de romanisation
    const romajiText = await translateWithClaude(prompt);

    // Retourner la réponse
    return NextResponse.json({ romajiText });
  } catch (error) {
    console.error('Erreur lors de la romanisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne lors de la romanisation' },
      { status: 500 }
    );
  }
} 