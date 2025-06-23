import { useEffect } from "react";
import { supabase } from "../../utils/supabase";
import { useNavigate } from 'react-router-dom';

export default function OAuthCallbackHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const sendTokenToBackend = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("❌ Supabase session error:", error);
        return;
      }

      const token = session.access_token;
      console.log("✅ Got token:", token);

      const res = await fetch("https://aleflabs.net/login_with_google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await res.json();
      console.log("🎯 Backend response:", result);
      if (result.message === "Login successful" && result.user) {
        navigate("/")
      } else {
        navigate("/")
      }
    };

    sendTokenToBackend();
  }, []);

  return (
    <div className="text-center mt-10 text-gray-700 dark:text-gray-200">
      Logging in...
    </div>
  );
}
