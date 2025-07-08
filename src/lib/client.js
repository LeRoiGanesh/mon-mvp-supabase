import { createClient } from "@supabase/supabase-js";

// Remplace par tes propres infos Supabase
const supabaseUrl = "https://brudaqouzlpvhfkzpukd.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydWRhcW91emxwdmhma3pwdWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjA5OTIsImV4cCI6MjA2NzQ5Njk5Mn0.BbAczoCtHknMKTeJvf1G1jI9NyxCtrfO5YkyQEOZ3xA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
