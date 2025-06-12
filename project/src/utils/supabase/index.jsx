import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://asjtslozpsphmcnzschb.supabase.co/";  // Replace with your Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzanRzbG96cHNwaG1jbnpzY2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDcwNDksImV4cCI6MjA2MTgyMzA0OX0.zgz8tm4_czUWgreb02_FFiZohnqc5AQxUy3CVIXPwMg";  // Replace with your Anon Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    redirectTo: "https://aleflabs.net/main?tab=feed",
  },
});