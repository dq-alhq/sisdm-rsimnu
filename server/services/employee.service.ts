'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { app } from '@/config/app'
import { EmployeeStatus, Gender } from '@/generated/enums'
import { auth } from '@/lib/auth'
import db from '@/lib/db'
import z, { parseFormData } from '@/lib/zod'
import { deleteDocumentByEmployeeId } from '@/server/services/document.service'

const employeeSchema = z.object({
    id: z.string().min(8, 'NIP Wajib 8 angka'),
    name: z.string().min(3, 'Nama Wajib Minimal 3 karakter'),
    gender: z.enum(Gender),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    phone: z.string().optional(),
    email: z.email(),
    joinDate: z.string().min(1, 'Tanggal Wajib'),
    endDate: z.string().optional(),
    status: z.enum(EmployeeStatus),
    birthPlace: z.string().optional(),
    birthDate: z.string().optional(),
    nik: z.string().optional(),
    education: z.string().optional(),
    address: z.string().optional(),
    str: z.string().optional(),
    strEnd: z.string().optional(),
    sip: z.string().optional(),
    sipStart: z.string().optional(),
    sipEnd: z.string().optional(),
    bpjsKes: z.string().optional(),
    bpjsTk: z.string().optional(),
    npwp: z.string().optional(),
    fingerprint: z.string().optional()
})

export const upsertEmployee = async (_: any, formData: FormData) => {
    const { data, success, error } = employeeSchema.safeParse(Object.fromEntries(formData))
    if (!success)
        return {
            employee: parseFormData(formData),
            success: false,
            error: z.flattenError(error).fieldErrors
        }

    try {
        const dataExists = await db.employee.findUnique({ where: { id: data.id } })
        if (dataExists) {
            await db.user.update({
                where: { id: dataExists.userId },
                data: {
                    name: data.name,
                    email: data?.email ?? `${data.id}@example.test`,
                    role: 'user'
                }
            })
            await db.employee.update({
                where: { id: data.id },
                data: data
            })
        } else {
            const employeeAccount = await auth.api.createUser({
                body: {
                    name: data.name,
                    email: data?.email ?? `${data.id}@example.test`,
                    role: 'user',
                    password: data.id,
                    data: {
                        username: data.id,
                        displayUsername: data.name.split(' ')[0]
                    }
                },
                headers: await headers()
            })
            await db.employee.create({
                data: { ...data, userId: employeeAccount.user.id }
            })
        }
        revalidatePath('/employees')
        return {
            success: true,
            message: 'Pegawai berhasil disimpan'
        }
    } catch (e: any) {
        return {
            success: false,
            error: e.message
        }
    }
}

export const deleteEmployee = async (id: string) => {
    const employee = await db.employee.findUnique({ where: { id: id } })
    if (!employee) {
        return {
            success: false,
            error: 'Pegawai tidak ditemukan'
        }
    }

    try {
        const employeeAccount = await db.user.findUnique({ where: { id: employee.userId } })
        if (employeeAccount) {
            if (employeeAccount?.image) {
                await fetch(`${app.url}/api/blob`, {
                    method: 'DELETE',
                    body: JSON.stringify({ url: employeeAccount.image, method: 'DELETE' })
                })
            }
        }

        await db.user.delete({ where: { id: employee.userId } })
        await deleteDocumentByEmployeeId(id)

        revalidatePath('/employees')
        return {
            success: true,
            message: 'Pegawai berhasil dihapus'
        }
    } catch (e: any) {
        return {
            success: false,
            error: e.message
        }
    }
}
