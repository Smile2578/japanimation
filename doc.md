# Prompt pour Application d'Apprentissage du Japonais Interactive

## Objectif

Créer une application web d'apprentissage du japonais avec une animation de texte synchronisé entre japonais et phonétique romaji, incluant des fonctionnalités interactives avancées pour améliorer l'expérience d'apprentissage.

## Fonctionnalités Requises

### 1. Animation Texte Synchronisée
- Animation type "machine à écrire" affichant simultanément le texte japonais et sa phonétique en romaji
- Disposition horizontale: texte japonais sur une ligne, phonétique alignée en dessous
- Surlignage temporaire de chaque paire de caractères lors de leur apparition
- Vitesse d'animation et durée du surlignage ajustables

### 2. Interaction par Survol (Hover)
- Lorsque l'utilisateur survole un caractère japonais, surligner ce caractère ET sa phonétique correspondante
- Inversement, le survol d'une phonétique doit surligner le caractère japonais associé
- Animation fluide pour cette mise en évidence

### 3. Traduction Automatique
- Champ de saisie permettant à l'utilisateur d'entrer du texte en japonais OU en anglais/français
- Bouton de détection automatique de la langue saisie
- Traduction automatique via API (Google Translate, DeepL ou autre service similaire)
- Affichage du résultat avec la même disposition synchronisée
- Option pour lancer l'animation sur le texte traduit

### 4. Synthèse Vocale (TTS) pour le Japonais
- Bouton de lecture audio pour entendre la prononciation correcte
- Option pour lire l'intégralité de la phrase ou des segments individuels
- Contrôle de la vitesse de prononciation (normal, lent)
- Indicateur visuel du segment en cours de prononciation

### 5. Interface Utilisateur
- Design moderne et épuré avec thème sombre (comme la version précédente)
- Disposition responsive adaptée à différentes tailles d'écran
- Panneau de contrôle intuitif pour toutes les fonctionnalités
- Sauvegarde des préférences utilisateur (vitesse, thème, etc.)

## Spécifications Techniques

### Structure HTML
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application d'Apprentissage du Japonais</title>
    <!-- Inclure ici les CSS, polices et autres ressources -->
</head>
<body>
    <div class="container">
        <header>
            <h1>Application d'Apprentissage du Japonais</h1>
        </header>
        
        <!-- Section de saisie et traduction -->
        <section class="input-section">
            <div class="input-container">
                <select id="inputLanguage">
                    <option value="auto">Détection automatique</option>
                    <option value="ja">Japonais</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                </select>
                <textarea id="inputText" placeholder="Entrez votre texte ici..."></textarea>
                <button id="translateButton">Traduire</button>
            </div>
        </section>
        
        <!-- Section d'affichage et d'animation -->
        <section class="display-section">
            <div class="text-display">
                <div class="text-content" id="textContent">
                    <div class="japanese-line" id="japaneseLine"></div>
                    <div class="phonetic-line" id="phoneticLine"></div>
                </div>
                <div class="controls-overlay">
                    <button id="playButton" class="play-button">
                        <i class="icon-play"></i>
                    </button>
                </div>
            </div>
        </section>
        
        <!-- Contrôles de l'animation -->
        <section class="animation-controls">
            <div class="control-group">
                <label for="charSpeed">Vitesse (ms/caractère)</label>
                <input type="range" id="charSpeed" min="10" max="500" value="100">
                <span id="charSpeedValue">100</span>
            </div>
            
            <div class="control-group">
                <label for="highlightDuration">Durée surlignage (ms)</label>
                <input type="range" id="highlightDuration" min="100" max="1000" value="300">
                <span id="highlightDurationValue">300</span>
            </div>
            
            <button id="startButton">Démarrer l'animation</button>
        </section>
        
        <!-- Options supplémentaires -->
        <section class="additional-options">
            <div class="option-group">
                <label for="ttsSpeed">Vitesse TTS</label>
                <select id="ttsSpeed">
                    <option value="1">Normale</option>
                    <option value="0.75">Lente</option>
                    <option value="0.5">Très lente</option>
                </select>
            </div>
            
            <div class="option-group">
                <label for="themeSelector">Thème</label>
                <select id="themeSelector">
                    <option value="dark">Sombre</option>
                    <option value="light">Clair</option>
                </select>
            </div>
        </section>
    </div>
    
    <!-- Scripts -->
    <script src="app.js"></script>
</body>
</html>
```

### Style CSS (base)
```css
:root {
    /* Thème sombre (par défaut) */
    --bg-primary: #1a1a2e;
    --bg-secondary: #16213e;
    --bg-tertiary: #0f3460;
    --text-primary: #fff;
    --text-secondary: #a2a8d3;
    --accent: #e94560;
    --accent-light: rgba(233, 69, 96, 0.3);
    --success: #4ecca3;
    --shadow: rgba(0,0,0,0.3);
}

body.light-theme {
    /* Thème clair (alternative) */
    --bg-primary: #f5f5f5;
    --bg-secondary: #ffffff;
    --bg-tertiary: #e0e0e0;
    --text-primary: #333;
    --text-secondary: #666;
    --accent: #e94560;
    --accent-light: rgba(233, 69, 96, 0.1);
    --success: #4ecca3;
    --shadow: rgba(0,0,0,0.1);
}

/* Styles de base */
body {
    font-family: 'Segoe UI', 'Hiragino Sans', 'Meiryo', sans-serif;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    margin: 0;
    padding: 0;
    transition: background-color 0.3s ease;
}

.container {
    max-width: 1000px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: var(--bg-secondary);
    border-radius: 16px;
    box-shadow: 0 10px 30px var(--shadow);
}

header {
    text-align: center;
    margin-bottom: 2rem;
}

h1 {
    color: var(--accent);
    font-weight: 700;
}

/* Styles pour la section d'entrée */
.input-section {
    margin-bottom: 2rem;
}

.input-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

textarea {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--accent);
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    min-height: 100px;
    font-size: 1rem;
    resize: vertical;
}

select, button {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font-size: 1rem;
    border: none;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
}

button {
    background-color: var(--accent);
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px var(--accent-light);
}

/* Styles pour la section d'affichage */
.text-display {
    background-color: var(--bg-tertiary);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    position: relative;
    box-shadow: inset 0 0 15px var(--shadow);
    min-height: 200px;
}

.text-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.japanese-line, .phonetic-line {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    line-height: 1.5;
    transition: all 0.3s ease;
}

.japanese-line {
    font-size: 2.5rem;
}

.phonetic-line {
    font-size: 1.5rem;
    color: var(--text-secondary);
}

.char-container {
    transition: all 0.3s ease;
    cursor: pointer;
}

.highlight {
    color: var(--accent) !important;
    text-shadow: 0 0 10px var(--accent-light);
}

.controls-overlay {
    position: absolute;
    bottom: 1rem;
    right: 1rem;
}

.play-button {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Styles pour les contrôles */
.animation-controls, .additional-options {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    margin-bottom: 2rem;
}

.control-group, .option-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

input[type="range"] {
    width: 200px;
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 1rem;
        margin: 1rem;
    }
    
    .japanese-line {
        font-size: 2rem;
    }
    
    .phonetic-line {
        font-size: 1.2rem;
    }
    
    .animation-controls, .additional-options {
        flex-direction: column;
        gap: 1rem;
    }
}
```

### JavaScript (logique principale)
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Éléments DOM
    const inputText = document.getElementById('inputText');
    const translateButton = document.getElementById('translateButton');
    const japaneseLineElement = document.getElementById('japaneseLine');
    const phoneticLineElement = document.getElementById('phoneticLine');
    const charSpeedInput = document.getElementById('charSpeed');
    const charSpeedValue = document.getElementById('charSpeedValue');
    const highlightDurationInput = document.getElementById('highlightDuration');
    const highlightDurationValue = document.getElementById('highlightDurationValue');
    const startButton = document.getElementById('startButton');
    const playButton = document.getElementById('playButton');
    const ttsSpeedSelect = document.getElementById('ttsSpeed');
    const themeSelector = document.getElementById('themeSelector');
    
    // Mise à jour des valeurs affichées pour les sliders
    charSpeedInput.addEventListener('input', () => {
        charSpeedValue.textContent = charSpeedInput.value;
    });
    
    highlightDurationInput.addEventListener('input', () => {
        highlightDurationValue.textContent = highlightDurationInput.value;
    });
    
    // Changement de thème
    themeSelector.addEventListener('change', () => {
        if (themeSelector.value === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
        // Enregistrer la préférence
        localStorage.setItem('theme', themeSelector.value);
    });
    
    // Charger les préférences de l'utilisateur
    function loadUserPreferences() {
        const theme = localStorage.getItem('theme');
        if (theme) {
            themeSelector.value = theme;
            if (theme === 'light') {
                document.body.classList.add('light-theme');
            }
        }
        
        const charSpeed = localStorage.getItem('charSpeed');
        if (charSpeed) {
            charSpeedInput.value = charSpeed;
            charSpeedValue.textContent = charSpeed;
        }
        
        const highlightDuration = localStorage.getItem('highlightDuration');
        if (highlightDuration) {
            highlightDurationInput.value = highlightDuration;
            highlightDurationValue.textContent = highlightDuration;
        }
        
        const ttsSpeed = localStorage.getItem('ttsSpeed');
        if (ttsSpeed) {
            ttsSpeedSelect.value = ttsSpeed;
        }
    }
    
    // Enregistrer les préférences de l'utilisateur
    function saveUserPreferences() {
        localStorage.setItem('charSpeed', charSpeedInput.value);
        localStorage.setItem('highlightDuration', highlightDurationInput.value);
        localStorage.setItem('ttsSpeed', ttsSpeedSelect.value);
    }
    
    // Exemple de données (à remplacer par l'API de traduction)
    let currentMapping = [
        { japanese: "君", phonetic: "Kimi" },
        { japanese: "は", phonetic: "wa" },
        { japanese: "彼女", phonetic: "kanojo" },
        { japanese: "に", phonetic: "ni" },
        { japanese: "「", phonetic: '"' },
        { japanese: "thank", phonetic: "thank" },
        { japanese: " ", phonetic: " " },
        { japanese: "you", phonetic: "you" },
        { japanese: "」", phonetic: '"' },
        { japanese: "って", phonetic: "tte" },
        { japanese: "言って", phonetic: "itte" },
        { japanese: "ほし", phonetic: "hoshi" },
        { japanese: "かった", phonetic: "katta" },
        { japanese: "の", phonetic: "no" },
        { japanese: "？", phonetic: "?" }
    ];
    
    // Fonction pour préparer l'affichage
    function prepareDisplay() {
        // Vider le contenu
        japaneseLineElement.innerHTML = '';
        phoneticLineElement.innerHTML = '';
        
        // Pour chaque paire dans le mapping
        currentMapping.forEach((pair, index) => {
            // Créer l'élément pour le caractère japonais
            const japaneseChar = document.createElement('span');
            japaneseChar.className = 'char-container japanese-char';
            japaneseChar.dataset.index = index;
            japaneseChar.textContent = pair.japanese;
            japaneseLineElement.appendChild(japaneseChar);
            
            // Créer l'élément pour la phonétique
            const phoneticChar = document.createElement('span');
            phoneticChar.className = 'char-container phonetic-char';
            phoneticChar.dataset.index = index;
            phoneticChar.textContent = pair.phonetic;
            phoneticLineElement.appendChild(phoneticChar);
            
            // Ajouter les événements de survol
            japaneseChar.addEventListener('mouseenter', () => {
                japaneseChar.classList.add('highlight');
                phoneticChar.classList.add('highlight');
            });
            
            japaneseChar.addEventListener('mouseleave', () => {
                japaneseChar.classList.remove('highlight');
                phoneticChar.classList.remove('highlight');
            });
            
            phoneticChar.addEventListener('mouseenter', () => {
                japaneseChar.classList.add('highlight');
                phoneticChar.classList.add('highlight');
            });
            
            phoneticChar.addEventListener('mouseleave', () => {
                japaneseChar.classList.remove('highlight');
                phoneticChar.classList.remove('highlight');
            });
        });
    }
    
    // Fonction pour animer l'affichage
    async function animateDisplay() {
        const japaneseChars = document.querySelectorAll('.japanese-line .char-container');
        const phoneticChars = document.querySelectorAll('.phonetic-line .char-container');
        const charSpeed = parseInt(charSpeedInput.value);
        const highlightDuration = parseInt(highlightDurationInput.value);
        
        // Pour chaque paire de caractères
        for (let i = 0; i < japaneseChars.length; i++) {
            // Activer les caractères
            japaneseChars[i].classList.add('active');
            phoneticChars[i].classList.add('active');
            
            // Surligner temporairement
            japaneseChars[i].classList.add('highlight');
            phoneticChars[i].classList.add('highlight');
            
            // Attendre la durée spécifiée
            await new Promise(resolve => setTimeout(resolve, charSpeed));
            
            // Retirer le surlignage après la durée définie
            setTimeout(() => {
                japaneseChars[i].classList.remove('highlight');
                phoneticChars[i].classList.remove('highlight');
            }, highlightDuration);
        }
    }
    
    // Fonction pour la synthèse vocale (TTS)
    function speakJapanese() {
        if (!('speechSynthesis' in window)) {
            alert("Votre navigateur ne supporte pas la synthèse vocale.");
            return;
        }
        
        // Récupérer le texte japonais complet
        const japaneseText = currentMapping.map(pair => pair.japanese).join('');
        
        // Créer un nouvel objet d'énoncé
        const utterance = new SpeechSynthesisUtterance(japaneseText);
        
        // Configurer la langue et la vitesse
        utterance.lang = 'ja-JP';
        utterance.rate = parseFloat(ttsSpeedSelect.value);
        
        // Lancer la synthèse vocale
        window.speechSynthesis.speak(utterance);
        
        // Indication visuelle (à améliorer)
        playButton.classList.add('playing');
        
        utterance.onend = function() {
            playButton.classList.remove('playing');
        };
    }
    
    // Fonction pour traduire le texte (à implémenter avec une API réelle)
    async function translateText() {
        const text = inputText.value.trim();
        if (!text) return;
        
        // Ici, vous devriez implémenter l'appel à une API de traduction
        // comme Google Translate, DeepL, etc.
        // Pour cet exemple, nous allons simuler une réponse
        
        // Exemple de réponse simulée
        if (text.match(/[a-zA-Z]/)) {
            // Si le texte contient des caractères latins, simuler une traduction vers le japonais
            alert("Dans une vraie application, le texte serait traduit en japonais via une API.");
            // Ne rien changer pour cet exemple
        } else {
            // Si le texte contient des caractères japonais, simuler une traduction vers l'anglais/français
            alert("Dans une vraie application, le texte japonais serait traduit via une API.");
            // Ne rien changer pour cet exemple
        }
        
        // Pour une vraie implémentation, vous devriez:
        // 1. Appeler l'API de traduction
        // 2. Recevoir le résultat
        // 3. Mettre à jour currentMapping avec la nouvelle paire japonais/phonétique
        // 4. Appeler prepareDisplay()
    }
    
    // Fonction principale pour lancer l'animation
    async function startAnimation() {
        // Désactive le bouton pendant l'animation
        startButton.disabled = true;
        
        // Prépare l'affichage
        prepareDisplay();
        
        // Attente avant de commencer l'animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Lance l'animation
        await animateDisplay();
        
        // Réactive le bouton à la fin de l'animation
        startButton.disabled = false;
        
        // Enregistrer les préférences
        saveUserPreferences();
    }
    
    // Écouteurs d'événements
    startButton.addEventListener('click', startAnimation);
    playButton.addEventListener('click', speakJapanese);
    translateButton.addEventListener('click', translateText);
    
    // Charger les préférences utilisateur
    loadUserPreferences();
    
    // Lance l'animation dès le chargement de la page
    setTimeout(startAnimation, 500);
});
```

## API et Services Recommandés

### 1. Traduction Automatique
Pour la traduction automatique, vous pouvez utiliser :

- **Google Cloud Translation API** : Service robuste avec support de nombreuses langues
  - Documentation : https://cloud.google.com/translate/docs
  - Coût : Tarification par caractère (premiers 500 000 caractères/mois gratuits)

- **DeepL API** : Réputé pour des traductions de haute qualité, particulièrement pour les langues asiatiques
  - Documentation : https://www.deepl.com/docs-api
  - Coût : Tarification par caractère, plan gratuit limité

- **Microsoft Azure Translator** : Alternative solide, bonne prise en charge du japonais
  - Documentation : https://docs.microsoft.com/en-us/azure/cognitive-services/translator/
  - Coût : Tarification par million de caractères, niveau gratuit disponible

### 2. Synthèse Vocale (TTS)
Pour la synthèse vocale japonaise :

- **Web Speech API** (solution gratuite, intégrée au navigateur)
  - Documentation : https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
  - Limites : Qualité variable selon le navigateur, options limitées pour le japonais

- **Google Cloud Text-to-Speech** (solution premium)
  - Documentation : https://cloud.google.com/text-to-speech/docs
  - Avantages : Voix japonaises de haute qualité, contrôle précis de l'intonation

- **Amazon Polly** (solution premium)
  - Documentation : https://docs.aws.amazon.com/polly/latest/dg/
  - Avantages : Voix naturelles, support SSML pour contrôle avancé

## Implémentation de la Traduction

Pour implémenter la traduction automatique avec segmentation appropriée, vous devrez :

1. **Tokenisation japonaise** : Utiliser une bibliothèque comme `kuromoji.js` pour segmenter correctement le texte japonais
   - GitHub : https://github.com/takuyaa/kuromoji.js
   - Permet une meilleure correspondance avec la phonétique

2. **Génération de romaji** : Convertir le japonais en romaji correctement avec `kuroshiro.js`
   - GitHub : https://github.com/hexenq/kuroshiro
   - Offre des options de conversion personnalisables

Exemple d'intégration :

```javascript
// Exemple d'initialisation de Kuroshiro pour la conversion japonais-romaji
async function initializeJapaneseTools() {
    // Initialiser Kuroshiro
    const kuroshiro = new Kuroshiro();
    await kuroshiro.init(new KuromojiAnalyzer());
    
    return {
        kuroshiro,
        // Convertir du japonais en romaji
        toRomaji: async (text) => {
            return await kuroshiro.convert(text, {
                to: 'romaji',
                mode: 'spaced',
                romajiSystem: 'hepburn'
            });
        },
        // Segmenter le texte japonais
        tokenize: async (text) => {
            return await kuroshiro._analyzer.tokenize(text);
        }
    };
}

// Utilisation avec l'API de traduction
async function translateAndProcess(text, sourceLang, targetLang) {
    // Traduction via API
    const translatedText = await translateWithAPI(text, sourceLang, targetLang);
    
    // Si le résultat est en japonais, générer le romaji
    if (targetLang === 'ja') {
        const japaneseTools = await initializeJapaneseTools();
        const romaji = await japaneseTools.toRomaji(translatedText);
        
        // Segmentation et création du mapping
        const tokens = await japaneseTools.tokenize(translatedText);
        
        // Créer le mapping entre tokens japonais et segments romaji
        // (Cette partie est complexe et nécessite un algorithme d'alignement)
        
        return {
            japanese: translatedText,
            romaji: romaji,
            mapping: createMapping(tokens, romaji)
        };
    }
    
    return {
        text: translatedText
    };
}

// Fonction pour créer le mapping entre japonais et romaji
function createMapping(tokens, romaji) {
    // Implémentation d'alignement...
}
```

## Conseils d'Implémentation

1. **Architecture modulaire** : Séparez clairement les fonctionnalités en modules distincts.
2. **Gestion des erreurs** : Implémentez une gestion robuste des erreurs pour les appels API.
3. **Affichage progressif** : Pour des textes longs, implémentez un défilement automatique.
4. **Cache de traduction** : Stockez les résultats de traduction récents pour éviter des appels API redondants.
5. **UX responsive** : Adaptez l'interface pour les appareils mobiles et les écrans larges.
6. **Accessibilité** : Assurez-vous que l'application reste utilisable avec les technologies d'assistance.

## Points d'Amélioration Future

1. **Dictionnaire intégré** : Cliquer sur un mot pour afficher sa définition.
2. **Niveaux de difficulté** : Classifier le vocabulaire par niveau JLPT.
3. **Spaced repetition** : Système de révision intelligente des mots appris.
4. **Mode quiz** : Tests interactifs basés sur le contenu affiché.
5. **Exportation** : Possibilité d'exporter en fichiers audio ou PDF pour révision hors ligne.

## Ressources d'Apprentissage Recommandées

Pour enrichir l'application, envisagez d'intégrer des liens vers ces ressources :

1. **Jisho.org** : Dictionnaire japonais-anglais en ligne
2. **Tae Kim's Guide to Japanese** : Ressource gratuite pour la grammaire
3. **WaniKani** : Système d'apprentissage de kanji
4. **NHK Easy News** : Articles d'actualité en japonais simplifié

---

Ce prompt détaillé devrait permettre à votre agent de créer une application complète d'apprentissage du japonais avec toutes les fonctionnalités demandées. L'implémentation concrète nécessitera des API externes pour la traduction et potentiellement pour la synthèse vocale de haute qualité.