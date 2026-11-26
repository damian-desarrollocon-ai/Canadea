import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../auth'

const ROLES = { admin: 'Administrador', reclutador: 'Reclutador', candidato: 'Sin acceso al panel' }

export default function Team() {
  const { session } = useAuth()
  const [equipo, setEquipo] = useState([])
  const [msg, setMsg] = useState(null)

  async function cargar() {
    const { data, error } = await supabase.rpc('listar_equipo')
    if (error) { console.error(error); return setMsg({ ok: false, text: 'No se pudo cargar el equipo.' }) }
    setEquipo(data || [])
  }
  useEffect(() => { cargar() }, [])

  async function cambiar(email, role) {
    const { error } = await supabase.rpc('set_user_role', { p_email: email, p_role: role })
    if (error) return setMsg({ ok: false, text: error.message })
    setMsg({ ok: true, text: 'Permisos actualizados.' }); cargar()
  }
  const dar = e => { e.preventDefault(); const f = Object.fromEntries(new FormData(e.target)); const form = e.target; cambiar(f.email, f.role).then(() => form.reset()) }

  return (
    <>
      {msg && <p className={'alert ' + (msg.ok ? 'ok' : 'bad')} role="status">{msg.text}</p>}
      <form className="card" onSubmit={dar}>
        <h3>Dar acceso al panel</h3>
        <p className="help">La persona debe tener una cuenta creada en el sitio con ese correo.</p>
        <div className="row2">
          <label>Correo<input name="email" type="email" required /></label>
          <label>Rol<select name="role"><option value="reclutador">Reclutador</option><option value="admin">Administrador</option></select></label>
        </div>
        <button className="btn small">Dar acceso</button>
      </form>
      <div className="scroll">
        <table className="table">
          <thead><tr><th>Correo</th><th>Rol</th><th /></tr></thead>
          <tbody>
            {equipo.map(u => (
              <tr key={u.id}>
                <td>{u.email}{u.id === session.user.id && ' (tú)'}</td>
                <td><span className="chip">{ROLES[u.role]}</span></td>
                <td>{u.id !== session.user.id && <button className="mini" onClick={() => cambiar(u.email, 'candidato')}>Quitar acceso</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
