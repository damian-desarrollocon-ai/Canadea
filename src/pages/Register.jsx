import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, demoMode } from '../supabase'
import Logo from '../Logo'

const MAX_MB = 10
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const required = [['pasaporte', 'Pasaporte'], ['cv', 'CV'], ['ine', 'INE']]

function validar(file) {
  if (!file) return null
  if (!TIPOS.includes(file.type)) return `${file.name}: solo se aceptan PDF, JPG, PNG o WEBP.`
  if (file.size > MAX_MB * 1024 * 1024) return `${file.name}: pesa más de ${MAX_MB} MB.`
  return null
}

export default function Register() {
  const [f, setF] = useState({ nombre: '', email: '', password: '', nacimiento: '', telefono: '', programa: 'temporal' })
  const [files, setFiles] = useState({})
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState('')
  const [folio, setFolio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.value })
  const setFile = k => e => setFiles({ ...files, [k]: e.target.files[0] })

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const problema = Object.values(files).map(validar).find(Boolean)
    if (problema) return setError(problema)
    if (demoMode) return setStatus('ok')
    setLoading(true)
    try {
      const { data, error: authErr } = await supabase.auth.signUp({ email: f.email, password: f.password })
      if (authErr) throw authErr
      if (!data.session) return setStatus('confirmar') // el correo requiere confirmación antes de subir documentos
      const uid = data.user.id
      const { data: cand, error: cErr } = await supabase.from('candidates')
        .insert({ user_id: uid, full_name: f.nombre, birth_date: f.nacimiento, phone: f.telefono, email: f.email }).select().single()
      if (cErr) throw cErr
      const { data: app, error: aErr } = await supabase.from('applications')
        .insert({ candidate_id: cand.id, program: f.programa }).select('id, folio').single()
      if (aErr) throw aErr
      for (const [key, file] of Object.entries(files)) {
        if (!file) continue
        const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
        const path = `${uid}/${key}-${Date.now()}.${ext}`
        const { error: uErr } = await supabase.storage.from('documentos').upload(path, file, { contentType: file.type })
        if (uErr) throw uErr
        const { error: dErr } = await supabase.from('documents').insert({ application_id: app.id, doc_type: key, file_path: path })
        if (dErr) throw dErr
      }
      setFolio(app.folio)
      setStatus('ok')
    } catch (err) {
      console.error(err)
      setError(/already registered/i.test(err.message) ? 'Este correo ya tiene una cuenta. Ingresa con tu contraseña.' : 'No pudimos completar tu registro. Revisa tus datos e intenta de nuevo.')
    } finally { setLoading(false) }
  }

  if (status === 'ok') return (
    <section className="wrap narrow">
      <h1>Registro recibido</h1>
      {folio && <p>Tu folio es <b>{folio}</b>. Guárdalo: lo necesitas para consultar tu avance.</p>}
      <p>Revisaremos tus documentos y te avisaremos por correo.</p>
      <Link className="btn" to="/consulta">Consultar mi folio</Link>
    </section>
  )
  if (status === 'confirmar') return (
    <section className="wrap narrow"><h1>Confirma tu correo</h1><p>Te enviamos un mensaje a {f.email}. Confírmalo y vuelve a ingresar para continuar con tu registro.</p></section>
  )

  return (
    <section className="wrap narrow">
      <div className="auth-logo site-logo"><Logo /></div>
      <h1>Crear mi cuenta</h1>
      <form onSubmit={onSubmit} className="card">
        <label>Nombre completo<input value={f.nombre} onChange={set('nombre')} required /></label>
        <label>Correo<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Contraseña<input type="password" minLength={8} value={f.password} onChange={set('password')} required /></label>
        <label>Fecha de nacimiento<input type="date" value={f.nacimiento} onChange={set('nacimiento')} required /></label>
        <label>Teléfono<input value={f.telefono} onChange={set('telefono')} /></label>
        <label>Programa de interés
          <select value={f.programa} onChange={set('programa')}><option value="temporal">Trabajo temporal</option><option value="permanente">Con permanencia</option></select>
        </label>
        <h3>Tus documentos</h3>
        <p className="hint">PDF, JPG, PNG o WEBP. Máximo {MAX_MB} MB por archivo.</p>
        {required.map(([k, l]) => <label key={k}>{l}<input type="file" accept=".pdf,image/*" onChange={setFile(k)} required /></label>)}
        <label>Foto de tu rostro (selfie, de frente y con buena luz)
          <input type="file" accept="image/*" capture="user" onChange={setFile('rostro')} required />
        </label>
        <label>Permiso de trabajo (si ya cuentas con uno)<input type="file" accept=".pdf,image/*" onChange={setFile('permiso')} /></label>
        <label className="check">
          <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} required />
          Acepto el tratamiento de mis datos personales, incluidos mis documentos de identidad y la foto de mi rostro, conforme al <Link to="/privacidad">aviso de privacidad</Link> y los <Link to="/terminos">términos</Link>.
        </label>
        <button className="btn" disabled={loading || !consent}>{loading ? 'Enviando…' : 'Enviar registro'}</button>
        {error && <p className="err" role="alert">{error}</p>}
      </form>
    </section>
  )
}