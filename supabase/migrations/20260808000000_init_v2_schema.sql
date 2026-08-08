-- SRM Opportunity Intelligence Platform V2 Database Schema
-- Migration: 20260808000000_init_v2_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM ('student', 'club_rep', 'super_admin');
CREATE TYPE club_verification_status AS ENUM ('unverified', 'pending_review', 'verified', 'rejected');
CREATE TYPE opportunity_type AS ENUM (
  'hackathon',
  'internship',
  'research',
  'competition',
  'workshop',
  'bootcamp',
  'scholarship',
  'club_recruitment',
  'placement_drive',
  'conference',
  'certification',
  'webinar',
  'guest_lecture',
  'other'
);
CREATE TYPE opportunity_status AS ENUM ('draft', 'published', 'archived', 'rejected');
CREATE TYPE location_type AS ENUM ('on_campus', 'remote', 'hybrid', 'off_campus');
CREATE TYPE registration_status AS ENUM ('registered', 'attended', 'withdrawn');
CREATE TYPE notification_type AS ENUM ('info', 'reminder', 'verification', 'alert');

-- 2. CORE TABLES

-- Base Users (synced with Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Student Profiles
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  register_number TEXT,
  department TEXT,
  year_of_study INT CHECK (year_of_study >= 1 AND year_of_study <= 5),
  skills TEXT[] DEFAULT '{}',
  interests TEXT[] DEFAULT '{}',
  career_goals TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Clubs (Verified Ecosystem)
CREATE TABLE public.clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  category TEXT,
  verification_status club_verification_status NOT NULL DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.users(id),
  official_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Club Members Junction
CREATE TABLE public.club_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('lead', 'member')) DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_club UNIQUE (user_id, club_id)
);

-- Opportunities Engine
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type opportunity_type NOT NULL,
  description TEXT NOT NULL,
  eligibility_criteria TEXT[] DEFAULT '{}',
  skills_required TEXT[] DEFAULT '{}',
  location_type location_type NOT NULL DEFAULT 'on_campus',
  location_details TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  deadline TIMESTAMPTZ NOT NULL,
  external_url TEXT,
  status opportunity_status NOT NULL DEFAULT 'draft',
  is_official BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Saved Opportunities (Student Bookmarks)
CREATE TABLE public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_saved_opportunity UNIQUE (user_id, opportunity_id)
);

-- Opportunity Registrations
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'registered',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT unique_user_registration UNIQUE (user_id, opportunity_id)
);

-- Student Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type notification_type NOT NULL DEFAULT 'info',
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Club Verification Audit Requests
CREATE TABLE public.club_verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  submitted_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  documents_url TEXT,
  status club_verification_status NOT NULL DEFAULT 'pending_review',
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INDEXES FOR HIGH-PERFORMANCE DISCOVERY
CREATE INDEX idx_opportunities_status_deadline ON public.opportunities(status, deadline);
CREATE INDEX idx_opportunities_type ON public.opportunities(type);
CREATE INDEX idx_opportunities_club ON public.opportunities(club_id);
CREATE INDEX idx_clubs_verification ON public.clubs(verification_status);
CREATE INDEX idx_saved_user ON public.saved_opportunities(user_id);
CREATE INDEX idx_registrations_user ON public.registrations(user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);

-- 4. AUTOMATED UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. AUTOMATED SUPABASE AUTH SYNC TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    'student' -- default role upon initial signup
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_verification_requests ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can read own record" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Super admins can read all user records" ON public.users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- STUDENT PROFILES POLICIES
CREATE POLICY "Students can read own profile" ON public.student_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Students can insert own profile" ON public.student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own profile" ON public.student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- CLUBS POLICIES
CREATE POLICY "Public read for verified clubs" ON public.clubs
  FOR SELECT USING (verification_status = 'verified' OR auth.uid() IS NOT NULL);

CREATE POLICY "Club members can update own club" ON public.clubs
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.club_members WHERE club_id = public.clubs.id AND user_id = auth.uid())
  );

CREATE POLICY "Super admins full access to clubs" ON public.clubs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );

-- OPPORTUNITIES POLICIES
CREATE POLICY "Public read published opportunities" ON public.opportunities
  FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Verified club reps can insert opportunities" ON public.opportunities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.club_members cm
      JOIN public.clubs c ON cm.club_id = c.id
      WHERE cm.club_id = public.opportunities.club_id
      AND cm.user_id = auth.uid()
      AND c.verification_status = 'verified'
    )
  );

CREATE POLICY "Club reps can update own opportunities" ON public.opportunities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.club_members cm
      WHERE cm.club_id = public.opportunities.club_id
      AND cm.user_id = auth.uid()
    )
  );

-- SAVED OPPORTUNITIES POLICIES
CREATE POLICY "Students manage own saved opportunities" ON public.saved_opportunities
  FOR ALL USING (auth.uid() = user_id);

-- REGISTRATIONS POLICIES
CREATE POLICY "Students manage own registrations" ON public.registrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Club reps can view registrations for their opportunities" ON public.registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.opportunities o
      JOIN public.club_members cm ON o.club_id = cm.club_id
      WHERE o.id = public.registrations.opportunity_id
      AND cm.user_id = auth.uid()
    )
  );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- CLUB VERIFICATION REQUESTS POLICIES
CREATE POLICY "Club reps can view/submit verification requests" ON public.club_verification_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.club_members
      WHERE club_id = public.club_verification_requests.club_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins manage verification requests" ON public.club_verification_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
  );
