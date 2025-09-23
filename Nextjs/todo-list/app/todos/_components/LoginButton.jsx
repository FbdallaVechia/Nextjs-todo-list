// app/todos/_components/LoginButton.jsx
'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginButton() {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://www.fabiodallavechia.com.br/todos',
      },
    });

    if (error) {
      console.error('Erro no login com Google:', error);
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleLogin}>
      Login com Google
    </button>
  );
}