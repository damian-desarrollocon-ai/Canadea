import { brand, agency } from '../brand'
import { LEGAL, OFICIAL } from '../legalContent'

const VALORES = {
  marca: brand.name, razonSocial: agency.razonSocial, correo: agency.correoOficial, direccion: agency.direccion,
  permiso: agency.permiso, dominio: agency.dominioOficial, jurisdiccion: agency.jurisdiccion, fecha: agency.fechaLegal,
}

// Reemplaza {{campo}} por el dato de la agencia; si falta, lo resalta como pendiente
function fill(text) {
  return text.split(/(\{\{\w+\}\})/).map((part, i) => {
    const m = part.match(/^\{\{(\w+)\}\}$/)
    if (!m) return part
    return VALORES[m[1]] || <mark key={i} className="pend">[por confirmar]</mark>
  })
}

export default function Legal({ kind }) {
  const doc = LEGAL[kind]
  return (
    <section className="wrap legal">
      <h1>{doc.titulo}</h1>
      <p className="legal-meta">Última actualización: {fill('{{fecha}}')}</p>
      {agency.legalBorrador && (
        <p className="legal-draft"><b>Borrador informativo.</b> El texto definitivo lo proporcionará la agencia y será revisado por su asesoría legal. Los datos marcados como «por confirmar» se completarán con su información.</p>
      )}
      {kind === 'terminos' && (
        <aside className="legal-official" id="informacion-oficial">
          <h2>{OFICIAL.titulo}</h2>
          {OFICIAL.parrafos.map((t, i) => <p key={i}>{t}</p>)}
          <p className="legal-official-note">
            {fill(OFICIAL.aviso)} Fuentes:{' '}
            {OFICIAL.fuentes.map((f, i) => (
              <span key={f.u}>{i > 0 && ' · '}<a href={f.u} target="_blank" rel="noopener noreferrer">{f.t}</a></span>
            ))}.
          </p>
        </aside>
      )}
      <nav className="legal-toc" aria-label="Contenido">
        <h2>Contenido</h2>
        <ol>{doc.secciones.map((s, i) => <li key={i}><a href={`#s${i + 1}`}>{fill(s.t)}</a></li>)}</ol>
      </nav>
      <div className="legal-body">
        {doc.secciones.map((s, i) => (
          <section key={i} id={`s${i + 1}`}>
            <h2>{i + 1}. {fill(s.t)}</h2>
            {s.p.map((t, j) => <p key={j}>{fill(t)}</p>)}
            {s.l && <ul>{s.l.map((t, j) => <li key={j}>{fill(t)}</li>)}</ul>}
            {agency.legalBorrador && s.nota && <p className="legal-note"><b>Nota para revisión legal:</b> {s.nota}</p>}
          </section>
        ))}
      </div>
    </section>
  )
}