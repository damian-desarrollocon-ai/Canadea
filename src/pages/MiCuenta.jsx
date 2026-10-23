import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { stages } from '../brand'
import { subirArchivo, validarArchivo } from '../files'

const NOMBRES = { pasaporte: 'Pasaporte', cv: 'CV', ine: 'INE', rostro: 'Foto de rostro', permiso: 'Permiso de trabajo' }
const nombre = t => NOMBRES[t] || t
const SELECT = `id, folio, stage, program, candidates(full_name), companies(name),
  documents(id, doc_type, status, reject_reason),
  flights(route, flight_date, airline),
  trainings(start_date, location, details),
  extra_document_requests(id, doc_type, note, fulfilled)`

export default function MiCuenta() {
  const [app, setApp] = useState(undefined)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data, error } = await supabase.from('applications').select(SELECT)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (error) { console.error(error); setMsg('No pudimos cargar tu información.') }
    setApp(data ?? null)
  }
  useEffect(() => { load() }, [])

  async function enviar(rpc, params, file) {
    const problema = validarArchivo(file)
    if (problema) return setMsg(problema)
    setBusy(true); setMsg('')
    try {
      const path = await subirArchivo(file)
      const { error } = await supabase.rpc(rpc, { ...params, p_path: path })
      if (error) throw error
      setMsg('Documento enviado. Lo revisaremos pronto.')
      await load()
    } catch (e) { console.error(e); setMsg('No pudimos subir el archivo. Intenta de nuevo.') }
    finally { setBusy(false) }
  }

  if (app === undefined) return <section className="wrap"><p>Cargando…</p></section>
  if (app === null) return (
    <section className="wrap narrow"><h1>Mi cuenta</h1><p>Aún no encontramos un registro asociado a tu cuenta.</p><Link className="btn" to="/registro">Completar registro</Link></section>
  )

  const idx = stages.findIndex(s => s.key === app.stage)
  const training = app.trainings?.[0]
  const flight = app.flights?.[0]
  const extras = (app.extra_document_requests || []).filter(x => !x.fulfilled)

  return (
    <section className="wrap narrow">
      <h1>Hola, {app.candidates?.full_name?.split(' ')[0]}</h1>
      <p className="muted">Tu folio: <b>{app.folio}</b>{app.companies?.name && <> · Empresa: <b>{app.companies.name}</b></>}</p>
      {msg && <p className="notice" role="status">{msg}</p>}

      <div className="card">
        <h3>Avance de tu proceso</h3>
        <ol className="timeline">
          {stages.map((s, i) => <li key={s.key} className={i < idx ? 'done' : i === idx ? 'now' : ''}>{s.label}</li>)}
        </ol>
      </div>

      {training && (
        <div className="notice">
          <h3>Capacitación pagada</h3>
          <p><b>{training.start_date}</b> · {training.location}</p>
          <p>{training.details}</p>
        </div>
      )}
      {flight && <div className="card"><h3>Tu vuelo</h3><p>{flight.route} · {flight.flight_date}{flight.airline && ` · ${flight.airline}`}</p></div>}

      <div className="card">
        <h3>Mis documentos</h3>
        <ul className="docs">
          {app.documents.map(d => (
            <li key={d.id}>
              <span>{nombre(d.doc_type)}</span><b className={'tag ' + d.status}>{d.status}</b>
              {d.status === 'rechazado' && (
                <>
                  <small>{d.reject_reason}</small>
                  <label className="reup">Subir de nuevo
                    <input type="file" accept=".pdf,image/*" disabled={busy}
                      onChange={e => enviar('reemplazar_documento', { p_document_id: d.id }, e.target.files[0])} />
                  </label>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {extras.length > 0 && (
        <div className="card">
          <h3>Documentos adicionales solicitados</h3>
          <ul className="docs">
            {extras.map(x => (
              <li key={x.id}>
                <span>{nombre(x.doc_type)}</span><small className="neutral">{x.note}</small>
                <label className="reup">Subir
                  <input type="file" accept=".pdf,image/*" disabled={busy}
                    onChange={e => enviar('cumplir_extra', { p_extra_id: x.id }, e.target.files[0])} />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}