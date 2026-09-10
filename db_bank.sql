CREATE TABLE IF NOT EXISTS public.bank_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  date_iso text NOT NULL,
  year integer NOT NULL,
  month integer NOT NULL,
  week integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS for bank_logs
ALTER TABLE public.bank_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view own bank logs" ON public.bank_logs FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own bank logs" ON public.bank_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
  CREATE POLICY "Users can update own bank logs" ON public.bank_logs FOR UPDATE USING (auth.uid() = user_id);
  CREATE POLICY "Users can delete own bank logs" ON public.bank_logs FOR DELETE USING (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
