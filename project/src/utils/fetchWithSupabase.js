import { supabase } from "./supabase";

export const fetchWithSupabase = async (url, options = {}) => {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    console.error("❌ Supabase session error:", error);
    throw new Error("Unauthorized");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${session.access_token}`,
  };

  return fetch(url, { ...options, headers });
};
