import { defineMiddleware } from 'astro:middleware'
import { migrationRedirect } from './lib/migration.js'
export const onRequest = defineMiddleware((context, next) => {
  const destination = migrationRedirect(context.url)
  if (destination && ['GET', 'HEAD'].includes(context.request.method)) return context.redirect(destination, 301)
  return next()
})
