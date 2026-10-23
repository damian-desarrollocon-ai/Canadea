import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from './supabase'

const STAFF = ['admin', 'reclutador']
const Ctx = createContext({ session: null, role: null, loading: false, signOut: () => {} })
export const useAuth = () => useContext(Ctx)
export const isStaff = role => STAFF.includes(role)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(!!supabase)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!supabase) return
    if (!session) { setRole(null); setLoading(false); return }
    setLoading(true)
    supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => { setRole(data?.role ?? 'candidato'); setLoading(false) })
  }, [session])

  const signOut = () => supabase?.auth.signOut()
  return <Ctx.Provider value={{ session, role, loading, signOut }}>{children}</Ctx.Provider>
}

// Protege rutas: sin sesión → login; `staff` exige rol admin o reclutador
export function RequireAuth({ staff = false, children }) {
  const { session, role, loading } = useAuth()
  if (!supabase) return <section className="wrap"><p>Conecta Supabase en el archivo .env para usar esta sección.</p></section>
  if (loading) return <section className="wrap"><p>Cargando…</p></section>
  if (!session) return <Navigate to="/login" replace />
  if (staff && !isStaff(role)) return <Navigate to="/cuenta" replace />
  return children
}