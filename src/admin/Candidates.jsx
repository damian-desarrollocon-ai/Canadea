import { useMemo, useState } from 'react'
import { supabase } from '../supabase'
import { stages } from '../brand'
import { fecha } from '../lib/docs'
import CandidateDetail from './CandidateDetail'

const labelEtapa = k => stages.find(s => s.key === k)?.label || k
const csv = v => `"${String(v ?? '').replace(/"/g, '""')}"`

export default function Candidates({ apps, companies, sel, setSel, reload }) {
  const [q, setQ] = useState('')
  const [etapa, setEtapa] = useState('')
  const [programa, setPrograma] = useState('')
  const [soloPend, setSoloPend] = useState(false)
  const [nuevo, setNuevo] = useState(false)
  const [msg, setMsg] = useState('')

  const rows = useMemo(() => apps.filter(a => {
    const c = a.candidates || {}
    const texto = `${c.full_name} ${c.email} ${a.folio} ${c.phone}`.toLowerCase()
    return (!q || texto.includes(q.toLowerCase())) && (!etapa || a.stage === etapa) && (!programa || a.program === programa)
      && (!soloPend || a.documents.some(d => d.status === 'pendiente'))
  }), [apps, q, etapa, programa, soloPend])

  const empresa = id => companies.find(c => c.id === id)?.name || ''

  function exportar() {
    const cab = ['Folio', 'Nombre', 'Correo', 'Teléfono', 'Nacimiento', 'Programa', 'Etapa', 'Empresa', 'Registro']
    const lineas = rows.map(a => {
      const c = a.candidates || {}
      return [a.folio, c.full_name, c.email, c.phone, c.birth_date, a.program, labelEtapa(a.stage), empresa(a.company_id), a.created_at?.slice(0, 10)].map(csv).join(',')
    })
    const blob = new Blob(['\ufeff' + [cab.map(csv).join(','), ...lineas].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `candidatos-${new Date().toISOString().slice(0, 10)}.csv`; link.click()
    URL.revokeObjectURL(url)
  }

  async function crear(e) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.target))
    const { data: cand, error } = await supabase.from('candidates')
      .insert({ full_name: f.nombre, email: f.email || null, phone: f.telefono || null, birth_date: f.nacimiento }).select('id').single()
    if (error) return setMsg('No se pudo crear: ' + error.message)
    const { data: app, error: e2 } = await supabase.from('applications').insert({ candidate_id: cand.id, program: f.programa }).select('id').single()
    if (e2) return setMsg('No se pudo crear la solicitud: ' + e2.message)
    setNuevo(false); setMsg(''); await reload(); setSel(app.id)
  }

  const actual = sel && apps.find(x => x.id === sel)
  if (actual) return <CandidateDetail key={actual.id} app={actual} companies={companies} reload={reload} onBack={() => setSel(null)} />

  return (
    <>
      <div className="toolbar">
        <input className="grow" placeholder="Buscar por nombre, correo, teléfono o folio" value={q} onChange={e => setQ(e.target.value)} />
        <select value={etapa} onChange={e => setEtapa(e.target.value)}>
          <option value="">Todas las etapas</option>
          {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={programa} onChange={e => setPrograma(e.target.value)}>
          <option value="">Todos los programas</option>
          <option value="temporal">Temporal</option>
          <option value="permanente">Con permanencia</option>
        </select>
        <label className="help" style={{ margin: 0 }}><input type="checkbox" style={{ width: 'auto', display: 'inline', marginRight: '.4rem' }} checked={soloPend} onChange={e => setSoloPend(e.target.checked)} />Con documentos por revisar</label>
        <button className="btn sec small" onClick={exportar}>Exportar CSV</button>
        <button className="btn small" onClick={() => setNuevo(n => !n)}>{nuevo ? 'Cancelar' : 'Nuevo candidato'}</button>
      </div>

      {nuevo && (
        <form className="card" onSubmit={crear}>
          <h3>Registrar un candidato</h3>
          <p className="help">Úsalo para candidatos que envían sus datos por otro medio. Si después crean su cuenta con el mismo correo, verán su proceso en su panel.</p>
          <div className="row2">
            <label>Nombre completo<input name="nombre" required /></label>
            <label>Fecha de nacimiento<input name="nacimiento" type="date" required /></label>
            <label>Correo<input name="email" type="email" /></label>
            <label>Teléfono<input name="telefono" /></label>
          </div>
          <label>Programa<select name="programa"><option value="temporal">Trabajo temporal</option><option value="permanente">Con permanencia</option></select></label>
          <button className="btn">Crear registro</button>
          {msg && <p className="err">{msg}</p>}
        </form>
      )}

      <div className="scroll">
        <table className="table">
          <thead><tr><th>Folio</th><th>Nombre</th><th className="hide-sm">Programa</th><th>Etapa</th><th className="hide-sm">Empresa</th><th>Documentos</th><th className="hide-sm">Registro</th></tr></thead>
          <tbody>
            {rows.map(a => {
              const pend = a.documents.filter(d => d.status === 'pendiente').length
              const apr = a.documents.filter(d => d.status === 'aprobado').length
              return (
                <tr key={a.id} className="click" onClick={() => setSel(a.id)}>
                  <td>{a.folio}</td>
                  <td><b>{a.candidates?.full_name}</b><br /><small className="muted">{a.candidates?.email}</small></td>
                  <td className="hide-sm">{a.program === 'permanente' ? 'Permanencia' : 'Temporal'}</td>
                  <td><span className="chip">{labelEtapa(a.stage)}</span></td>
                  <td className="hide-sm">{empresa(a.company_id) || '—'}</td>
                  <td>{apr}/{a.documents.length}{pend > 0 && <span className="badge">{pend}</span>}</td>
                  <td className="hide-sm">{fecha(a.created_at)}</td>
                </tr>
              )
            })}
            {rows.length === 0 && <tr><td colSpan="7" className="muted">No hay candidatos con esos filtros.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="help">{rows.length} de {apps.length} candidatos</p>
    </>
  )
}
