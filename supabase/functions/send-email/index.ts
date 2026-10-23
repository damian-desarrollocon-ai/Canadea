// Edge Function: envía correos con Resend y los registra en email_log.
// Secrets: RESEND_API_KEY. El remitente debe pertenecer a un dominio verificado en Resend (SPF/DKIM).
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('No autorizado', { status: 401 })
  const { data: ok } = await supabase.rpc('is_staff')
  if (!ok) return new Response('Prohibido', { status: 403 })

  const { to, subject, html, from, application_id, company_id } = await req.json()
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  })
  await supabase.from('email_log').insert({ application_id, company_id, to_email: to, subject, body: html, status: r.ok ? 'enviado' : 'error' })
  return new Response(JSON.stringify({ ok: r.ok }), { status: r.ok ? 200 : 502 })
})
