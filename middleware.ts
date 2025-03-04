import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Constantes pour le rate limiting
const MAX_REQUESTS_PER_MINUTE = 10; // Maximum de requêtes par minute
const RATE_LIMIT_WINDOW = 60 * 1000; // Fenêtre de 1 minute en millisecondes

// Stockage en mémoire pour le rate limiting
// Note: Ce stockage est réinitialisé à chaque redémarrage du serveur
// Pour une solution de production, utilisez Redis ou une autre solution persistante
type RateLimitStore = {
  [ip: string]: {
    count: number;
    resetTime: number;
  };
};

const rateLimitStore: RateLimitStore = {};

// Fonction pour nettoyer périodiquement le store (pour éviter les fuites de mémoire)
const cleanupStore = () => {
  const now = Date.now();
  Object.keys(rateLimitStore).forEach(ip => {
    if (rateLimitStore[ip].resetTime < now) {
      delete rateLimitStore[ip];
    }
  });
};

// Nettoyer le store toutes les 10 minutes
setInterval(cleanupStore, 10 * 60 * 1000);

// Fonction pour obtenir l'adresse IP du client
function getClientIp(request: NextRequest): string {
  // Essayer d'obtenir l'IP à partir des en-têtes de forwarding
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Prendre la première IP si plusieurs sont présentes
    return forwardedFor.split(',')[0].trim();
  }
  
  // Fallback à l'IP distante
  const remoteIp = request.headers.get('x-real-ip');
  if (remoteIp) {
    return remoteIp;
  }
  
  // Dernier recours : utiliser un identifiant générique
  return 'unknown-ip';
}

// Fonction principale du middleware
export async function middleware(request: NextRequest) {
  // Appliquer le rate limiting uniquement aux routes API de traduction
  if (request.nextUrl.pathname.startsWith('/api/translate')) {
    const ip = getClientIp(request);
    const now = Date.now();
    
    // Initialiser ou réinitialiser le compteur si nécessaire
    if (!rateLimitStore[ip] || rateLimitStore[ip].resetTime < now) {
      rateLimitStore[ip] = {
        count: 0,
        resetTime: now + RATE_LIMIT_WINDOW
      };
    }
    
    // Vérifier si la limite est atteinte
    if (rateLimitStore[ip].count >= MAX_REQUESTS_PER_MINUTE) {
      const resetTimeInSeconds = Math.ceil((rateLimitStore[ip].resetTime - now) / 1000);
      
      return new NextResponse(
        JSON.stringify({
          error: 'Limite de requêtes atteinte',
          message: `Veuillez réessayer dans ${resetTimeInSeconds} secondes`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': resetTimeInSeconds.toString()
          }
        }
      );
    }
    
    // Incrémenter le compteur
    rateLimitStore[ip].count++;
  }
  
  // Continuer avec la requête si tout est OK
  return NextResponse.next();
}

// Configurer le middleware pour être exécuté uniquement sur les routes API spécifiées
export const config = {
  matcher: ['/api/translate/:path*']
}; 