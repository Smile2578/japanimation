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
        <h1 className="text-4xl font-bold mb-10 text-center text-primary">
          Animation d&apos;apprentissage japonais
        </h1>
        
        <TranslatorProvider>
        <TranslatorInput />
          <TextDisplay />
          <AnimationSettings />
          
        </TranslatorProvider>
        
        <footer className="mt-10 text-center text-sm text-muted-foreground">
          <p>
            Développé avec Next.js, TypeScript et Kuroshiro pour l&apos;apprentissage du japonais.
          </p>
        </footer>
      </div>
    </main>
  );
}
