import { i18n } from '@better-auth/i18n'
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { nextCookies } from 'better-auth/next-js'
import { admin, username } from 'better-auth/plugins'
import z from 'zod'
import db from '@/lib/db'

export const passwordSchema = z.string().min(6, { message: 'Password minimal 6 karakter' })

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: 'postgresql'
    }),
    emailAndPassword: {
        disableSignUp: true,
        enabled: true,
        requireEmailVerification: false
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path === '/reset-password' || ctx.path === '/change-password') {
                const password = ctx.body.password || ctx.body.newPassword
                const { error } = passwordSchema.safeParse(password)
                if (error) {
                    throw new APIError('BAD_REQUEST', {
                        message: 'Password kurang kuat'
                    })
                }
            }
        })
    },
    plugins: [
        admin(),
        username(),
        i18n({
            translations: {
                id: {
                    USER_NOT_FOUND: 'Pengguna tidak ditemukan',
                    INVALID_USERNAME_OR_PASSWORD: 'Username atau password salah',
                    INVALID_EMAIL_OR_PASSWORD: 'Email atau password salah',
                    INVALID_PASSWORD: 'Password salah'
                }
            }
        }),
        nextCookies()
    ],
    secret: process.env.BETTER_AUTH_SECRET,
    user: {
        changeEmail: {
            updateEmailWithoutVerification: true,
            enabled: true
        }
    }
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
