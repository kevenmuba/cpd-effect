CREATE TABLE IF NOT EXISTS public.general_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  plan text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Turn on RLS for general_plans
ALTER TABLE public.general_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own general plan" ON public.general_plans FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own general plan" ON public.general_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own general plan" ON public.general_plans FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


CREATE TABLE IF NOT EXISTS public.activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  action text NOT NULL,
  impacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  date text NOT NULL,
  date_iso text NOT NULL,
  eth_week text NOT NULL,
  year integer NOT NULL,
  is_penalty boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own activities" ON public.activities FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own activities" ON public.activities FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
