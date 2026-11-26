import { supabase } from '../supabase'

export const NOMBRES = { pasaporte: 'Pasaporte', cv: 'CV', ine: 'INE', rostro: 'Foto de rostro', permiso: 'Permiso de trabajo' }
export const nombreDoc = t => NOMBRES[t] || t
export const ESTADOS = { pendiente: 'En revisión', aprobado: 'Aprobado', rechazado: 'Requiere corrección' }
export const fecha = d => (d ? new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

// Abre un documento privado con un enlace temporal de 60 segundos
export async function abrirDocumento(path) {
  const w = window.open('', '_blank')
  try {
    const { data, error } = await supabase.storage.from('documentos').createSignedUrl(path, 60)
    if (error) throw error
    w.location = data.signedUrl
  } catch (e) { w?.close(); throw e }
}
