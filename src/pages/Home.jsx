import { Link } from 'react-router-dom'
import { agency, stages } from '../brand'

// Fotos: guarda tus imágenes en public/images/ con estos nombres. Si no existen, se ve un arte de respaldo.
const img = name => ({ '--img': `url(/images/${name})` })

const faqs = [
  ['¿Tiene costo registrarme?', 'La información de costos te la da la agencia directamente y por escrito. No pagues a nadie por canales que no te indique la agencia.'],
  ['¿Cómo sé en qué paso va mi proceso?', 'Con tu folio y tu fecha de nacimiento consultas tu avance cuando quieras, y te avisamos por correo en cada cambio.'],
  ['¿Qué documentos necesito?', 'Pasaporte, CV e INE. Si ya cuentas con un permiso, súbelo también. En algunos casos te pediremos documentos adicionales.'],
  ['¿Qué pasa si rechazan un documento?', 'Verás el motivo escrito por nuestro equipo y podrás subirlo de nuevo.'],
  ['¿Quién paga la capacitación?', 'Cuando aplica, la empresa que te selecciona la paga. Te mostramos fecha, lugar y detalles en tu seguimiento.'],
]

const steps = [
  ['Regístrate', 'Sube tu pasaporte, CV e INE, y tu permiso si ya lo tienes.'],
  ['Revisamos tus documentos', 'Si algo falta o no se ve bien, te decimos exactamente qué corregir.'],
  ['Una empresa te selecciona', 'Te avisamos por correo con la capacitación pagada y sus fechas.'],
  ['Coordinamos tu vuelo', 'Te acompañamos hasta tu llegada a Canadá.'],
]

export default function Home() {
  return (
    <>
      <section className="h-hero">
        <div className="site-inner h-hero-grid">
          <div>
            <h1>Tu próximo empleo en el campo canadiense</h1>
            <p className="h-lead">Conectamos a trabajadores agrícolas con empresas de Canadá, en programas temporales y con permanencia. Cada paso queda registrado y puedes consultarlo.</p>
            <div className="h-cta">
              <Link className="btn" to="/registro">Crear mi cuenta</Link>
              <Link className="btn line" to="/consulta">Consultar mi folio</Link>
            </div>
          </div>
          <div className="h-visual">
            <div className="ph" style={img('hero.jpg')} role="img" aria-label="Trabajadores en un campo agrícola" />
            <div className="h-track" aria-label="Ejemplo de seguimiento de folio">
              <div className="h-track-head"><span>Folio</span><b>CDA-2026-000087</b></div>
              <ol>{stages.map((s, i) => <li key={s.key} className={i < 4 ? 'done' : i === 4 ? 'now' : ''}>{s.label}</li>)}</ol>
              <p className="h-track-foot">Ejemplo ilustrativo</p>
            </div>
          </div>
        </div>
      </section>

      <section className="h-strip">
        <div className="site-inner h-strip-grid">
          <p><b>Seguimiento por folio</b>Consulta tu avance cuando quieras</p>
          <p><b>Documentos protegidos</b>Acceso restringido al equipo autorizado</p>
          <p><b>Avisos por correo</b>En cada cambio de etapa</p>
        </div>
      </section>

      <section className="h-section">
        <div className="site-inner h-intro">
          <h2>El campo canadiense necesita trabajadores cada temporada</h2>
          <div>
            <p>Las empresas agrícolas buscan personal confiable y con documentos en regla.</p>
            <p>Nuestro trabajo es reunir ambos lados con un proceso ordenado, claro y sin sorpresas.</p>
          </div>
        </div>
      </section>

      <section className="h-section h-alt">
        <div className="site-inner">
          <article id="empleadores" className="h-row">
            <div className="ph" style={img('empleadores.jpg')} role="img" aria-label="Empresa agrícola en Canadá" />
            <div>
              <h3>Empleadores</h3>
              <p>Presentamos perfiles agrícolas preparados y con documentación revisada, y coordinamos por correo toda la comunicación del proceso de selección.</p>
              <a className="h-more" href="/#contacto">Hablar con la agencia</a>
            </div>
          </article>
          <article id="candidatos" className="h-row flip">
            <div className="ph" style={img('candidatos.jpg')} role="img" aria-label="Trabajador agrícola" />
            <div>
              <h3>Candidatos</h3>
              <p>Regístrate una vez, sube tus documentos y sigue tu proceso hasta el vuelo. Programas temporales y con permanencia.</p>
              <Link className="h-more" to="/registro">Crear mi cuenta</Link>
            </div>
          </article>
        </div>
      </section>

      <section className="h-band" style={img('campo.jpg')}>
        <div className="site-inner">
          <h2>Un proceso claro, de tu registro a tu llegada a Canadá</h2>
          <Link className="btn gold" to="/registro">Empezar mi registro</Link>
        </div>
      </section>

      <section className="h-section">
        <div className="site-inner">
          <h2>Por qué elegirnos</h2>
          <div className="h-three">
            <div><h3>Transparencia</h3><p>Tu folio muestra en qué etapa estás, qué documentos están aprobados y por qué se rechazó alguno.</p></div>
            <div><h3>Respaldo</h3><p>Agencia de reclutamiento con permiso: <b>{agency.permiso || 'por confirmar'}</b>.</p></div>
            <div><h3>Acompañamiento</h3><p>Capacitación, selección y vuelo se coordinan y se te informan por escrito.</p></div>
          </div>
        </div>
      </section>

      <section id="proceso" className="h-section h-alt">
        <div className="site-inner">
          <h2>Así es el proceso</h2>
          <ol className="h-steps">
            {steps.map(([t, d], i) => <li key={t}><span>{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}
          </ol>
        </div>
      </section>

      <section className="h-section">
        <div className="site-inner">
          <h2>Programas</h2>
          <div className="h-prog-list">
            <div className="h-prog"><h3>Trabajo temporal</h3><p>Contratos por temporada en cultivos y empaque.</p></div>
            <div className="h-prog"><h3>Con permanencia</h3><p>Puestos con posibilidad de continuidad para perfiles agrícolas.</p></div>
          </div>
        </div>
      </section>

      <section id="faq" className="h-section h-alt">
        <div className="site-inner h-faq">
          <h2>Preguntas frecuentes</h2>
          {faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </section>

      <section id="contacto" className="h-cta-band">
        <div className="site-inner">
          <div>
            <h2>Empieza tu registro hoy</h2>
            <p>Tarda unos minutos. Solo necesitas tus documentos a la mano.</p>
            {agency.correoOficial && <p>¿Dudas? Escríbenos a <a className="h-mail" href={`mailto:${agency.correoOficial}`}>{agency.correoOficial}</a></p>}
          </div>
          <Link className="btn gold" to="/registro">Crear mi cuenta</Link>
        </div>
      </section>
    </>
  )
}