import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { toast } from "react-toastify";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const verifyUser = async (token) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/login_with_google`, {
        token,
      });

      if (response.status === 200 && response.data?.user) {
        const userData = response.data.user;
        setUser(userData);
        localStorage.setItem("access_token", token);
        localStorage.setItem("user_data", JSON.stringify(userData));
        toast.success("✅ Authenticated");
      } else {
        throw new Error("No user data in response");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_data");
      toast.warning("⚠️ Invalid Authentication");
    }
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (token) {
        const cachedToken = localStorage.getItem("access_token");
        const cachedUser = localStorage.getItem("user_data");

        if (!cachedToken || token !== cachedToken || !cachedUser) {
          await verifyUser(token);
        } else {
          setUser(JSON.parse(cachedUser));
        }
      }
    };

    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const token = session?.access_token;
        if (token) {
          await verifyUser(token);
        } else {
          setUser(null);
          localStorage.removeItem("access_token");
          localStorage.removeItem("user_data");
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
