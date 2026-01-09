import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tsbmogjzkmkiapwlhfvi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzYm1vZ2p6a21raWFwd2xoZnZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzY3NzksImV4cCI6MjA4MzU1Mjc3OX0.HfJfJZv9zmOKMhPJZo0g8SPBDIflfSwrMehl9Vxf244";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);