import { useEffect, useRef, useState } from 'react'

// Captura guiada de rostro: óvalo, instrucciones y cuenta regresiva.
// No detecta rostros ni valida que sea una persona real; el equipo revisa la foto en el panel.
export default function FaceCapture({ onCapture }) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState('intro') // intro | starting | live | count | review | error
  const [msg, setMsg] = useState('')
  const [count, setCount] = useState(3)
  const [shot, setShot] = useState(null)
  const [done, setDone] = useState(null)
  const video = useRef(null)
  const stream = useRef(null)
  const timers = useRef([])

  function stop() {
    timers.current.forEach(t => { clearTimeout(t); clearInterval(t) }); timers.current = []
    stream.current?.getTracks().forEach(t => t.stop()); stream.current = null
  }
  function close() { stop(); setOpen(false); setPhase('intro') }
  useEffect(() => stop, [])
  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
  useEffect(() => {
    const v = video.current
    if ((phase === 'live' || phase === 'count') && v && stream.current && v.srcObject !== stream.current) {
      v.srcObject = stream.current; v.play?.()
    }
  }, [phase])

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) return setPhase('error')
    setPhase('starting')
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      setMsg('Acerca tu rostro a la cámara'); setPhase('live')
      timers.current.push(setTimeout(() => setMsg('Centra tu rostro dentro del óvalo'), 2500))
    } catch { setPhase('error') }
  }
  function ready() {
    let n = 3; setCount(n); setMsg('Mantente quieto y mira al frente'); setPhase('count')
    const t = setInterval(() => { n -= 1; if (n === 0) { clearInterval(t); capture() } else setCount(n) }, 1000)
    timers.current.push(t)
  }
  function capture() {
    const v = video.current
    const sw = Math.min(v.videoWidth, v.videoHeight * 0.75), sh = sw / 0.75
    const c = document.createElement('canvas'); c.width = 900; c.height = 1200
    c.getContext('2d').drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, 900, 1200)
    c.toBlob(blob => { stop(); setShot({ blob, url: URL.createObjectURL(blob) }); setPhase('review') }, 'image/jpeg', 0.9)
  }
  function accept() {
    onCapture(new File([shot.blob], 'rostro.jpg', { type: 'image/jpeg' }))
    setDone(shot.url); close()
  }
  function fromFile(e) {
    const f = e.target.files[0]; if (!f) return
    onCapture(f); setDone(URL.createObjectURL(f)); close()
  }

  return (
    <div className="fc-field">
      <span className="fc-label">Foto de tu rostro</span>
      <button type="button" className="fc-trigger" onClick={() => setOpen(true)}>
        {done ? <img src={done} alt="Tu foto" className="fc-thumb" /> : <span className="fc-icon" aria-hidden="true" />}
        <span>{done ? 'Foto lista. Toca para repetirla' : 'Tomar foto con la cámara'}</span>
      </button>

      {open && (
        <div className="fc-modal" role="dialog" aria-modal="true" aria-label="Verificación de rostro">
          {phase === 'intro' && (
            <div className="fc-card">
              <h2>Verifica tu identidad</h2>
              <p>Vamos a tomar una foto de tu rostro para tu expediente.</p>
              <ul>
                <li>Busca un lugar con buena luz, de frente a la fuente de luz.</li>
                <li>Quita lentes, gorra o cubrebocas.</li>
                <li>Sostén el teléfono a la altura de tus ojos.</li>
              </ul>
              <p className="fc-small">Tu foto se guarda de forma privada y solo la ve el equipo autorizado.</p>
              <button type="button" className="btn gold" onClick={start}>Activar cámara</button>
              <button type="button" className="fc-link" onClick={close}>Cancelar</button>
            </div>
          )}
          {phase === 'starting' && <p className="fc-msg">Solicitando acceso a la cámara…</p>}
          {(phase === 'live' || phase === 'count') && (
            <>
              <div className="fc-stage">
                <video ref={video} playsInline muted />
                <div className={'fc-oval' + (phase === 'count' ? ' go' : '')} />
                {phase === 'count' && <div className="fc-count" aria-hidden="true">{count}</div>}
              </div>
              <p className="fc-msg" aria-live="polite">{msg}</p>
              {phase === 'live' && <button type="button" className="btn gold" onClick={ready}>Estoy listo</button>}
              <button type="button" className="fc-link" onClick={close}>Cancelar</button>
            </>
          )}
          {phase === 'review' && (
            <>
              <div className="fc-stage"><img src={shot.url} alt="Foto capturada" /></div>
              <p className="fc-msg">¿Se ve claro y centrado tu rostro?</p>
              <button type="button" className="btn gold" onClick={accept}>Usar esta foto</button>
              <button type="button" className="fc-link" onClick={() => { setShot(null); start() }}>Repetir</button>
            </>
          )}
          {phase === 'error' && (
            <div className="fc-card">
              <h2>No pudimos usar la cámara</h2>
              <p>Revisa que hayas dado permiso a la cámara en tu navegador, o sube una foto de tu rostro desde tu dispositivo.</p>
              <label className="fc-upload">Subir foto<input type="file" accept="image/*" capture="user" onChange={fromFile} /></label>
              <button type="button" className="fc-link" onClick={close}>Cancelar</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}