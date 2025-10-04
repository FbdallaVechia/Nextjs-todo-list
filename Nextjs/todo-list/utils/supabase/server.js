import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // Use a chave anônima aqui também
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ação de servidor chamada em um componente de cliente
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, '', ...options })
          } catch (error) {
            // Ação de servidor chamada em um componente de cliente
          }
        },
      },
    }
  )
}