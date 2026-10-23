// Logo: isotipo en SVG + nombre en la tipografía del sitio (Newsreader)
export default function Logo({ light = false }) {
  const main = light ? '#fff' : '#17372F'
  const detail = light ? '#17372F' : '#D8B15F'
  return (
    <span className="logo-lock">
      <svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
        <path d="M51.9 15.3A26 26 0 1 0 51.9 48.7" fill="none" stroke={main} strokeWidth="6" strokeLinecap="round" />
        <circle cx="41" cy="20" r="5.2" fill="#D8B15F" />
        <polygon points="20.1,48.5 20.3,47.1 20.6,45.8 20.9,44.5 21.2,43.2 21.6,41.9 22.0,40.7 22.5,39.4 23.0,38.2 23.5,37.1 24.1,35.9 24.7,34.8 25.4,33.8 26.0,32.7 26.7,31.7 27.5,30.7 28.2,29.7 29.0,28.7 29.8,27.8 30.7,26.9 31.5,26.0 35.5,28.0 35.4,29.1 35.3,30.2 35.3,31.3 35.3,32.3 35.3,33.3 35.4,34.3 35.6,35.3 35.7,36.2 35.9,37.2 36.1,38.1 36.4,38.9 36.7,39.8 37.0,40.6 37.3,41.3 37.7,42.1 38.1,42.8 38.5,43.5 39.0,44.2 39.4,44.9 39.9,45.5" fill={main} />
        {["29.7,44.0 29.7,43.0 29.7,42.0 29.7,41.0", "30.0,38.0 30.1,37.0 30.3,36.0 30.5,35.0"].map(p => <polyline key={p} points={p} fill="none" stroke={detail} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />)}
      </svg>
      <span className="logo-word">Canadea</span>
    </span>
  )
}