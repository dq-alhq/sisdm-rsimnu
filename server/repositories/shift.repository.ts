'use server'

import db from '@/lib/db'
import z from '@/lib/zod'

export const listShifts = async () => {
    const data = await db.shiftSetting.findMany({
        select: {
            checkInAt: true,
            checkOutAt: true,
            name: true
        }
    })

    return data.map((shift) => ({
        id: `${shift.name} ${shift.checkInAt} - ${shift.checkOutAt}`,
        name: `${shift.name} ${shift.checkInAt} - ${shift.checkOutAt}`
    }))
}

const scheduleSchema = z
    .object({
        start: z.string(),
        end: z.string()
    })
    .refine((data) => data.start <= data.end, {
        message: 'Tanggal tidak valid, tanggal akhir harus lebih besar dari tanggal awal',
        path: ['start']
    })

export const getShiftPattern = async (props: z.infer<typeof scheduleSchema>) => {
    const { data, success, error } = await scheduleSchema.safeParseAsync(props)

    if (!success) return { success: false, error: z.flattenError(error).fieldErrors.start }

    const result = await db.shiftPattern.findMany({
        where: {
            date: {
                gte: data.start,
                lte: data.end
            }
        }
    })
    return { success: true, data: result }
}
export type GetShiftPattern = Awaited<ReturnType<typeof getShiftPattern>>
