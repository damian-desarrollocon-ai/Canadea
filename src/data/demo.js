// Datos de ejemplo para la demo (se usan solo si no hay Supabase configurado)
export const demoApplications = [
  {
    folio: 'CDA-2026-000123', nacimiento: '1994-03-15', nombre: 'María Hernández', programa: 'Temporal', empresa: null, training: null, extras: [{ tipo: 'Carta de antecedentes', nota: 'Solicitada por la empresa' }],
    vacante: 'Empacadora de alimentos, Ontario', stage: 'documentos',
    documents: [
      { tipo: 'Pasaporte', estado: 'aprobado' },
      { tipo: 'INE', estado: 'rechazado', motivo: 'La imagen está borrosa. Súbela de nuevo con mejor luz.' },
      { tipo: 'CV', estado: 'pendiente' },
      { tipo: 'Permiso de trabajo', estado: 'pendiente' },
    ],
    flight: null,
  },
  {
    folio: 'CDA-2026-000087', nacimiento: '1989-11-02', nombre: 'Luis Ortega', programa: 'Permanente', empresa: 'Agro Valley Farms (ejemplo)', training: { fecha: '2026-11-20', lugar: 'Kelowna, BC (ejemplo)', detalle: 'Capacitación pagada por la empresa. Incluye seguridad en campo y manejo de maquinaria.' }, extras: [],
    vacante: 'Operador agrícola, Columbia Británica', stage: 'vuelo',
    documents: [
      { tipo: 'Pasaporte', estado: 'aprobado' },
      { tipo: 'INE', estado: 'aprobado' },
      { tipo: 'CV', estado: 'aprobado' },
    ],
    flight: { fecha: '2026-12-04', ruta: 'CDMX → Vancouver', aerolinea: 'Por confirmar' },
  },
]

export const demoEmpresas = [
  { id: 1, nombre: 'Agro Valley Farms (ejemplo)', dominio: 'agrovalley.example', contacto: 'rrhh@agrovalley.example' },
  { id: 2, nombre: 'Prairie Harvest Co. (ejemplo)', dominio: 'prairieharvest.example', contacto: 'hiring@prairieharvest.example' },
]