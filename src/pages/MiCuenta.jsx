import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'
import { agency, stages } from '../brand'
import { subirArchivo, validarArchivo } from '../files'
import { nombreDoc, ESTADOS, fecha, abrirDocumento } from '../lib/docs'
import '../dashboard.css'

const SELECT = `id, folio, stage, program, created_at,
  candidates(id, full_name, email, phone, birth_date),
  companies(name),
  documents(id, doc_type, status, reject_reason, file_path, updated_at),
  flights(route, flight_date, airline),
  trainings(start_date, location, details),
  extra_document_requests(id, doc_type, note, fulfilled),
  application_status_history(stage, changed_at)`

const PASOS = {
  registro: 'Estamos recibiendo tu registro. Revisa que todos tus documentos estén completos.',
  documentos: 'Estamos validando tu documentación. Si algo necesita corrección, te lo indicaremos aquí.',
  seleccion: 'Estamos buscando vacantes que se ajusten a tu perfil, experiencia y trayectoria.',
  propuesta: 'Revisa tu correo: la empresa interesada te enviará su propuesta laboral y sus condiciones.',
  viaje: 'Estamos coordinando tu viaje. Aquí verás los datos de tu vuelo cuando estén asignados.',
}
const TIPOS_BASE = ['pasaporte', 'cv', 'ine', 'rostro', 'permiso']
const label = k => stages.find(s => s.key === k)?.label || k

export default function MiCuenta() {
  const [app, setApp] = useState(undefined)
  const [tab, setTab] = useState('resumen')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [nuevoTipo, setNuevoTipo] = useState('')

  const flash = (text, ok = true) => setMsg({ text, ok })

  async function load() {
    const { data, error } = await supabase.from('applications').select(SELECT)
      .order('created_at', { ascending: false }).limit(1)
      .order('changed_at', { referencedTable: 'application_status_history', ascending: false })
      .maybeSingle()
    if (error) { console.error(error); flash('No pudimos cargar tu información.', false) }
    setApp(data ?? null)
  }
  useEffect(() => { load() }, [])

  async function accion(fn, ok) {
    setBusy(true); setMsg(null)
    try { await fn(); flash(ok); await load() }
    catch (e) { console.error(e); flash(e.validacion ? e.message : 'No pudimos completar la acción. Intenta de nuevo.', false) }
    finally { setBusy(false) }
  }
  const validar = file => { const p = validarArchivo(file); if (p) { const e = new Error(p); e.validacion = true; throw e } return file }

  const reemplazar = (doc, file) => accion(async () => {
    const path = await subirArchivo(validar(file), doc.doc_type)
    const { error } = await supabase.rpc('reemplazar_documento', { p_document_id: doc.id, p_path: path }); if (error) throw error
  }, 'Documento enviado. Lo revisaremos pronto.')
  const cumplir = (x, file) => accion(async () => {
    const path = await subirArchivo(validar(file), x.doc_type)
    const { error } = await supabase.rpc('cumplir_extra', { p_extra_id: x.id, p_path: path }); if (error) throw error
  }, 'Documento entregado.')
  const agregar = (tipo, file) => accion(async () => {
    const path = await subirArchivo(validar(file), tipo)
    const { error } = await supabase.from('documents').insert({ application_id: app.id, doc_type: tipo, file_path: path }); if (error) throw error
    setNuevoTipo('')
  }, 'Documento agregado.')
  const ver = d => abrirDocumento(d.file_path).catch(() => flash('No se pudo abrir el documento.', false))

  const guardarDatos = e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target))
    accion(async () => { const { error } = await supabase.rpc('actualizar_mis_datos', { p_full_name: f.nombre, p_phone: f.telefono }); if (error) throw error }, 'Datos actualizados.')
  }
  const cambiarPass = e => {
    e.preventDefault(); const form = e.target; const f = Object.fromEntries(new FormData(form))
    if (f.pass !== f.pass2) return flash('Las contraseñas no coinciden.', false)
    accion(async () => { const { error } = await supabase.auth.updateUser({ password: f.pass }); if (error) throw error; form.reset() }, 'Contraseña actualizada.')
  }
  const copiar = async () => {
    try { await navigator.clipboard.writeText(app.folio); flash('Folio copiado.') } catch { flash('No se pudo copiar. Selecciónalo manualmente.', false) }
  }

  if (app === undefined) return <section className="wrap"><p>Cargando…</p></section>
  if (app === null) return (
    <section className="wrap narrow">
      <h1>Mi cuenta</h1>
      <p>Aún no encontramos un registro asociado a tu cuenta.</p>
      <Link className="btn" to="/registro">Completar registro</Link>
    </section>
  )

  const c = app.candidates || {}
  const idx = Math.max(0, stages.findIndex(s => s.key === app.stage))
  const pct = Math.round(((idx + 1) / stages.length) * 100)
  const aCorregir = app.documents.filter(d => d.status === 'rechazado')
  const extras = (app.extra_document_requests || []).filter(x => !x.fulfilled)
  const faltantes = TIPOS_BASE.filter(t => !app.documents.some(d => d.doc_type === t))
  const pendientes = aCorregir.length + extras.length
  const training = app.trainings?.[0]
  const flight = app.flights?.[0]
  const puedeReemplazar = d => d.status === 'rechazado' || d.status === 'pendiente'

  return (
    <section className="wrap dash">
      <div className="dash-head">
        <div>
          <h1>Hola, {c.full_name?.split(' ')[0]}</h1>
          <p className="dash-sub">Bienvenido a tu panel de Canadea. Aquí das seguimiento a tu proceso.</p>
        </div>
        <div className="card" style={{ margin: 0, padding: '.7rem 1rem' }}>
          <span className="muted">Tu folio</span><br />
          <b>{app.folio}</b>{' '}
          <button type="button" className="linkbtn" onClick={copiar}>Copiar</button>
        </div>
      </div>

      {msg && <p className={'alert ' + (msg.ok ? 'ok' : 'bad')} role="status">{msg.text}</p>}

      <div className="tabs" role="tablist">
        {[['resumen', 'Resumen'], ['documentos', 'Mis documentos'], ['datos', 'Mis datos']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>
            {l}{k === 'documentos' && pendientes > 0 && <span className="badge">{pendientes}</span>}
          </button>
        ))}
      </div>

      {tab === 'resumen' && (
        <div className="grid2">
          <div>
            {pendientes > 0 && (
              <div className="alert bad">
                <span>Tienes {pendientes} {pendientes === 1 ? 'documento' : 'documentos'} por atender.</span>
                <button className="btn small" onClick={() => setTab('documentos')}>Ver documentos</button>
              </div>
            )}
            <div className="card">
              <h3>Tu avance: {label(app.stage)}</h3>
              <div className="progress" aria-label={`Avance ${pct}%`}><i style={{ width: pct + '%' }} /></div>
              <p className="help">{PASOS[app.stage]}</p>
              <ol className="timeline">
                {stages.map((s, i) => <li key={s.key} className={i < idx ? 'done' : i === idx ? 'now' : ''}>{s.label}</li>)}
              </ol>
            </div>
            {training && (
              <div className="notice">
                <h3>Capacitación pagada</h3>
                <p><b>{fecha(training.start_date)}</b> · {training.location}</p>
                <p>{training.details}</p>
              </div>
            )}
            {flight && <div className="card"><h3>Tu vuelo</h3><p>{flight.route} · {fecha(flight.flight_date)}{flight.airline && ` · ${flight.airline}`}</p></div>}
          </div>
          <div>
            <div className="card">
              <h3>Tu proceso</h3>
              <p className="help">Programa: <b>{app.program === 'permanente' ? 'Con permanencia' : 'Trabajo temporal'}</b></p>
              <p className="help">Empresa: <b>{app.companies?.name || 'Aún sin asignar'}</b></p>
              <p className="help">Registro: <b>{fecha(app.created_at)}</b></p>
            </div>
            <div className="card">
              <h3>Actividad reciente</h3>
              {app.application_status_history?.length ? (
                <ul className="hist">
                  {app.application_status_history.slice(0, 6).map((h, i) => <li key={i}>{label(h.stage)}<span>{fecha(h.changed_at)}</span></li>)}
                </ul>
              ) : <p className="help">Aún no hay movimientos.</p>}
            </div>
            <div className="card">
              <h3>¿Necesitas ayuda?</h3>
              <p className="help">Escríbenos a <a href={`mailto:${agency.correoOficial}`}>{agency.correoOficial}</a> e incluye tu folio.</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'documentos' && (
        <>
          <div className="card">
            <h3>Mis documentos</h3>
            {app.documents.map(d => (
              <div className="doc" key={d.id}>
                <div>
                  <b>{nombreDoc(d.doc_type)}</b> <span className={'tag ' + d.status}>{ESTADOS[d.status]}</span>
                  <div className="meta">Actualizado: {fecha(d.updated_at)}</div>
                </div>
                <div className="acts">
                  <button type="button" className="mini" onClick={() => ver(d)}>Ver</button>
                  {puedeReemplazar(d) && (
                    <label className="filebtn">{d.status === 'rechazado' ? 'Subir de nuevo' : 'Reemplazar'}
                      <input type="file" accept=".pdf,image/*" disabled={busy} onChange={e => reemplazar(d, e.target.files[0])} />
                    </label>
                  )}
                </div>
                {d.status === 'rechazado' && d.reject_reason && <small>Motivo: {d.reject_reason}</small>}
              </div>
            ))}
            {app.documents.length === 0 && <p className="help">Aún no has subido documentos.</p>}
          </div>

          {extras.length > 0 && (
            <div className="card">
              <h3>Documentos adicionales solicitados</h3>
              {extras.map(x => (
                <div className="doc" key={x.id}>
                  <div><b>{nombreDoc(x.doc_type)}</b><div className="meta">{x.note}</div></div>
                  <label className="filebtn">Subir
                    <input type="file" accept=".pdf,image/*" disabled={busy} onChange={e => cumplir(x, e.target.files[0])} />
                  </label>
                </div>
              ))}
            </div>
          )}

          {faltantes.length > 0 && (
            <div className="card">
              <h3>Agregar un documento</h3>
              <p className="help">Puedes agregar los documentos que aún no tienes cargados (PDF, JPG, PNG o WEBP, máximo 10 MB).</p>
              <div className="toolbar">
                <select value={nuevoTipo} onChange={e => setNuevoTipo(e.target.value)}>
                  <option value="">Elige el documento</option>
                  {faltantes.map(t => <option key={t} value={t}>{nombreDoc(t)}</option>)}
                </select>
                <label className="filebtn" style={{ opacity: nuevoTipo ? 1 : 0.5 }}>Elegir archivo
                  <input type="file" accept=".pdf,image/*" disabled={busy || !nuevoTipo} onChange={e => agregar(nuevoTipo, e.target.files[0])} />
                </label>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'datos' && (
        <div className="grid2">
          <form className="card" onSubmit={guardarDatos}>
            <h3>Mis datos</h3>
            <label>Nombre completo<input name="nombre" defaultValue={c.full_name} required /></label>
            <label>Teléfono<input name="telefono" defaultValue={c.phone || ''} /></label>
            <label>Correo<input value={c.email || ''} disabled readOnly /></label>
            <label>Fecha de nacimiento<input value={c.birth_date || ''} disabled readOnly /></label>
            <p className="help">Para cambiar tu correo o tu fecha de nacimiento, escríbenos a {agency.correoOficial}.</p>
            <button className="btn" disabled={busy}>Guardar cambios</button>
          </form>
          <form className="card" onSubmit={cambiarPass}>
            <h3>Cambiar contraseña</h3>
            <label>Nueva contraseña<input name="pass" type="password" minLength={8} required /></label>
            <label>Repite la contraseña<input name="pass2" type="password" minLength={8} required /></label>
            <button className="btn" disabled={busy}>Actualizar contraseña</button>
          </form>
        </div>
      )}
    </section>
  )
}
