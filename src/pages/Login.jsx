import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, demoMode } from '../supabase'
import { isStaff } from '../auth'
import Logo from '../Logo'

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (demoMode) return nav('/consulta')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setError('Correo o contraseña incorrectos.')
    const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    nav(isStaff(p?.role) ? '/admin' : '/cuenta')
  }

  return (
    <section className="wrap narrow">
      <div className="auth-logo site-logo"><Logo /></div>
      <h1>Ingresar</h1>
      <form onSubmit={onSubmit} className="card">
        <label>Correo<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
        <label>Contraseña<input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
        <button className="btn">Ingresar</button>
        {error && <p className="err" role="alert">{error}</p>}
        {demoMode && <p className="hint">Demo: cualquier dato te lleva a la consulta de folio.</p>}
      </form>
      <p>¿Aún no tienes cuenta? <Link to="/registro">Regístrate</Link></p>
    </section>
  )
}