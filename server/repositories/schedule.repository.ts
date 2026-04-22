'use server'

import db from '@/lib/db'
import z from '@/lib/zod'

const scheduleSchema = z.object({
    q: z.string().catch('').default(''),
    start: z.string().default('2026-03-01'),
    end: z.string().default('2026-03-02'),
    userId: z.string().catch('').default('')
})

export const getSchedules = async (data: z.infer<typeof scheduleSchema>) => {
    const { q, start, end, userId } = data

    const currentEmployee = await db.employee.findUnique({
        where: {
            userId
        },
        select: {
            id: true,
            departments: {
                select: {
                    position: true,
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })

    const allEmployeesInDepartment = await db.employee.findMany({
        where: {
            name: { contains: q, mode: 'insensitive' },
            departments: {
                some: {
                    position: 'Staf',
                    department: {
                        name: currentEmployee?.departments?.[0]?.department?.name
                    }
                }
            }
        },
        orderBy: {
            group: 'asc'
        },
        select: {
            id: true,
            name: true,
            prefix: true,
            suffix: true,
            group: true,
            departments: {
                select: {
                    position: true,
                    department: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    })

    const shiftPatterns = await db.shiftPattern.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        },
        take: 20
    })

    const schedules = await db.schedule.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        }
    })

    const shiftSettings = await db.shiftSetting.findMany({
        select: {
            name: true,
            checkInAt: true,
            checkOutAt: true,
            shiftCode: true
        }
    })
    const shiftSettingsMap = Object.fromEntries(
        shiftSettings.map((s) => [`${s.name} ${s.checkInAt} - ${s.checkOutAt}`, s.shiftCode])
    )

    return {
        currentEmployee,
        allEmployeesInDepartment,
        shiftPatterns,
        schedules,
        shiftSettingsMap
    }
}

export type GetScheduleResponse = Awaited<ReturnType<typeof getSchedules>>
