import Anthropic from '@anthropic-ai/sdk';

// Vérifier que nous sommes sur le serveur
if (typeof window !== 'undefined') {
  console.warn('Le service Anthropic doit être utilisé uniquement côté serveur.');
}

// Vérifier que la clé API est configurée
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Initialisation du client Anthropic (uniquement côté serveur)
let anthropic: Anthropic | null = null;
if (typeof window === 'undefined') {
  anthropic = new Anthropic({
    apiKey: ANTHROPIC_API_KEY,
  });
}

/**
 * Traduit un texte en utilisant Claude d'Anthropic
 * @param prompt Le prompt ou le texte à traduire
 * @param maxTokens Le nombre maximum de tokens pour la réponse (optionnel)
 * @returns Le texte traduit
 */
export async function translateWithClaude(
  prompt: string,
  maxTokens: number = 1000
): Promise<string> {
  // Vérifier que nous sommes côté serveur
  if (typeof window !== 'undefined') {
    throw new Error('Cette fonction ne peut être appelée que côté serveur');
  }

  if (!ANTHROPIC_API_KEY) {
    throw new Error('La clé API Anthropic n\'est pas configurée.');
  }

  if (!anthropic) {
    throw new Error('Le client Anthropic n\'a pas pu être initialisé.');
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      system: "Tu es un traducteur expert qui convertit le texte entre le japonais, le français et l'anglais. Ne donne que la traduction demandée, sans explications ni commentaires.",
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Renvoyer uniquement le contenu textuel de la réponse
    return message.content[0].text;
  } catch (error) {
    console.error('Erreur lors de la traduction avec Claude:', error);
    throw error;
  }
} 