'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import dynamique des composants côté client
const TranslatorProvider = dynamic(
  () => import('../context/translatorContext').then((mod) => mod.TranslatorProvider),
  { ssr: false }
);

const TranslatorInput = dynamic(() => import('../components/TranslatorInput'), {
  ssr: false,
});

const TextDisplay = dynamic(() => import('../components/TextDisplay'), {
  ssr: false,
});

const AnimationSettings = dynamic(() => import('../components/AnimationSettings'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="container-custom">
        <TranslatorProvider>
        <TranslatorInput />
          <TextDisplay />
          <AnimationSettings />
        </TranslatorProvider>
        
        <footer className="mt-10 text-center text-sm text-muted-foreground">
          <p>
            Développé avec ❤️ par Simon pour l&apos;apprentissage du japonais.
          </p>
        </footer>
      </div>
    </main>
  );
}
