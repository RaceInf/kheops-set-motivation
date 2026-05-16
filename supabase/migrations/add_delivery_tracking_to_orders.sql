-- Migration: Tracking de livraison email sur les commandes
-- Permet de savoir si l'email de livraison du produit a bien été envoyé.
-- Les commandes PAID avec delivery_status = 'PENDING' ou 'FAILED' seront
-- automatiquement retraitées par le cron /api/admin/cron/delivery-retry.

CREATE TYPE delivery_status AS ENUM ('PENDING', 'SENT', 'FAILED');

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_status delivery_status DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS delivery_sent_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS delivery_error TEXT;

-- Index pour le cron (requête fréquente : PAID + delivery non envoyé)
CREATE INDEX IF NOT EXISTS idx_orders_delivery
  ON public.orders (status, delivery_status)
  WHERE status = 'PAID' AND delivery_status != 'SENT';
