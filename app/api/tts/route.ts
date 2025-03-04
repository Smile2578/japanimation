import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extraire le texte à prononcer de la requête
    const { text, rate = 0.8 } = await request.json();
    
    // Vérifier que le texte est présent
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Le paramètre text est requis et doit être une chaîne' },
        { status: 400 }
      );
    }
    
    // Vérifier que la clé API est configurée
    const API_KEY = process.env.VOICERSS_API_KEY;
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'La clé API du service TTS n\'est pas configurée' },
        { status: 500 }
      );
    }
    
    // Limiter la taille du texte pour éviter les abus
    if (text.length > 1000) {
      return NextResponse.json(
        { error: 'Le texte est trop long (maximum 1000 caractères)' },
        { status: 400 }
      );
    }
    
    // Paramètres de la requête VoiceRSS
    const ttsRate = Math.floor(Number(rate) * 10) / 10; // Arrondir à 1 décimale
    const encodedText = encodeURIComponent(text);
    const url = `https://api.voicerss.org/?key=${API_KEY}&hl=ja-jp&src=${encodedText}&r=${ttsRate}&c=mp3&f=16khz_16bit_mono`;
    
    // Appeler l'API VoiceRSS
    const response = await fetch(url);
    
    // Vérifier si la réponse est valide
    if (!response.ok) {
      // Journaliser l'erreur pour le débogage côté serveur
      console.error('Erreur VoiceRSS:', response.status, await response.text());
      
      return NextResponse.json(
        { error: 'Erreur du service de synthèse vocale' },
        { status: response.status }
      );
    }
    
    // Obtenir le contenu binaire
    const audioBuffer = await response.arrayBuffer();
    
    // Renvoyer le contenu audio avec les entêtes appropriés
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400' // Mettre en cache pendant 24h
      }
    });
  } catch (error) {
    // Journaliser l'erreur pour le débogage
    console.error('Erreur du service TTS:', error);
    
    // Renvoyer une réponse d'erreur générique
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la requête TTS' },
      { status: 500 }
    );
  }
} 