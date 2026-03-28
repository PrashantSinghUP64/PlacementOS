import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

export async function requireAuth(req: any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  console.log('[AUTH] Header received:', authHeader ? 'YES' : 'NO')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  
  const token = authHeader.split(' ')[1]
  console.log('[AUTH] Token length:', token?.length)
  console.log('[AUTH] SUPABASE_URL:', process.env.SUPABASE_URL)
  console.log('[AUTH] ANON_KEY exists:', !!process.env.SUPABASE_ANON_KEY)
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  console.log('[AUTH] User:', user?.id)
  console.log('[AUTH] Error:', error?.message)
  
  if (error || !user) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
  req.userId = user.id
  return next()
}
