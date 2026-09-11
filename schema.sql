-- SafeChat AI Supabase Schema & Row Level Security (RLS)
-- Enables multi-tenant Parent Data Isolation, Secure Device Pairing, and Realtime Safety Insights

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'admin')) DEFAULT 'parent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Children Table (Parent ownership)
CREATE TABLE IF NOT EXISTS public.children (
  id TEXT PRIMARY KEY DEFAULT ('child_' || substr(md5(random()::text), 1, 12)),
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  age_group TEXT,
  avatar_url TEXT,
  protection_status TEXT NOT NULL CHECK (protection_status IN ('ACTIVE', 'ATTENTION_REQUIRED', 'CRITICAL', 'INACTIVE')) DEFAULT 'ACTIVE',
  overall_risk_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Devices Table (Linked to child)
CREATE TABLE IF NOT EXISTS public.devices (
  id TEXT PRIMARY KEY DEFAULT ('device_' || substr(md5(random()::text), 1, 12)),
  child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  device_type TEXT DEFAULT 'smartphone',
  device_status TEXT NOT NULL CHECK (device_status IN ('CONNECTED', 'IDLE', 'OFFLINE', 'REVOKED')) DEFAULT 'CONNECTED',
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  os_version TEXT DEFAULT 'Android 14',
  device_token_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Temporary Pairing Sessions Table (Server-side 6-digit hashed codes, 10 min expiry)
CREATE TABLE IF NOT EXISTS public.pairing_sessions (
  id TEXT PRIMARY KEY DEFAULT ('pair_' || substr(md5(random()::text), 1, 12)),
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_display_name TEXT NOT NULL,
  age_group TEXT,
  pairing_code_hash TEXT NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  paired_child_id TEXT REFERENCES public.children(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Risk Events Table (Child & Parent Tagged, Realtime Enabled)
CREATE TABLE IF NOT EXISTS public.risk_events (
  id TEXT PRIMARY KEY DEFAULT ('event_' || substr(md5(random()::text), 1, 12)),
  child_id TEXT NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  conversation_id TEXT,
  source TEXT DEFAULT 'safechat_child_env',
  risk_score INT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  primary_concern TEXT NOT NULL,
  categories JSONB DEFAULT '[]'::JSONB,
  behavioral_patterns JSONB DEFAULT '[]'::JSONB,
  why_flagged JSONB DEFAULT '[]'::JSONB,
  explanation TEXT,
  recommendation TEXT,
  pii_redacted_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Notifications Table (Parent alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY DEFAULT ('notif_' || substr(md5(random()::text), 1, 12)),
  parent_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  child_id TEXT REFERENCES public.children(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enablement
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Parent Data Isolation (Parent A cannot view Parent B's data)
CREATE POLICY "Parents can only view their own user record"
  ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Parents can only view their own children"
  ON public.children FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Parents can only view their children's devices"
  ON public.devices FOR ALL USING (
    child_id IN (SELECT id FROM public.children WHERE parent_id = auth.uid())
  );

CREATE POLICY "Parents can only view and manage their pairing sessions"
  ON public.pairing_sessions FOR ALL USING (auth.uid() = parent_id);

CREATE POLICY "Parents can only view risk events for their children"
  ON public.risk_events FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can only view their notifications"
  ON public.notifications FOR ALL USING (auth.uid() = parent_id);

-- Realtime publication for immediate live updates on Parent Dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.children;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
