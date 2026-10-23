import { useState } from 'react'
import { stages } from '../brand'
import { supabase, demoMode } from '../supabase'
import { demoApplications } from '../data/demo'

async function buscar(folio, nacimiento) {
  const f = folio.trim().toUpperCase()
  if (!supabase) {
    return demoApplications.find(a => a.folio === f && a.nacimiento === nacimiento) || null
  }
  const { data, error } = await supabase.rpc('consultar_folio', { p_folio: f, p_nacimiento: nacimiento })
  if (error) throw error
  return data
}

export default function Track() {
  const [folio, setFolio] = useState('')
  const [nacimiento, setNacimiento] = useState('')
  const [res, setRes] = useState(undefined)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try { setRes(await buscar(folio, nacimiento)) }
    catch { setError('No pudimos consultar tu folio. Intenta de nuevo en unos minutos.') }
  }

  const idx = res ? stages.findIndex(s => s.key === res.stage) : -1

  return (
    <section className="wrap narrow">
      <h1>Consulta tu folio</h1>
      <form onSubmit={onSubmit} className="card">
        <label>Folio<input value={folio} onChange={e => setFolio(e.target.value)} placeholder="CDA-2026-000123" required /></label>
        <label>Fecha de nacimiento<input type="date" value={nacimiento} onChange={e => setNacimiento(e.target.value)} required /></label>
        <button className="btn">Ver mi avance</button>
        {demoMode && <p className="hint">Demo: CDA-2026-000123 con 1994-03-15, o CDA-2026-000087 con 1989-11-02.</p>}
      </form>
      {error && <p className="err">{error}</p>}
      {res === null && <p className="err">No encontramos ese folio. Revisa que el folio y la fecha estén correctos.</p>}
      {res && (
        <div className="card">
          <h2>{res.nombre}</h2>
          <p className="muted">{res.vacante}</p>
          <ol className="timeline">
            {stages.map((s, i) => (
              <li key={s.key} className={i < idx ? 'done' : i === idx ? 'now' : ''}>{s.label}</li>
            ))}
          </ol>
          <h3>Documentos</h3>
          <ul className="docs">
            {res.documents.map(d => (
              <li key={d.tipo}>
                <span>{d.tipo}</span><b className={'tag ' + d.estado}>{d.estado}</b>
                {d.motivo && <small>{d.motivo}</small>}
              </li>
            ))}
          </ul>
          {res.empresa && <p className="muted">Empresa que te seleccionó: <b>{res.empresa}</b></p>}
          {res.training && (
            <div className="notice">
              <h3>Capacitación pagada</h3>
              <p><b>{res.training.fecha}</b> · {res.training.lugar}</p>
              <p>{res.training.detalle}</p>
            </div>
          )}
          {res.extras?.length > 0 && (
            <>
              <h3>Documentos adicionales solicitados</h3>
              <ul className="docs">{res.extras.map(x => <li key={x.tipo}><span>{x.tipo}</span><small className="neutral">{x.nota}</small></li>)}</ul>
            </>
          )}
          {res.flight && (
            <>
              <h3>Tu vuelo</h3>
              <p>{res.flight.ruta} · {res.flight.fecha}</p>
            </>
          )}
        </div>
      )}
    </section>
  )
}