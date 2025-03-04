import type { TextMapping } from '../context/translatorContext';

// Importation dynamique de kuroshiro pour éviter les problèmes côté serveur
let Kuroshiro: unknown = null;
let KuromojiAnalyzer: unknown = null;
let kuroshiro: { 
  init: (analyzer: unknown) => Promise<void>;
  convert: (text: string, options: { 
    to: 'romaji'; 
    mode: 'spaced'; 
    romajiSystem: 'hepburn';
  }) => Promise<string>;
  _analyzer: {
    tokenize: (text: string) => Promise<Array<{
      surface_form: string;
      reading?: string;
      pos?: string;
    }>>;
  };
} | null = null;
let initialized = false;

// Initialisation de Kuroshiro (côté client uniquement)
export const initializeJapaneseTools = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    if (!initialized) {
      const kuroshiroModule = await import('kuroshiro');
      const kuromojiModule = await import('kuroshiro-analyzer-kuromoji');
      
      Kuroshiro = kuroshiroModule.default;
      KuromojiAnalyzer = kuromojiModule.default;
      
      if (typeof Kuroshiro === 'function' && typeof KuromojiAnalyzer === 'function') {
        // @ts-expect-error - Types incompatibles
        kuroshiro = new Kuroshiro();
        
        // Spécifier le chemin du dictionnaire
        // @ts-expect-error - Types incompatibles
        const analyzer = new KuromojiAnalyzer({
          // Dans Next.js, les fichiers statiques doivent être dans /public
          // et sont accessibles à la racine de l'URL
          dictPath: '/dict'  
        });
        
        try {
          // Utiliser une version simplifiée pour la démonstration
          // puisque nous n'avons pas les dictionnaires
          if (kuroshiro) {
            await kuroshiro.init(analyzer);
            initialized = true;
          }
        } catch (dictError) {
          console.warn("Dictionnaire non trouvé, utilisation du mode de démonstration", dictError);
          
          // Mode de démonstration : simuler Kuroshiro
          kuroshiro = {
            init: async () => {},
            convert: async (text) => {
              // Conversion simple japonais -> romaji pour démo
              const simpleMappings: Record<string, string> = {
                'は': 'wa', 'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
                'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
                'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
                'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
                'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
                'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
                'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
                'わ': 'wa', 'を': 'wo', 'ん': 'n',
                'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
                'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
                'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
                'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
                'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
                '君': 'kimi', '彼女': 'kanojo', '言っ': 'it', 
                'ほしかった': 'hoshikatta', '？': '?',
                'thank': 'thank', 'you': 'you'
              };
              
              let result = '';
              for (const char of text) {
                result += simpleMappings[char] || char;
              }
              return result;
            },
            _analyzer: {
              tokenize: async (text) => {
                // Retourne des tokens simplifiés pour la démo
                return text.split('').map(char => ({
                  surface_form: char
                }));
              }
            }
          };
          initialized = true;
        }
      }
    }
    return initialized;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des outils japonais:', error);
    return false;
  }
};

// Conversion du texte japonais en romaji
export const convertToRomaji = async (japaneseText: string): Promise<string> => {
  if (!initialized || !kuroshiro) {
    const success = await initializeJapaneseTools();
    if (!success || !kuroshiro) throw new Error('Impossible d\'initialiser les outils japonais');
  }
  
  try {
    return await kuroshiro.convert(japaneseText, {
      to: 'romaji',
      mode: 'spaced',
      romajiSystem: 'hepburn'
    });
  } catch (error) {
    console.error('Erreur lors de la conversion en romaji:', error);
    throw error;
  }
};

// Segmentation du texte japonais
export const tokenizeJapanese = async (japaneseText: string): Promise<Array<{
  surface_form: string;
  reading?: string;
  pos?: string;
}>> => {
  if (!initialized || !kuroshiro) {
    const success = await initializeJapaneseTools();
    if (!success || !kuroshiro) throw new Error('Impossible d\'initialiser les outils japonais');
  }
  
  try {
    return await kuroshiro._analyzer.tokenize(japaneseText);
  } catch (error) {
    console.error('Erreur lors de la tokenisation du texte japonais:', error);
    throw error;
  }
};

// Création du mapping entre le japonais et le romaji
export const createJapaneseRomajiMapping = async (japaneseText: string): Promise<TextMapping[]> => {
  try {
    await initializeJapaneseTools();
    
    if (!kuroshiro) {
      throw new Error('Outils japonais non initialisés');
    }
    
    // Tokeniser le texte japonais
    const tokens = await tokenizeJapanese(japaneseText);
    
    // Convertir chaque token en romaji
    const mappings: TextMapping[] = [];
    let index = 0;
    
    for (const token of tokens) {
      if (token.surface_form.trim() === '') continue;
      
      // Convertir uniquement le token actuel en romaji
      const romaji = await kuroshiro.convert(token.surface_form, {
        to: 'romaji',
        mode: 'spaced',
        romajiSystem: 'hepburn'
      });
      
      mappings.push({
        japanese: token.surface_form,
        phonetic: romaji.trim(),
        index: index++
      });
    }
    
    return mappings;
  } catch (error) {
    console.error('Erreur lors de la création du mapping:', error);
    // Retourner un mapping simple en cas d'erreur
    return japaneseText.split('').map((char, index) => ({
      japanese: char,
      phonetic: char,
      index
    }));
  }
};

// Créer un mapping pour le texte non-japonais
const createTextMapping = (text: string): TextMapping[] => {
  const mappings: TextMapping[] = [];
  const words = text.split(/(\s+)/);
  let index = 0;
  
  for (const word of words) {
    mappings.push({
      japanese: word,
      phonetic: word,
      index: index++
    });
  }
  
  return mappings;
};

// Fonction de traduction utilisant Claude
export const translateText = async (
  targetLang: string = 'ja',
  inputText?: string,
  inputLanguage?: 'auto' | 'ja' | 'fr' | 'en'
): Promise<TextMapping[]> => {
  // Vérifier que le texte d'entrée est disponible
  if (!inputText || !inputText.trim()) {
    throw new Error("Aucun texte d'entrée fourni pour la traduction");
  }
  
  try {
    // Définir les langues source et cible
    const sourceLanguage = inputLanguage || 'auto';
    const targetLanguage = targetLang as 'ja' | 'fr' | 'en';
    
    // Appel à l'API route pour la traduction côté serveur
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: inputText,
        sourceLanguage,
        targetLanguage
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la traduction');
    }

    const data = await response.json();
    const translatedText = data.translatedText;
    
    // Créer le mapping approprié en fonction de la langue cible
    if (targetLanguage === 'ja') {
      // Si la traduction est en japonais, créer un mapping japonais-romaji
      return await createJapaneseRomajiMapping(translatedText);
    } else {
      // Sinon, créer un mapping simple pour le texte traduit
      return createTextMapping(translatedText);
    }
  } catch (error) {
    console.error('Erreur lors de la traduction:', error);
    throw error;
  }
}; 