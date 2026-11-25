// Cambia aquí el nombre y los datos de la agencia cuando los confirme el cliente.
export const brand = {
  name: 'Canadea',
  tagline: 'Tu camino a Canadá, paso a paso.',
}

// Datos que debe entregar la agencia (se muestran en el sitio; si están vacíos, aparece "por confirmar")
export const agency = {
  razonSocial: '17518986 Canadea Inc.',
  permiso: 'BA-2025-264396',            // número de registro/permiso como agencia de reclutamiento
  correoOficial: 'reclutamiento@canadea.ca',      // ej. info@dominio.com
  dominioOficial: 'canadea.ca',     // ej. dominio.com (para el aviso antifraude)
  direccion: '1920 San Fernando PI, Victoria, BC',
  jurisdiccion: 'CANADA',       // ciudad/estado cuyos tribunales aplican (textos legales)
  fechaLegal: '30 agosto 2026',         // fecha de última actualización de los textos legales
  legalBorrador: true,    // pon false cuando el texto legal sea el definitivo
  telefono: '8123803272',
  redes: { facebook: '', instagram: '', tiktok: '', linkedin: '' },
}

// Logos del pie de página. Para cambiarlos usa otra ruta o URL en `src`; para quitarlos, deja la lista vacía: [].
// `href` es opcional (enlace al hacer clic). Si pones archivos propios, guárdalos en public/logos/ y usa '/logos/archivo.svg'.
export const logosOficiales = [
  { src: 'https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-en.svg', alt: 'Gobierno de Canadá', href: '' },
  { src: 'https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg', alt: 'Canadá', href: '' },
]

// Etapas del proceso (SUPUESTO: confirmar con el cliente)
export const stages = [
  { key: 'registro', label: 'Registro' },
  { key: 'documentos', label: 'Validación de documentos' },
  { key: 'seleccion', label: 'Selección de vacantes' },
  { key: 'propuesta', label: 'Propuesta laboral' },
  { key: 'viaje', label: 'Coordinación de viaje' },
]