import { useState } from 'react'
import { useAuth } from '../auth'
import { useAdminData } from '../admin/data'
import Overview from '../admin/Overview'
import Candidates from '../admin/Candidates'
import Companies from '../admin/Companies'
import Team from '../admin/Team'
import '../dashboard.css'

export default function Admin() {
  const { role } = useAuth()
  const { apps, companies, loading, error, reload } = useAdminData()
  const [tab, setTab] = useState('resumen')
  const [sel, setSel] = useState(null)
  const abrir = id => { setSel(id); setTab('candidatos') }
  const tabs = [['resumen', 'Resumen'], ['candidatos', 'Candidatos'], ['empresas', 'Empresas'], ...(role === 'admin' ? [['equipo', 'Equipo']] : [])]

  return (
    <section className="wrap dash">
      <div className="dash-head">
        <div>
          <h1>Panel de administración</h1>
          <p className="dash-sub">Control de candidatos, documentos, empresas y equipo.</p>
        </div>
        <button className="btn sec small" onClick={reload}>Actualizar</button>
      </div>
      {error && <p className="alert bad" role="alert">No se pudieron cargar los datos: {error}. Verifica que las migraciones de Supabase estén al día.</p>}
      <div className="tabs" role="tablist">
        {tabs.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); if (k !== 'candidatos') setSel(null) }}>{l}</button>
        ))}
      </div>
      {loading ? <p>Cargando…</p> : (
        <>
          {tab === 'resumen' && <Overview apps={apps} onOpen={abrir} />}
          {tab === 'candidatos' && <Candidates apps={apps} companies={companies} sel={sel} setSel={setSel} reload={reload} />}
          {tab === 'empresas' && <Companies companies={companies} reload={reload} />}
          {tab === 'equipo' && role === 'admin' && <Team />}
        </>
      )}
    </section>
  )
}
