import { useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../auth'
import { stages } from '../brand'
import { validarArchivo } from '../files'
import { nombreDoc, ESTADOS, fecha, abrirDocumento } from '../lib/docs'

const TIPOS = ['pasaporte', 'cv', 'ine', 'rostro', 'permiso']
const labelEtapa = k => stages.find(s => s.key === k)?.label || k

export default function CandidateDetail({ app: a, companies, reload, onBack }) {
  const { session, role } = useAuth()
  const [msg, setMsg] = useState(null)
  const c = a.candidates || {}
  const flash = (text, ok = true) => setMsg({ text, ok })
  const vals = e => { e.preventDefault(); return Object.fromEntries(new FormData(e.target)) }
  async function run(promise, ok) {
    const { error } = await promise
    if (error) { console.error(error); flash('No se pudo guardar: ' + error.message, false); return false }
    flash(ok); await reload(); return true
  }
  const upsert = (table, cur, values, ok) => run(
    cur ? supabase.from(table).update(values).eq('id', cur.id) : supabase.from(table).insert({ application_id: a.id, ...values }), ok)

  async function setStage(stage) {
    const { error } = await supabase.from('applications').update({ stage }).eq('id', a.id)
    if (error) return flash('No se pudo cambiar la etapa: ' + error.message, false)
    await supabase.from('application_status_history').insert({ application_id: a.id, stage, changed_by: session.user.id })
    flash('Etapa actualizada. Recuerda avisar al candidato por correo.'); await reload()
  }
  const saveApp = e => { const f = vals(e); run(supabase.from('applications').update({ program: f.programa, job_title: f.vacante || null, company_id: f.empresa || null }).eq('id', a.id), 'Datos del proceso guardados.') }
  const saveCand = e => { const f = vals(e); run(supabase.from('candidates').update({ full_name: f.nombre, email: f.email || null, phone: f.telefono || null, birth_date: f.nacimiento }).eq('id', c.id), 'Datos personales guardados.') }
  const review = (d, status, motivo = null) => run(
    supabase.from('documents').update({ status, reject_reason: motivo, reviewed_by: session.user.id, updated_at: new Date().toISOString() }).eq('id', d.id),
    status === 'aprobado' ? 'Documento aprobado.' : 'Documento rechazado.')
  const rechazar = d => { const m = window.prompt('Motivo del rechazo (lo verá el candidato):'); if (m) review(d, 'rechazado', m) }
  const ver = d => abrirDocumento(d.file_path).catch(() => flash('No se pudo abrir el documento.', false))

  async function subir(e) {
    const form = e.target; const f = vals(e)
    const problema = validarArchivo(f.archivo); if (problema) return flash(problema, false)
    const ext = (f.archivo.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `${c.user_id || 'pre/' + c.id}/${f.tipo}-${Date.now()}.${ext}`
    const up = await supabase.storage.from('documentos').upload(path, f.archivo, { contentType: f.archivo.type })
    if (up.error) return flash('No se pudo subir: ' + up.error.message, false)
    if (await run(supabase.from('documents').insert({ application_id: a.id, doc_type: f.tipo, file_path: path }), 'Documento subido.')) form.reset()
  }
  const askExtra = e => { const form = e.target; const f = vals(e); run(supabase.from('extra_document_requests').insert({ application_id: a.id, doc_type: f.tipo, note: f.nota || null }), 'Documento adicional solicitado.').then(ok => ok && form.reset()) }
  const saveTraining = e => { const f = vals(e); upsert('trainings', a.trainings?.[0], { start_date: f.fecha, location: f.lugar, details: f.detalle, company_id: a.company_id }, 'Capacitación guardada.') }
  const saveFlight = e => { const f = vals(e); upsert('flights', a.flights?.[0], { route: f.ruta, flight_date: f.fecha, airline: f.aerolinea || null }, 'Vuelo guardado.') }
  const addNote = e => { const form = e.target; const f = vals(e); run(supabase.from('admin_notes').insert({ application_id: a.id, author: session.user.id, body: f.nota }), 'Nota agregada.').then(ok => ok && form.reset()) }
  async function borrar() {
    if (window.prompt(`Esto elimina el registro de ${c.full_name} y todo su avance. Escribe ELIMINAR para confirmar:`) !== 'ELIMINAR') return
    const { error } = await supabase.from('candidates').delete().eq('id', c.id)
    if (error) return flash('No se pudo eliminar: ' + error.message, false)
    await reload(); onBack()
  }

  let tel = (c.phone || '').replace(/\D/g, ''); if (tel.length === 10) tel = '52' + tel
  const historial = [...(a.application_status_history || [])].sort((x, y) => new Date(y.changed_at) - new Date(x.changed_at))
  const notas = [...(a.admin_notes || [])].sort((x, y) => new Date(y.created_at) - new Date(x.created_at))

  return (
    <>
      <div className="dash-head">
        <div>
          <button className="linkbtn" onClick={onBack}>← Volver a candidatos</button>
          <h1>{c.full_name}</h1>
          <p className="dash-sub">{a.folio} · registrado el {fecha(a.created_at)}{!c.user_id && ' · sin cuenta en el sitio'}</p>
        </div>
        <div className="acts" style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {c.email && <a className="btn sec small" href={`mailto:${c.email}?subject=${encodeURIComponent('Tu proceso en Canadea · ' + a.folio)}`}>Enviar correo</a>}
          {tel && <a className="btn sec small" href={`https://wa.me/${tel}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
        </div>
      </div>
      {msg && <p className={'alert ' + (msg.ok ? 'ok' : 'bad')} role="status">{msg.text}</p>}

      <div className="grid2">
        <div>
          <div className="card">
            <h3>Documentos</h3>
            {a.documents.map(d => (
              <div className="doc" key={d.id}>
                <div><b>{nombreDoc(d.doc_type)}</b> <span className={'tag ' + d.status}>{ESTADOS[d.status]}</span><div className="meta">{fecha(d.updated_at)}</div></div>
                <div className="acts">
                  <button className="mini" onClick={() => ver(d)}>Ver</button>
                  <button className="mini" onClick={() => review(d, 'aprobado')}>Aprobar</button>
                  <button className="mini" onClick={() => rechazar(d)}>Rechazar</button>
                </div>
                {d.reject_reason && <small>Motivo: {d.reject_reason}</small>}
              </div>
            ))}
            {a.documents.length === 0 && <p className="help">Sin documentos.</p>}
            <form onSubmit={subir} style={{ marginTop: '1rem' }}>
              <h3>Subir documento en nombre del candidato</h3>
              <div className="row2">
                <label>Tipo<select name="tipo">{TIPOS.map(t => <option key={t} value={t}>{nombreDoc(t)}</option>)}</select></label>
                <label>Archivo<input name="archivo" type="file" accept=".pdf,image/*" required /></label>
              </div>
              <button className="btn small">Subir</button>
            </form>
            <form onSubmit={askExtra} style={{ marginTop: '1rem' }}>
              <h3>Solicitar documento adicional</h3>
              <div className="row2">
                <label>Documento<input name="tipo" required /></label>
                <label>Nota para el candidato<input name="nota" /></label>
              </div>
              <button className="btn small">Solicitar</button>
            </form>
            {a.extra_document_requests.map(x => <p key={x.id} className="help">{x.doc_type}: {x.fulfilled ? 'entregado' : 'pendiente'}</p>)}
          </div>

          <form className="card" onSubmit={saveCand}>
            <h3>Datos personales</h3>
            <div className="row2">
              <label>Nombre completo<input name="nombre" defaultValue={c.full_name} required /></label>
              <label>Fecha de nacimiento<input name="nacimiento" type="date" defaultValue={c.birth_date} required /></label>
              <label>Correo<input name="email" type="email" defaultValue={c.email || ''} /></label>
              <label>Teléfono<input name="telefono" defaultValue={c.phone || ''} /></label>
            </div>
            <button className="btn small">Guardar datos</button>
          </form>

          <form className="card" onSubmit={saveTraining}>
            <h3>Capacitación pagada</h3>
            <div className="row2">
              <label>Fecha<input name="fecha" type="date" defaultValue={a.trainings?.[0]?.start_date} required /></label>
              <label>Lugar<input name="lugar" defaultValue={a.trainings?.[0]?.location} required /></label>
            </div>
            <label>Detalle para el candidato<input name="detalle" defaultValue={a.trainings?.[0]?.details} required /></label>
            <button className="btn small">Guardar</button>
          </form>

          <form className="card" onSubmit={saveFlight}>
            <h3>Vuelo</h3>
            <div className="row2">
              <label>Ruta<input name="ruta" defaultValue={a.flights?.[0]?.route} required /></label>
              <label>Fecha<input name="fecha" type="date" defaultValue={a.flights?.[0]?.flight_date} required /></label>
            </div>
            <label>Aerolínea<input name="aerolinea" defaultValue={a.flights?.[0]?.airline || ''} /></label>
            <button className="btn small">Guardar</button>
          </form>
        </div>

        <div>
          <div className="card">
            <h3>Etapa</h3>
            <select value={a.stage} onChange={e => setStage(e.target.value)}>
              {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <form className="card" onSubmit={saveApp}>
            <h3>Proceso</h3>
            <label>Programa<select name="programa" defaultValue={a.program || 'temporal'}><option value="temporal">Trabajo temporal</option><option value="permanente">Con permanencia</option></select></label>
            <label>Empresa asignada<select name="empresa" defaultValue={a.company_id || ''}><option value="">Sin asignar</option>{companies.filter(x => x.active).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
            <label>Vacante<input name="vacante" defaultValue={a.job_title || ''} /></label>
            <button className="btn small">Guardar</button>
          </form>
          <div className="card">
            <h3>Notas internas</h3>
            <p className="help">Solo las ve el equipo, no el candidato.</p>
            <form onSubmit={addNote}><label>Nueva nota<input name="nota" required /></label><button className="btn small">Agregar</button></form>
            {notas.map(n => <div className="note" key={n.id}>{n.body}<small>{fecha(n.created_at)}</small></div>)}
          </div>
          <div className="card">
            <h3>Historial de etapas</h3>
            <ul className="hist">{historial.map(h => <li key={h.id}>{labelEtapa(h.stage)}<span>{fecha(h.changed_at)}</span></li>)}</ul>
            {historial.length === 0 && <p className="help">Sin movimientos todavía.</p>}
          </div>
          {role === 'admin' && <div className="card"><h3>Zona de riesgo</h3><button className="btn danger small" onClick={borrar}>Eliminar registro</button></div>}
        </div>
      </div>
    </>
  )
}
