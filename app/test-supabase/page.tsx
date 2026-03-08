import { createClient } from '@/lib/supabase/server'

export default async function TestSupabasePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getSession()

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-2xl font-bold">Prueba Supabase</h1>
        <p className="mt-4 text-zinc-300">
          Si esta página carga, la conexión básica está hecha.
        </p>

        <div className="mt-6 rounded-xl bg-zinc-950 p-4 text-sm text-zinc-300">
          <p><strong>Error:</strong> {error ? error.message : 'ninguno'}</p>
          <p className="mt-2">
            <strong>Sesión activa:</strong> {data.session ? 'sí' : 'no'}
          </p>
        </div>
      </div>
    </main>
  )
}
