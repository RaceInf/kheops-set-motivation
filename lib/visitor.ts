/**
 * Gère l'identifiant unique du visiteur (Session)
 */
export const getVisitorId = () => {
  if (typeof window === 'undefined') return null;

  // On essaie de récupérer l'ID existant dans le sessionStorage
  // sessionStorage dure tant que l'onglet est ouvert
  let visitorId = sessionStorage.getItem('ksm_visitor_id');

  if (!visitorId) {
    // Si pas d'ID, on en génère un nouveau
    visitorId = 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('ksm_visitor_id', visitorId);
  }

  return visitorId;
};
