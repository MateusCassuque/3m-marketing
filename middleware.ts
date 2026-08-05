import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'


export default async function middleware(request: NextRequest) {
    try {
        const session =
            process.env.NODE_ENV === 'production'
                ? request.cookies.get('__Secure-authjs.session-token')
                : request.cookies.get('authjs.session-token')

        const { pathname } = request.nextUrl

        // 🚫 ignorar arquivos estáticos
        if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
            return NextResponse.next()
        }

        // 📂 rotas públicas
        const publicPaths = [
            '/',
            '/admin/login',
            '/sobre',
            '/admin/cadastrar',
            '/terms-and-privacy',
            '/servicos',
            '/placeholder.png',
            '/privacidade',
            '/termos',
            '/blog',
            '/contato',
            '/portfolio'
        ]

        if (pathname.startsWith('/blog/')) {
            return NextResponse.next()
        }

        if (publicPaths.includes(pathname)) {
            if ((pathname === '/admin/login' || pathname === '/admin/cadastrar') && session) {
                return NextResponse.redirect(
                    new URL('/perfil', request.url)
                )
            }
            return NextResponse.next()
        }

        // 🔐 rotas privadas (root app)
        if (!session) {
            return NextResponse.redirect(
                new URL('/admin/login', request.url)
            )
        }

        return NextResponse.next()
    } catch (err) {
        console.error('Middleware error:', err)
        return NextResponse.redirect(new URL('/admin/login', request.url))
    }
}

// "/admin/:path*"
export const config = {
    matcher: [
        '/((?!api|_next/|favicon.ico|manifest.json|robots.txt|service-worker.js|icons/|images|videos/).*)'
    ]
}