'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { app } from '@/config/app'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import z from '@/lib/zod'

const PERF_LOG = process.env.PERF_LOG === '1'

const createUserSchema = z.object({
    role: z.enum(['user', 'admin']),
    username: z.string().min(1),
    name: z.string().min(1),
    email: z.email(),
    image: z.string().optional()
})

export async function createUser(_: any, formData: FormData) {
    const result = createUserSchema.safeParse(Object.fromEntries(formData))
    const { success, data, error } = result

    if (!success) {
        return {
            errors: z.flattenError(error).fieldErrors
        }
    }

    try {
        auth.api.createUser({
            body: data,
            headers: await headers()
        })

        revalidatePath('/users')

        return { success: true }
    } catch (error: any) {
        return {
            success: false,
            errors: {
                name: error?.message
            }
        }
    }
}

const updateUserSchema = z.object({
    userId: z.string(),
    username: z.string().optional(),
    name: z.string().min(1),
    email: z.email(),
    role: z.enum(['user', 'admin']),
    image: z.string().optional()
})

export async function updateUser(_: any, formData: FormData) {
    const result = updateUserSchema.safeParse(Object.fromEntries(formData))
    const { success, data, error } = result

    if (!success) {
        return {
            errors: z.flattenError(error).fieldErrors
        }
    }

    try {
        if (data.image) {
            const old = await getUserById(data.userId)
            if (old?.image && old.image !== data.image) {
                await fetch(`${app.url}/api/blob`, {
                    method: 'DELETE',
                    body: JSON.stringify({ url: old.image, method: 'DELETE' })
                })
            }
        }
        auth.api.adminUpdateUser({
            body: { userId: data.userId, data: data },
            headers: await headers()
        })

        revalidatePath('/users')

        return { success: true }
    } catch (error: any) {
        return {
            success: false,
            errors: {
                name: error?.message
            }
        }
    }
}

const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6)
})

export async function login(_: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData))
    const { success, data, error } = result

    if (!success) {
        return {
            errors: z.flattenError(error).fieldErrors
        }
    }

    try {
        if (data.username.includes('@')) {
            await auth.api.signInEmail({
                body: {
                    email: data.username,
                    ...data
                }
            })
        } else {
            await auth.api.signInUsername({
                body: data
            })
        }
    } catch (error: any) {
        return {
            success: false,
            errors: {
                username: error?.message
            }
        }
    }

    redirect('/', 'replace')
}

const updatePasswordSchema = z
    .object({
        currentPassword: z.string().min(8),
        newPassword: z.string().min(8),
        revokeOtherSessions: z.coerce.boolean().default(false),
        confirmNewPassword: z.string().min(8)
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
        message: "Passwords don't match",
        path: ['confirmNewPassword']
    })

export async function updatePassword(_: any, formData: FormData) {
    const result = updatePasswordSchema.safeParse(Object.fromEntries(formData))
    const { success, data, error } = result

    if (!success) {
        return {
            errors: z.flattenError(error).fieldErrors
        }
    }

    try {
        await auth.api.changePassword({
            body: data,
            headers: await headers()
        })

        return { success: true }
    } catch (error: any) {
        return {
            success: false,
            errors: {
                currentPassword: error?.message
            }
        }
    }
}

const updateProfileSchema = z.object({
    username: z.string().min(1),
    name: z.string().min(1),
    displayUsername: z.string(),
    email: z.email(),
    image: z.string().optional()
})

export async function updateProfile(_: any, formData: FormData) {
    const result = updateProfileSchema.safeParse(Object.fromEntries(formData))
    const { success, data, error } = result

    if (!success) {
        return {
            errors: z.flattenError(error).fieldErrors
        }
    }

    try {
        const session = await auth.api.getSession({ headers: await headers() })
        const old = await getUserById(session?.user?.id || '')
        if (data.image) {
            if (old?.image && old.image !== data.image) {
                await fetch(`${app.url}/api/blob`, {
                    method: 'DELETE',
                    body: JSON.stringify({ url: old.image, method: 'DELETE' })
                })
            }
        }
        await auth.api.updateUser({
            body: {
                name: data.name,
                image: data.image,
                username: data.username,
                displayUsername: data.displayUsername
            },
            headers: await headers()
        })
        if (data.email !== old?.email) {
            await auth.api.changeEmail({
                body: { newEmail: data.email },
                headers: await headers()
            })
        }

        return { success: true }
    } catch (error: any) {
        return {
            success: false,
            errors: {
                name: error?.message
            }
        }
    }
}

export const getUserById = async (id: string) => {
    return db.user.findUnique({ where: { id } })
}

const getPermissionsImpl = async () => {
    const startedAt = performance.now()
    const sessionStartedAt = performance.now()
    const session = await auth.api.getSession({ headers: await headers() })
    const sessionMs = performance.now() - sessionStartedAt
    const user = session?.user
    const departmentsStartedAt = performance.now()
    const departments = await db.employeesOnDepartments.findMany({
        where: {
            AND: [
                {
                    employee: {
                        userId: session?.user.id
                    }
                },
                { endAt: null }
            ]
        },
        select: {
            endAt: true,
            departmentId: true,
            position: true,
            employeeId: true,
            department: {
                select: {
                    name: true
                }
            }
        }
    })
    const departmentsMs = performance.now() - departmentsStartedAt

    const admin = user?.role === 'admin'
    const hr = departments.some((d) => d.position?.toLowerCase().includes('sdm'))
    const currentDepartment = departments.find((d) => d.endAt === null)
    const supervisor = departments
        .filter((d) => d.position?.toLowerCase().includes('supervisor'))
        .map((d) => ({
            id: d.departmentId,
            name: d.department.name
        }))

    const result = {
        user,
        admin,
        hr,
        supervisor,
        currentDepartment
    }

    if (PERF_LOG) {
        const totalMs = performance.now() - startedAt
        console.info(
            `[perf][auth] getPermissions total=${Math.round(totalMs)}ms session=${Math.round(sessionMs)}ms departments=${Math.round(departmentsMs)}ms user=${user?.id ?? 'anonymous'}`
        )
    }

    return result
}
export const getPermissions = cache(getPermissionsImpl)
export type GetPermissionResult = Awaited<ReturnType<typeof getPermissions>>

export const getEmployeeByUserId = async () => {
    const session = await auth.api.getSession({ headers: await headers() })
    const user = session?.user
    return db.employee.findUnique({
        where: { userId: user?.id },
        include: { departments: { include: { department: true } } }
    })
}
export type GetEmployeeByUserIdResult = Awaited<ReturnType<typeof getEmployeeByUserId>>
