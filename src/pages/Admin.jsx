import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../auth'
import { stages } from '../brand'

const NOMBRES = { pasaporte: 'Pasaporte', cv: 'CV', ine: 'INE', rostro: 'Foto de rostro', permiso: 'Permiso de trabajo' }
const nombre = t => NOMBRES[t] || t
const SELECT = `id, folio, stage, program, company_id,
  candidates(full_name, email, phone),
  documents(id, doc_type, status, reject_reason, file_path),
  flights(id, route, flight_date, airline),
  trainings(id, start_date, location, details),
  extra_document_requests(id, doc_type, note, fulfilled)`

export default function Admin() {
  const { session } = useAuth()
  const [rows, setRows] = useState([])
  const [companies, setCompanies] = useState([])
  const [sel, setSel] = useState(null)
  const [msg, setMsg] = useState('')

  async function load() {
    const [a, c] = await Promise.all([
      supabase.from('applications').select(SELECT).order('created_at', { ascending: false }),
      supabase.from('companies').select('id, name').eq('active', true),
    ])
    if (a.error) { console.error(a.error); setMsg('No pudimos cargar los candidatos.') }
    setRows(a.data || []); setCompanies(c.data || [])
    setSel(s => s ?? a.data?.[0]?.id ?? null)
  }
  useEffect(() => { load() }, [])

  const r = rows.find(x => x.id === sel)

  async function run(promise, ok) {
    const { error } = await promise
    if (error) { console.error(error); return setMsg('No se pudo guardar: ' + error.message) }
    setMsg(ok); await load()
  }
  const form = e => { e.preventDefault(); return Object.fromEntries(new FormData(e.target)) }

  const setStage = stage => run(Promise.all([
    supabase.from('applications').update({ stage }).eq('id', r.id),
    supabase.from('application_status_history').insert({ application_id: r.id, stage, changed_by: session.user.id }),
  ]).then(([a, h]) => ({ error: a.error || h.error })), 'Etapa actualizada.')
  const setCompany = v => run(supabase.from('applications').update({ company_id: v || null }).eq('id', r.id), 'Empresa asignada.')
  const reviewDoc = (d, status, motivo = null) => run(
    supabase.from('documents').update({ status, reject_reason: motivo, reviewed_by: session.user.id, updated_at: new Date().toISOString() }).eq('id', d.id),
    status === 'aprobado' ? 'Documento aprobado.' : 'Documento rechazado.')
  const rechazar = d => { const m = window.prompt('Motivo del rechazo (lo verá el candidato):'); if (m) reviewDoc(d, 'rechazado', m) }
  async function verDoc(d) {
    const { data, error } = await supabase.storage.from('documentos').createSignedUrl(d.file_path, 60)
    if (error) return setMsg('No se pudo abrir el documento.')
    window.open(data.signedUrl, '_blank', 'noopener')
  }
  const upsert = (table, cur, values, ok) => run(
    cur ? supabase.from(table).update(values).eq('id', cur.id) : supabase.from(table).insert({ application_id: r.id, ...values }), ok)
  const saveFlight = e => { const f = form(e); upsert('flights', r.flights?.[0], { route: f.ruta, flight_date: f.fecha, airline: f.aerolinea }, 'Vuelo guardado.') }
  const saveTraining = e => { const f = form(e); upsert('trainings', r.trainings?.[0], { start_date: f.fecha, location: f.lugar, details: f.detalle, company_id: r.company_id }, 'Capacitación guardada.') }
  const askExtra = e => { const f = form(e); run(supabase.from('extra_document_requests').insert({ application_id: r.id, doc_type: f.tipo, note: f.nota }), 'Documento adicional solicitado.'); e.target.reset() }

  return (
    <section className="wrap">
      <h1>Panel interno</h1>
      {msg && <p className="notice" role="status">{msg}</p>}
      <div className="admin">
        <aside className="card">
          <h3>Candidatos ({rows.length})</h3>
          {rows.map(x => (
            <button key={x.id} className={'row' + (x.id === sel ? ' on' : '')} onClick={() => setSel(x.id)}>
              <b>{x.candidates?.full_name}</b><small>{x.folio} · {x.program}</small>
            </button>
          ))}
          {rows.length === 0 && <p className="muted">Aún no hay registros.</p>}
        </aside>
        {r && (
          <div key={r.id}>
            <div className="card">
              <h2>{r.candidates?.full_name}</h2>
              <p className="muted">{r.candidates?.email} · {r.candidates?.phone}</p>
              <label>Etapa
                <select value={r.stage} onChange={e => setStage(e.target.value)}>
                  {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </label>
              <label>Empresa asignada
                <select value={r.company_id || ''} onChange={e => setCompany(e.target.value)}>
                  <option value="">Sin asignar</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
            </div>
            <div className="card">
              <h3>Documentos</h3>
              <ul className="docs">
                {r.documents.map(d => (
                  <li key={d.id}>
                    <span>{nombre(d.doc_type)}</span><b className={'tag ' + d.status}>{d.status}</b>
                    <span>
                      <button className="mini" onClick={() => verDoc(d)}>Ver</button>{' '}
                      <button className="mini" onClick={() => reviewDoc(d, 'aprobado')}>Aprobar</button>{' '}
                      <button className="mini" onClick={() => rechazar(d)}>Rechazar</button>
                    </span>
                    {d.reject_reason && <small>{d.reject_reason}</small>}
                  </li>
                ))}
              </ul>
              <form onSubmit={askExtra}>
                <h3>Solicitar documento adicional</h3>
                <label>Documento<input name="tipo" required /></label>
                <label>Nota para el candidato<input name="nota" /></label>
                <button className="btn">Solicitar</button>
              </form>
              {r.extra_document_requests.map(x => <p key={x.id} className="muted">{x.doc_type}: {x.fulfilled ? 'entregado' : 'pendiente'}</p>)}
            </div>
            <form className="card" onSubmit={saveTraining}>
              <h3>Capacitación pagada</h3>
              <label>Fecha<input name="fecha" type="date" defaultValue={r.trainings?.[0]?.start_date} required /></label>
              <label>Lugar<input name="lugar" defaultValue={r.trainings?.[0]?.location} required /></label>
              <label>Detalle para el candidato<input name="detalle" defaultValue={r.trainings?.[0]?.details} required /></label>
              <button className="btn">Guardar</button>
            </form>
            <form className="card" onSubmit={saveFlight}>
              <h3>Vuelo</h3>
              <label>Ruta<input name="ruta" defaultValue={r.flights?.[0]?.route} required /></label>
              <label>Fecha<input name="fecha" type="date" defaultValue={r.flights?.[0]?.flight_date} required /></label>
              <label>Aerolínea<input name="aerolinea" defaultValue={r.flights?.[0]?.airline} /></label>
              <button className="btn">Guardar</button>
            </form>
          </div>
        )}
      </div>
    </section>
  )
}