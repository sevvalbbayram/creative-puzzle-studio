import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useTeacherAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      // Anonymous users carry is_anonymous: true — exclude them
      setUser(u && !u.is_anonymous ? u : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u && !u.is_anonymous ? u : null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { user: data.user };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName ?? email.split("@")[0] } },
    });
    if (error) return { error: error.message };
    return { user: data.user };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  // Derive a friendly display name from the user record
  const displayName = user
    ? (user.user_metadata?.display_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Teacher"
    : null;

  return {
    user,
    loading,
    isTeacher: !!user,
    displayName,
    signIn,
    signUp,
    signOut,
  };
}
