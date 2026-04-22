'use server'

import { revalidatePath } from 'next/cache'
import { LeaveType } from '@/generated/enums'
import db from '@/lib/db'
import z from '@/lib/zod'
import { getPermissions } from '@/server/services/auth.service'

const leaveRequestSchema = z
    .object({
        employeeId: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        leaveType: z.enum(LeaveType),
        reason: z.string().min(1, 'Alasan wajib diisi')
    })
    .refine(
        (data) => {
            return data.endDate > data.startDate
        },
        { message: 'Tanggal akhir harus setelah atau sama dengan tanggal mulai', path: ['startDate', 'endDate'] }
    )
export const createLeaveRequest = async (_: any, formData: FormData) => {
    const { data, success, error } = leaveRequestSchema.safeParse(Object.fromEntries(formData))
    if (!success) {
        return { success: false, error: z.flattenError(error).fieldErrors }
    }

    try {
        await db.leave.create({
            data: data
        })
        revalidatePath('/leave-requests')
        return { success: true, message: 'Permohonan cuti berhasil diajukan' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

const approveSchema = z.object({
    id: z.string(),
    replacedById: z.string().min(1, 'Pengganti wajib diisi')
})
export const approveLeaveRequest = async (_: any, formData: FormData) => {
    const permissions = await getPermissions()
    if (!permissions?.user?.id) return { success: false, error: 'Unauthenticated' }
    if (!permissions.admin && !permissions.hr && !permissions.supervisor) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, success, error } = approveSchema.safeParse(Object.fromEntries(formData))

    if (!success) {
        return { success: false, error: z.flattenError(error).fieldErrors }
    }

    try {
        await db.leave.update({
            where: { id: data.id },
            data: {
                status: permissions.hr ? 'hrApproved' : 'supervisorApproved',
                approverId: permissions.user.id,
                replacedById: data.replacedById
            }
        })
        revalidatePath('/leave-requests/approve')
        return { success: true, message: 'Permohonan cuti disetujui' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

const rejectSchema = z.object({
    id: z.string(),
    reason: z.string().min(1, 'Alasan wajib diisi')
})
export const rejectLeaveRequest = async (_: any, formData: FormData) => {
    const permissions = await getPermissions()
    if (!permissions?.user?.id) return { success: false, error: 'Unauthenticated' }
    if (!permissions.admin && !permissions.hr && !permissions.supervisor) {
        return { success: false, error: 'Unauthorized' }
    }

    const { data, success, error } = rejectSchema.safeParse(Object.fromEntries(formData))

    if (!success) {
        return { success: false, error: z.flattenError(error).fieldErrors }
    }

    try {
        await db.leave.update({
            where: { id: data.id },
            data: {
                status: 'rejected',
                rejectedReason: data.reason,
                approverId: permissions.user.id,
                replacedById: null
            }
        })
        revalidatePath('/leave-requests/approve')
        return { success: true, message: 'Permohonan cuti ditolak' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
