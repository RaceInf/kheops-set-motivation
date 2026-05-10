-- Schéma de base de données Supabase pour Kheops Set Motivation (Paiements Tara Money)

-- Enable pgcrypto extension for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table: users
-- Optionnel si vous utilisez Supabase Auth, mais utile pour garder une trace des acheteurs sans compte
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: orders
CREATE TYPE order_status AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  status order_status DEFAULT 'PENDING' NOT NULL,
  total_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: payments
-- Historique des tentatives de paiement liées à une commande
CREATE TYPE payment_provider AS ENUM ('tara', 'stripe', 'paypal');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  provider payment_provider DEFAULT 'tara' NOT NULL,
  provider_reference TEXT UNIQUE, -- Ex: Le payment ID ou transaction ID côté Tara
  status payment_status DEFAULT 'PENDING' NOT NULL,
  amount INTEGER NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: webhook_events
-- Historisation complète des requêtes entrantes pour audit et idempotence
CREATE TYPE webhook_status AS ENUM ('PENDING', 'PROCESSED', 'FAILED');

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider payment_provider DEFAULT 'tara' NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status webhook_status DEFAULT 'PENDING' NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- RLS (Row Level Security) Policies
-- Sécurisation de l'accès aux tables pour s'assurer que seul le backend (via Service Role) peut écrire
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- Note: En environnement "Service Role" (Backend), les politiques RLS sont ignorées.
-- Cela garantit qu'aucun client frontend utilisant la clé publique ne peut lire/écrire directement dans ces tables.

-- Fonctions et Triggers utiles
-- Met à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_modified_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_modtime 
BEFORE UPDATE ON public.orders 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_payments_modtime 
BEFORE UPDATE ON public.payments 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
