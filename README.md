# Rumbo Norte (nombre provisional)

Base del portal de seguimiento de folios. React + Vite + Supabase.

## Arrancar
    npm install
    npm run dev

Sin variables de entorno corre en **modo demo** (datos de ejemplo).

## Conectar Supabase
1. Crea el proyecto y ejecuta `supabase/schema.sql` en el SQL Editor.
2. Copia `.env.example` a `.env` y llena URL y anon key.
3. Crea un bucket privado `documentos` en Storage.

## Cambiar el nombre de marca
Edita `src/brand.js`. Las etapas del proceso también están ahí (por confirmar con el cliente).

## Pendiente
Login (candidato y staff), subida de documentos, protección de /admin, notificaciones, límite de intentos en la consulta de folio.

## Correos
`supabase/functions/send-email` envía con Resend. Verifica el dominio de la agencia (y los de las empresas, si quieren enviar desde ellos) en Resend con SPF/DKIM. Para que las empresas respondan al candidato, usa `reply_to`.
