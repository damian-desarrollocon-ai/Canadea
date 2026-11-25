import { useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { brand, agency, logosOficiales } from './brand'
import Home from './pages/Home'
import Track from './pages/Track'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'
import Legal from './pages/Legal'
import MiCuenta from './pages/MiCuenta'
import { useAuth, RequireAuth, isStaff } from './auth'
import Logo from './Logo'
import './site.css'

const pending = v => v || 'por confirmar'

function HeaderActions() {
  const { session, role, signOut } = useAuth()
  if (!session) return (
    <div className="site-actions">
      <NavLink to="/login" className="site-link">Ingresar</NavLink>
      <NavLink to="/registro" className="btn small">Registrarme</NavLink>
    </div>
  )
  return (
    <div className="site-actions">
      {isStaff(role) && <NavLink to="/admin" className="site-link">Panel</NavLink>}
      <NavLink to="/cuenta" className="site-link">Mi cuenta</NavLink>
      <button className="btn small" onClick={signOut}>Salir</button>
    </div>
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="site-top">
        <div className="site-inner">
          <span>Correo oficial: {agency.correoOficial ? <a href={`mailto:${agency.correoOficial}`}>{agency.correoOficial}</a> : 'por confirmar'}</span>
          <span className="site-social">
            {Object.entries(agency.redes).map(([k, v]) => <a key={k} href={v || '#'}>{k}</a>)}
          </span>
        </div>
      </div>
      <header className="site-head">
        <div className="site-inner">
          <NavLink to="/" className="site-logo" aria-label={brand.name}><Logo /></NavLink>
          <button className="site-burger" aria-label="Menú" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen(o => !o)}><span /><span /><span /></button>
          <div id="site-menu" className={'site-menu' + (open ? ' open' : '')} onClick={() => setOpen(false)}>
          <nav className="site-nav" aria-label="Principal">
            <a href="/#empleadores">Empleadores</a>
            <a href="/#candidatos">Candidatos</a>
            <a href="/#proceso">Proceso</a>
            <a href="/#faq">Preguntas</a>
            <NavLink to="/consulta">Consultar folio</NavLink>
          </nav>
          <HeaderActions />
          </div>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/consulta" element={<Track />} />
          <Route path="/admin" element={<RequireAuth staff><Admin /></RequireAuth>} />
          <Route path="/cuenta" element={<RequireAuth><MiCuenta /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/terminos" element={<Legal kind="terminos" />} />
          <Route path="/privacidad" element={<Legal kind="privacidad" />} />
          <Route path="/cookies" element={<Legal kind="cookies" />} />
        </Routes>
      </main>
      <footer className="site-foot">
        <div className="site-inner foot-grid">
          <div>
            <b className="site-logo light"><Logo light /></b>
            <p>{pending(agency.razonSocial)}</p>
            <p>Permiso de agencia de reclutamiento: {pending(agency.permiso)}</p>
          </div>
          <div>
            <h4>Candidatos</h4>
            <NavLink to="/registro">Crear cuenta</NavLink>
            <NavLink to="/consulta">Consultar folio</NavLink>
            <a href="/#faq">Preguntas frecuentes</a>
          </div>
          <div>
            <h4>Contacto</h4>
            <p>{pending(agency.direccion)}</p>
            <p>{agency.correoOficial ? <a href={`mailto:${agency.correoOficial}`}>{agency.correoOficial}</a> : 'por confirmar'}</p>
            <p>{agency.telefono}</p>
          </div>
          <div>
            <h4>Legal</h4>
            <NavLink to="/terminos">Términos y condiciones</NavLink>
            <NavLink to="/privacidad">Aviso de privacidad</NavLink>
            <NavLink to="/cookies">Cookies</NavLink>
          </div>
        </div>
        <div className="site-inner foot-note">
          <p><b>Evita fraudes.</b> Solo te contactamos desde correos con el dominio {pending(agency.dominioOficial)}. Nunca te pediremos pagos por canales distintos a los que la agencia te indique por escrito, y no prometemos empleo garantizado.</p>
        </div>
      {logosOficiales.length > 0 && (
        <div className="site-inner foot-logos">
          <div className="foot-logos-box">
            {logosOficiales.map(l => {
              const img = <img src={l.src} alt={l.alt} onError={e => { e.currentTarget.style.display = 'none' }} />
              return l.href
                ? <a key={l.src} href={l.href} target="_blank" rel="noopener noreferrer">{img}</a>
                : <span key={l.src}>{img}</span>
            })}
          </div>
        </div>
      )}
      <div className="site-inner foot-official">
        <details>
          <summary>Información sobre el empleo agrícola en Canadá</summary>
          <p>La Secretaría del Trabajo y Previsión Social, a través del Servicio Nacional de Empleo, es la responsable de reclutar, seleccionar y promover el envío de trabajadores agrícolas a las diferentes provincias de Canadá, tomando en cuenta los requerimientos de los empleadores canadienses.</p>
          <p>Desde su arribo a territorio canadiense, hasta su regreso a México, y en cooperación con Recursos Humanos y Desarrollo Social de Canadá, los derechos de los trabajadores son vigilados por los Consulados de México.</p>
          <p>Los trabajadores agrícolas tienen derecho a una vivienda digna, a un salario previamente establecido y a contar con garantías laborales.</p>
          <p className="foot-disclaimer">{brand.name} es una agencia privada de reclutamiento. No es una dependencia ni representante del Gobierno de México ni del Gobierno de Canadá; esta información se muestra solo como referencia. Fuentes:{' '}
            <a href="https://www.gob.mx/stps" target="_blank" rel="noopener noreferrer">Secretaría del Trabajo y Previsión Social</a> ·{' '}
            <a href="https://consulmex.sre.gob.mx/montreal/index.php/es/enterate/74-empleo-en-canada" target="_blank" rel="noopener noreferrer">Consulado de México en Montreal (SRE)</a>.</p>
        </details>
      </div>
      </footer>
    </>
  )
}