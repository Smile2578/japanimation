import Anthropic from '@anthropic-ai/sdk';

// Vérifier si la clé API Anthropic est disponible
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// Vérification côté serveur
if (typeof window !== 'undefined' && !process.env.JEST_WORKER_ID) {
  console.warn('Le service Anthropic doit être utilisé côté serveur uniquement.');
}

/**
 * Traduire le texte en utilisant l'API Claude d'Anthropic
 */
export const translateWithClaude = async (
  text: string,
  sourceLanguage: 'auto' | 'ja' | 'fr' | 'en',
  targetLanguage: 'ja' | 'fr' | 'en'
): Promise<string> => {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('La clé API Anthropic n\'est pas configurée. Veuillez ajouter ANTHROPIC_API_KEY à votre fichier .env');
  }

  // Initialiser le client Anthropic
  const anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });

  // Adapte les codes de langue pour la requête
  const sourceLang = sourceLanguage === 'auto' 
    ? 'automatiquement détectée' 
    : sourceLanguage === 'ja' 
      ? 'japonais' 
      : sourceLanguage === 'fr' 
        ? 'français' 
        : 'anglais';
  
  const targetLang = targetLanguage === 'ja' 
    ? 'japonais' 
    : targetLanguage === 'fr' 
      ? 'français' 
      : 'anglais';

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      system: "Tu es un traducteur professionnel. Tu traduis uniquement le texte fourni, sans ajouter de commentaires ou d'explications.",
      messages: [
        {
          role: 'user',
          content: `Traduis le texte suivant de ${sourceLang} vers ${targetLang}. Ne fournis que la traduction, sans autre commentaire ni contexte.
          
Texte à traduire: "${text}"`,
        },
      ],
    });
    
    // Extraction du texte de la réponse
    const translatedText = message.content[0]?.text?.trim() || '';
    return translatedText;
  } catch (error) {
    console.error('Erreur lors de la traduction avec Claude:', error);
    throw error;
  }
}; 