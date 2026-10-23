// Cambia aquí el nombre y los datos de la agencia cuando los confirme el cliente.
export const brand = {
  name: 'Canadea',
  tagline: 'Tu camino a Canadá, paso a paso.',
}

// Datos que debe entregar la agencia (se muestran en el sitio; si están vacíos, aparece "por confirmar")
export const agency = {
  razonSocial: '',
  permiso: '',            // número de registro/permiso como agencia de reclutamiento
  correoOficial: 'reclutamiento@canadea.ca',      // ej. info@dominio.com
  dominioOficial: 'canadea.ca',     // ej. dominio.com (para el aviso antifraude)
  direccion: '',
  telefono: '',
  redes: { facebook: '', instagram: '', tiktok: '', linkedin: '' },
}

// Etapas del proceso (SUPUESTO: confirmar con el cliente)
export const stages = [
  { key: 'registro', label: 'Registro' },
  { key: 'documentos', label: 'Revisión de documentos' },
  { key: 'entrevista', label: 'Entrevista' },
  { key: 'oferta', label: 'Oferta de empleo' },
  { key: 'visa', label: 'Trámite de visa' },
  { key: 'vuelo', label: 'Vuelo asignado' },
]