CREATE TABLE IF NOT EXISTS public.tiktok_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  followers integer NOT NULL,
  likes integer NOT NULL,
  connections integer NOT NULL,
  date_iso text NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  week integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for tiktok_logs
ALTER TABLE public.tiktok_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own tiktok logs" ON public.tiktok_logs FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own tiktok logs" ON public.tiktok_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own tiktok logs" ON public.tiktok_logs FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own tiktok logs" ON public.tiktok_logs FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
