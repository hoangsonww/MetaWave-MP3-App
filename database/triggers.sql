CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = 'public, auth'
AS $$
DECLARE
user_name   TEXT;
  user_handle TEXT;
BEGIN
  -- 1) derive display name
  user_name := COALESCE(
    NEW.raw_user_meta_data ->> 'name',
    NEW.email
  );

  -- 2) derive handle: metadata 'handle' or email prefix, then sanitize
  user_handle := lower(
    regexp_replace(
      COALESCE(
        NEW.raw_user_meta_data ->> 'handle',
        split_part(NEW.email, '@', 1)
      ),
      '[^a-z0-9_]',
      '_',
      'g'
    )
  );

INSERT INTO public.profiles (
    id,
    email,
    name,
    handle,
    created_at,
    updated_at
) VALUES (
             NEW.id,
             NEW.email,
             user_name,
             user_handle,
             now(),
             now()
         );

RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_new_user();
