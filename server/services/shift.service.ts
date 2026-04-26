'use server'

import { revalidatePath } from 'next/cache'
import db from '@/lib/db'
import z from '@/lib/zod'

const shiftSchema = z.array(
    z.object({
        A: z.string(),
        B: z.string(),
        C: z.string(),
        D: z.string(),
        date: z.string()
    })
)

export const createShift = async (data: z.infer<typeof shiftSchema>) => {
    try {
        await db.$transaction(async (tx) => {
            for (const shift of data) {
                await tx.shiftPattern.upsert({
                    where: {
                        A_B_C_D_date: shift
                    },
                    update: {
                        A: shift.A,
                        B: shift.B,
                        C: shift.C,
                        D: shift.D
                    },
                    create: shift
                })
            }
        })
        return { success: true, message: 'Shift berhasil disimpan' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export const changeEmployeeShiftGroup = async (employeeId: string, group: string) => {
    try {
        await db.employee.update({
            where: {
                id: employeeId
            },
            data: {
                group
            }
        })
        revalidatePath(`/employees/${employeeId}`)
        return { success: true, message: 'Grup shift berhasil diubah' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
