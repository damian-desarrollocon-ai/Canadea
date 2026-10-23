import { brand } from '../brand'
const docs = {
  terminos: 'Términos y condiciones',
  privacidad: 'Aviso de privacidad',
  cookies: 'Política de cookies',
}
export default function Legal({ kind }) {
  return (
    <section className="wrap narrow">
      <h1>{docs[kind]}</h1>
      <p className="muted">Contenido pendiente: {brand.name} compartirá el texto oficial y los datos de la empresa para publicarlo aquí.</p>
    </section>
  )
}
