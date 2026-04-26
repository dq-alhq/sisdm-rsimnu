'use server'

import db from '@/lib/db'
import z from '@/lib/zod'

const absensiSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    employeeIds: z.array(z.string()).optional()
})

export const getAbsensi = async (props: z.infer<typeof absensiSchema>) => {
    const { startDate, endDate, employeeIds } = absensiSchema.parse(props)

    if (!employeeIds || employeeIds.length === 0) {
        return null
    }

    return db.schedule.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            },
            employeeId: employeeIds ? { in: employeeIds } : undefined
        },
        select: {
            date: true,
            checkInAt: true,
            checkOutAt: true,
            shiftCode: true,
            late: true,
            earlyDeparture: true,
            totalWorkHours: true,
            note: true,
            employee: {
                select: {
                    id: true,
                    prefix: true,
                    suffix: true,
                    name: true,
                    departments: {
                        select: {
                            position: true,
                            shift: true,
                            endAt: true,
                            department: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}
export type AbsensiData = Awaited<ReturnType<typeof getAbsensi>>

export const getAbsensiManual = async (props: z.infer<typeof absensiSchema>) => {
    const { startDate, endDate } = absensiSchema.parse(props)

    return db.schedule.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate
            },
            note: {
                not: null
            }
        },
        select: {
            date: true,
            checkInAt: true,
            checkOutAt: true,
            shiftCode: true,
            late: true,
            earlyDeparture: true,
            totalWorkHours: true,
            note: true,
            employee: {
                select: {
                    id: true,
                    prefix: true,
                    suffix: true,
                    name: true,
                    departments: {
                        select: {
                            position: true,
                            shift: true,
                            endAt: true,
                            department: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    })
}
