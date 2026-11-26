import { useState } from 'react'
import { supabase } from '../supabase'

export default function Companies({ companies, reload }) {
  const [edit, setEdit] = useState(null)
  const [msg, setMsg] = useState('')

  async function guardar(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    const values = { name: f.nombre, domain: f.dominio || null, contact_email: f.correo || null, registration_info: f.registro || null, active: f.activa === 'on' }
    const { error } = edit.id ? await supabase.from('companies').update(values).eq('id', edit.id) : await supabase.from('companies').insert(values)
    if (error) return setMsg('No se pudo guardar: ' + error.message)
    setEdit(null); setMsg(''); reload()
  }

  return (
    <>
      <div className="toolbar"><button className="btn small" onClick={() => setEdit({})}>Nueva empresa</button></div>
      {edit && (
        <form className="card" onSubmit={guardar} key={edit.id || 'nueva'}>
          <h3>{edit.id ? 'Editar empresa' : 'Nueva empresa'}</h3>
          <div className="row2">
            <label>Nombre<input name="nombre" defaultValue={edit.name} required /></label>
            <label>Dominio de correo<input name="dominio" defaultValue={edit.domain || ''} placeholder="empresa.com" /></label>
            <label>Correo de contacto<input name="correo" type="email" defaultValue={edit.contact_email || ''} /></label>
            <label>Registro de la empresa<input name="registro" defaultValue={edit.registration_info || ''} /></label>
          </div>
          <label className="check"><input type="checkbox" name="activa" defaultChecked={edit.id ? edit.active : true} /> Empresa activa</label>
          <button className="btn small">Guardar</button>{' '}
          <button type="button" className="btn sec small" onClick={() => setEdit(null)}>Cancelar</button>
          {msg && <p className="err">{msg}</p>}
        </form>
      )}
      <div className="scroll">
        <table className="table">
          <thead><tr><th>Empresa</th><th className="hide-sm">Dominio</th><th>Contacto</th><th>Estado</th><th /></tr></thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id}>
                <td><b>{c.name}</b></td><td className="hide-sm">{c.domain}</td><td>{c.contact_email}</td>
                <td><span className="chip">{c.active ? 'Activa' : 'Inactiva'}</span></td>
                <td><button className="mini" onClick={() => setEdit(c)}>Editar</button></td>
              </tr>
            ))}
            {companies.length === 0 && <tr><td colSpan="5" className="muted">Aún no hay empresas. Agrega la primera.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  )
}
