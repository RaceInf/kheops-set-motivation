import { createClient } from '@supabase/supabase-js';

// Ce fichier initialise le client Supabase pour le côté serveur (API Routes).
// Il utilise la clé de service (SERVICE_ROLE_KEY) pour contourner la sécurité RLS 
// et effectuer des opérations d'administration.
// ATTENTION : Ne jamais importer ce fichier côté client (Frontend).

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// On utilise des placeholders si les variables sont manquantes pour ne pas bloquer le build Vercel.
// Les opérations réelles échoueront proprement au runtime si les variables manquent toujours.
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
