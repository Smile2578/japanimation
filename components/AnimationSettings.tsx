'use client';

import React, { useEffect } from 'react';
import { Slider } from '../components/ui/slider';
import { useTranslator } from '../context/translatorContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const AnimationSettings: React.FC = () => {
  const {
    charSpeed,
    setCharSpeed,
    highlightDuration,
    setHighlightDuration,
    ttsSpeed,
    setTtsSpeed,
    isDarkTheme,
    setIsDarkTheme,
    saveUserPreferences,
  } = useTranslator();

  // Sauvegarder les préférences à chaque changement
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      saveUserPreferences();
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [charSpeed, highlightDuration, ttsSpeed, isDarkTheme, saveUserPreferences]);

  return (
    <div className="bg-card rounded-xl p-6 mb-8 shadow-md">
      <h2 className="text-xl font-bold mb-6 text-center text-primary">
        Paramètres d&apos;animation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Vitesse d'animation */}
        <div className="control-group">
          <label htmlFor="charSpeed" className="control-label">
            Vitesse (ms/caractère)
          </label>
          <div className="w-full max-w-xs">
            <Slider
              id="charSpeed"
              min={50}
              max={500}
              step={10}
              value={[charSpeed]}
              onValueChange={(values) => setCharSpeed(values[0])}
              className="w-full"
            />
            <div className="text-center mt-2 text-muted-foreground text-sm">{charSpeed} ms</div>
          </div>
        </div>

        {/* Durée de surlignage */}
        <div className="control-group">
          <label htmlFor="highlightDuration" className="control-label">
            Durée surlignage (ms)
          </label>
          <div className="w-full max-w-xs">
            <Slider
              id="highlightDuration"
              min={100}
              max={1000}
              step={50}
              value={[highlightDuration]}
              onValueChange={(values) => setHighlightDuration(values[0])}
              className="w-full"
            />
            <div className="text-center mt-2 text-muted-foreground text-sm">{highlightDuration} ms</div>
          </div>
        </div>

        {/* Vitesse TTS */}
        <div className="control-group">
          <label htmlFor="ttsSpeed" className="control-label">
            Vitesse de prononciation
          </label>
          <div className="w-full max-w-xs">
            <Select
              value={ttsSpeed.toString()}
              onValueChange={(value) => setTtsSpeed(parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Vitesse de prononciation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Normale</SelectItem>
                <SelectItem value="0.75">Lente</SelectItem>
                <SelectItem value="0.5">Très lente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Thème */}
        <div className="control-group">
          <label className="control-label">
            Thème
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIsDarkTheme(true)}
              className={`px-4 py-2 rounded-lg transition-all ${
                isDarkTheme 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-secondary text-foreground'
              }`}
            >
              Sombre
            </button>
            <button
              onClick={() => setIsDarkTheme(false)}
              className={`px-4 py-2 rounded-lg transition-all ${
                !isDarkTheme 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-secondary text-foreground'
              }`}
            >
              Clair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimationSettings; 