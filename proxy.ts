import { getSessionCookie } from 'better-auth/cookies'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
    const sessionCookie = getSessionCookie(request)

    const { pathname } = request.nextUrl

    // Redirect authenticated users away from login/register pages
    if (sessionCookie && ['/login', '/register'].includes(pathname)) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect unauthenticated users trying to access protected routes
    if (!sessionCookie && ['/dashboard', '/profile', '/users', '/security'].includes(pathname)) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    // Apply middleware to these routes
    matcher: ['/dashboard', '/profile', '/users', '/security', '/login', '/register']
}
