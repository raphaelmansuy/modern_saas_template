import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  publicRoutes: ['/', '/dashboard', '/sign-in', '/sign-up'],
  ignoredRoutes: ['/api/(.*)'],
  afterAuth(auth, req) {
    // Handle signout redirect
    if (auth.isPublicRoute) {
      return
    }

    if (!auth.userId) {
      // Redirect to sign-in page
      const signInUrl = new URL('/sign-in', req.url)
      return Response.redirect(signInUrl)
    }
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
