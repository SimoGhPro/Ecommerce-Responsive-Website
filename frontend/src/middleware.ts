// middleware.ts
import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protect these routes
const protectedRoutes = createRouteMatcher([
  '/checkout',
]);

export default clerkMiddleware(async (auth, req) => {
  
  if (req.nextUrl.pathname === '/') {
    // Redirect to /en
    return NextResponse.redirect(new URL('/en', req.url))
  }
  
  if (protectedRoutes(req)) { auth.protect(); }
  
  return NextResponse.next()

})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
}