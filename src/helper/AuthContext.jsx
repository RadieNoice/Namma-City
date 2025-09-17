import React, { createContext, useState, useEffect, useContext } from "react";
import supabase from "./supabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Get current session on mount
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // 2️⃣ Listen for auth state changes
    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 3️⃣ Cleanup
    return () => {
      supabase.auth.onAuthStateChange(() => {}); // no explicit unsubscribe needed in v2
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
