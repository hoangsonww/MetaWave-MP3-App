// hooks/useSessionProfile.ts
import { useEffect, useState } from "react";
import { supabase } from "@/supabase/client";
import { getProfileById, Profile } from "@/supabase/queries";

export function useSessionProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      if (!user) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const p = await getProfileById(user.id); // <-- use correct helper
        if (mounted) setProfile(p);
      } catch {
        /* swallow */
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return { profile, loading };
}
