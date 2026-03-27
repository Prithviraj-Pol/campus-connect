
-- 1. Create colleges table
CREATE TABLE public.colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Colleges viewable by all authenticated" ON public.colleges FOR SELECT TO authenticated USING (true);

-- 2. Create venues table
CREATE TABLE public.venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  college_id uuid NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
  name text NOT NULL,
  capacity integer NOT NULL DEFAULT 100,
  facilities text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view venues of their college" ON public.venues FOR SELECT TO authenticated
  USING (college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Admins can insert venues for their college" ON public.venues FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can update venues of their college" ON public.venues FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
  );
CREATE POLICY "Admins can delete venues of their college" ON public.venues FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 3. Add college_id to profiles
ALTER TABLE public.profiles ADD COLUMN college_id uuid REFERENCES public.colleges(id);

-- 4. Update events table: add college_id, venue_id, registration_fee, max_capacity, external_link
ALTER TABLE public.events ADD COLUMN college_id uuid REFERENCES public.colleges(id);
ALTER TABLE public.events ADD COLUMN venue_id uuid REFERENCES public.venues(id);
ALTER TABLE public.events ADD COLUMN registration_fee numeric NOT NULL DEFAULT 0;
ALTER TABLE public.events ADD COLUMN max_capacity integer NOT NULL DEFAULT 100;
ALTER TABLE public.events ADD COLUMN external_link text;

-- Drop old unique index on (venue, date)
DROP INDEX IF EXISTS idx_events_venue_date_unique;

-- Create new unique index on (venue_id, date, college_id) excluding rejected
CREATE UNIQUE INDEX idx_events_venue_date_college_unique ON public.events (venue_id, date, college_id) WHERE status != 'rejected';

-- 5. Update registrations: add payment_status
ALTER TABLE public.registrations ADD COLUMN payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.registrations ADD COLUMN phone text;
ALTER TABLE public.registrations ADD COLUMN semester text;

-- 6. Update RLS on events for tenant isolation
DROP POLICY IF EXISTS "All authenticated users can view events" ON public.events;
CREATE POLICY "Users can view events of their college" ON public.events FOR SELECT TO authenticated
  USING (college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "HODs can create events" ON public.events;
CREATE POLICY "HODs can create events for their college" ON public.events FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'hod'::app_role)
    AND college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events of their college" ON public.events FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND college_id = (SELECT college_id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 7. Update RLS on registrations for tenant isolation
DROP POLICY IF EXISTS "Students can register for events" ON public.registrations;
CREATE POLICY "Students can register for events" ON public.registrations FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = student_id
    AND has_role(auth.uid(), 'student'::app_role)
  );

-- 8. Seed two colleges
INSERT INTO public.colleges (id, name) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Tech University'),
  ('22222222-2222-2222-2222-222222222222', 'Global Arts');
