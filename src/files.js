import { supabase } from './supabase'

export const MAX_MB = 10
const TIPOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']

export function validarArchivo(file) {
  if (!file) return 'Selecciona un archivo.'
  if (!TIPOS.includes(file.type)) return 'Solo se aceptan PDF, JPG, PNG o WEBP.'
  if (file.size > MAX_MB * 1024 * 1024) return `El archivo pesa más de ${MAX_MB} MB.`
  return null
}

// Sube al bucket privado dentro de la carpeta del usuario y devuelve la ruta
export async function subirArchivo(file, key = 'doc') {
  const { data: { user } } = await supabase.auth.getUser()
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '')
  const path = `${user.id}/${key}-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('documentos').upload(path, file, { contentType: file.type })
  if (error) throw error
  return path
}