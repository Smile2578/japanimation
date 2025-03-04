import { NextRequest, NextResponse } from 'next/server';
import { translateWithClaude } from '../../../services/anthropicService';

export async function POST(request: NextRequest) {
  try {
    // Extraire les données de la requête
    const data = await request.json();
    const { text, sourceLanguage, targetLanguage } = data;

    // Valider les données d'entrée
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Le texte et la langue cible sont requis' },
        { status: 400 }
      );
    }

    // Appeler le service de traduction
    const translatedText = await translateWithClaude(
      text, 
      sourceLanguage || 'auto', 
      targetLanguage
    );

    // Renvoyer uniquement le texte traduit
    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error('Erreur API de traduction:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 