import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../supabase'

export const APP_SELECT = `id, folio, stage, program, job_title, company_id, created_at,
  candidates(id, user_id, full_name, email, phone, birth_date),
  documents(id, doc_type, status, reject_reason, file_path, updated_at),
  flights(id, route, flight_date, airline),
  trainings(id, start_date, location, details),
  extra_document_requests(id, doc_type, note, fulfilled),
  admin_notes(id, body, created_at),
  application_status_history(id, stage, changed_at, note)`

export function useAdminData() {
  const [state, setState] = useState({ apps: [], companies: [], loading: true, error: '' })
  const reload = useCallback(async () => {
    const [a, c] = await Promise.all([
      supabase.from('applications').select(APP_SELECT).order('created_at', { ascending: false }),
      supabase.from('companies').select('*').order('name'),
    ])
    const err = a.error || c.error
    if (err) console.error(err)
    setState({ apps: a.data || [], companies: c.data || [], loading: false, error: err ? err.message : '' })
  }, [])
  useEffect(() => { reload() }, [reload])
  return { ...state, reload }
}
