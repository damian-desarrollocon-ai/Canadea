import { stages } from '../brand'
import { fecha } from '../lib/docs'

export default function Overview({ apps, onOpen }) {
  const semana = Date.now() - 7 * 864e5
  const nuevos = apps.filter(a => new Date(a.created_at).getTime() > semana).length
  const docs = apps.flatMap(a => a.documents)
  const porRevisar = docs.filter(d => d.status === 'pendiente').length
  const rechazados = docs.filter(d => d.status === 'rechazado').length
  const porEtapa = stages.map(s => ({ ...s, n: apps.filter(a => a.stage === s.key).length }))
  const max = Math.max(1, ...porEtapa.map(s => s.n))
  const atencion = apps.filter(a => a.documents.some(d => d.status === 'pendiente')).slice(0, 8)

  return (
    <>
      <div className="stats">
        <div className="stat"><b>{apps.length}</b><span>Candidatos registrados</span></div>
        <div className="stat"><b>{nuevos}</b><span>Nuevos en 7 días</span></div>
        <div className="stat"><b>{porRevisar}</b><span>Documentos por revisar</span></div>
        <div className="stat"><b>{rechazados}</b><span>Documentos por corregir</span></div>
      </div>
      <div className="grid2">
        <div className="card bars">
          <h3>Candidatos por etapa</h3>
          {porEtapa.map(s => (
            <div className="bar" key={s.key}><span>{s.label}</span><i style={{ width: (s.n / max) * 100 + '%' }} /><b>{s.n}</b></div>
          ))}
        </div>
        <div className="card">
          <h3>Requieren tu atención</h3>
          {atencion.length === 0 && <p className="help">No hay documentos pendientes de revisión.</p>}
          {atencion.map(a => (
            <div className="note" key={a.id}>
              <button className="linkbtn" onClick={() => onOpen(a.id)}>{a.candidates?.full_name}</button>
              <small>{a.folio} · {a.documents.filter(d => d.status === 'pendiente').length} por revisar · {fecha(a.created_at)}</small>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
