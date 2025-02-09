import type { Context } from 'hono'
import { AuthService } from '../services/auth.service.js'

export async function authMiddleware(c: Context, next: () => Promise<void>) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const user = await AuthService.verifyToken(token)
  if (!user) {
    return c.json({ message: 'Invalid token' }, 401)
  }

  c.set('user', user)
  await next()
}
