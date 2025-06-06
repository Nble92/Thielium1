import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://swrizemcslheqscimzwp.supabase.co";  // Replace with your Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3cml6ZW1jc2xoZXFzY2ltendwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4MjI2OTAsImV4cCI6MjA1NzM5ODY5MH0.SOEqr5aqLmyEeeUXW7J2ENWkd-xb9FXVdnrw5z-oA0c";  // Replace with your Anon Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    redirectTo: "https://aleflabs.net/main?tab=feed",
  },
});