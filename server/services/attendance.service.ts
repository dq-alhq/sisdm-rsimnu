'use server'

import { revalidatePath } from 'next/cache'
import { buildScheduleDraftsFromAttendance, type RawAttendanceRow } from '@/lib/attendance'
import db from '@/lib/db'
import z from '@/lib/zod'

const hasShiftTimeRange = (value: string) => /\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/.test(value)

const normalizeShiftName = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ')

const formatShiftCodeLabel = (name: string, checkInAt: string | null, checkOutAt: string | null) => {
    if (!checkInAt || !checkOutAt) return name
    return `${name} ${checkInAt} - ${checkOutAt}`
}

const rawAttendanceSchema = z.array(
    z.object({
        'AC-No.': z.union([z.string(), z.number()]),
        'No.': z.string().optional(),
        Name: z.string(),
        Time: z.string(),
        State: z.enum(['C/In', 'C/Out']),
        'New State': z.string().optional(),
        Exception: z.string().optional(),
        Operation: z.string().optional()
    })
)

const attendancesSchema = z.array(
    z.object({
        employeeId: z.string(),
        date: z.string(),
        shiftCode: z.string(),
        checkInAt: z.string().optional(),
        checkOutAt: z.string().optional(),
        late: z.string().optional(),
        earlyDeparture: z.string().optional(),
        totalWorkHours: z.string().optional()
    })
)

export const previewAttendances = async (rawAttendances: RawAttendanceRow[]) => {
    const parsed = rawAttendanceSchema.safeParse(rawAttendances)
    if (!parsed.success) {
        return {
            success: false,
            errors: [{ row: 0, errors: ['Format data mentah tidak valid'] }]
        }
    }

    const employeeIds = Array.from(
        new Set(parsed.data.map((attendance) => String(attendance['AC-No.']).replace(/\.0+$/, '').trim()))
    )

    const [employees, shiftSettings] = await Promise.all([
        db.employee.findMany({
            where: {
                id: {
                    in: employeeIds
                }
            },
            select: {
                id: true,
                name: true,
                departments: {
                    where: {
                        endAt: null
                    },
                    orderBy: {
                        assignedAt: 'desc'
                    },
                    select: {
                        shift: true
                    },
                    take: 1
                }
            }
        }),
        db.shiftSetting.findMany({
            select: {
                id: true,
                name: true,
                checkInAt: true,
                checkOutAt: true
            },
            orderBy: {
                name: 'asc'
            }
        })
    ])

    const result = buildScheduleDraftsFromAttendance({
        rows: parsed.data,
        employees: employees.map((employee) => ({
            id: employee.id,
            name: employee.name,
            preferredShiftCode: employee.departments[0]?.shift ?? null
        })),
        shiftSettings
    })

    return {
        success: true,
        data: result
    }
}

export const createAttendances = async (attendances: z.infer<typeof attendancesSchema>) => {
    const parsed = attendancesSchema.safeParse(attendances)
    if (!parsed.success) {
        return {
            success: false,
            error: 'Data absensi tidak valid'
        }
    }

    try {
        const shiftSettings = await db.shiftSetting.findMany({
            select: {
                name: true,
                checkInAt: true,
                checkOutAt: true
            }
        })
        const shiftByName = new Map(
            shiftSettings.map((shift) => [
                normalizeShiftName(shift.name),
                formatShiftCodeLabel(shift.name, shift.checkInAt, shift.checkOutAt)
            ])
        )
        const normalizedAttendances = parsed.data.map((attendance) => {
            if (hasShiftTimeRange(attendance.shiftCode)) return attendance

            const mappedShiftCode = shiftByName.get(normalizeShiftName(attendance.shiftCode))
            if (!mappedShiftCode) return attendance

            return {
                ...attendance,
                shiftCode: mappedShiftCode
            }
        })

        await db.$transaction(
            normalizedAttendances.map((attendance) =>
                db.schedule.upsert({
                    where: {
                        employeeId_date: {
                            employeeId: attendance.employeeId,
                            date: attendance.date
                        }
                    },
                    update: {
                        shiftCode: attendance.shiftCode,
                        checkInAt: attendance.checkInAt,
                        checkOutAt: attendance.checkOutAt,
                        late: attendance.late,
                        earlyDeparture: attendance.earlyDeparture,
                        totalWorkHours: attendance.totalWorkHours
                    },
                    create: attendance
                })
            )
        )

        revalidatePath('/jadwal')
        revalidatePath('/import-absensi')

        return {
            success: true,
            message: `${normalizedAttendances.length} data absensi berhasil disimpan`
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message ?? 'Gagal menyimpan data absensi'
        }
    }
}

const updateAttendanceSchema = z.object({
    employeeId: z.string(),
    date: z.string(),
    shiftCode: z.string(),
    checkInAt: z.string().optional(),
    checkOutAt: z.string().optional(),
    late: z.string().optional(),
    earlyDeparture: z.string().optional(),
    totalWorkHours: z.string().optional(),
    note: z.string().optional()
})

const parseMinutes = (value?: string | null) => {
    if (!value) return 0
    const [hours, minutes] = value.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
    return hours * 60 + minutes
}

const normalizeClock = (value?: string | null) => {
    if (!value) return undefined
    const [hours, minutes] = value.split(':')
    if (!hours || !minutes) return undefined
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`
}

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

const parseShiftRange = (shiftCode: string) => {
    const match = shiftCode.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
    if (!match) return null

    const startMinutes = parseMinutes(match[1])
    const endMinutes = parseMinutes(match[2])

    return {
        startMinutes,
        endMinutes,
        overnight: endMinutes <= startMinutes
    }
}

const calculateAttendanceMetrics = ({
    shiftCode,
    checkInAt,
    checkOutAt
}: {
    shiftCode: string
    checkInAt?: string
    checkOutAt?: string
}) => {
    const shift = parseShiftRange(shiftCode)
    if (!shift) {
        return {
            late: '00:00',
            earlyDeparture: '00:00',
            totalWorkHours: '00:00'
        }
    }

    const checkInMinutes = checkInAt ? parseMinutes(checkInAt) : 0
    const checkOutMinutes = checkOutAt ? parseMinutes(checkOutAt) : 0
    const normalizedShiftEnd = shift.overnight ? shift.endMinutes + 24 * 60 : shift.endMinutes
    const normalizedCheckOut =
        shift.overnight && checkOutMinutes < shift.startMinutes ? checkOutMinutes + 24 * 60 : checkOutMinutes
    const normalizedCheckOutFromCheckIn =
        checkOutAt && checkInAt && checkOutMinutes < checkInMinutes ? checkOutMinutes + 24 * 60 : normalizedCheckOut

    const lateMinutes = checkInAt ? Math.max(0, checkInMinutes - shift.startMinutes) : 0
    const earlyDepartureMinutes = checkOutAt ? Math.max(0, normalizedShiftEnd - normalizedCheckOut) : 0
    const totalWorkMinutes = checkInAt && checkOutAt ? Math.max(0, normalizedCheckOutFromCheckIn - checkInMinutes) : 0

    return {
        late: formatDuration(lateMinutes),
        earlyDeparture: formatDuration(earlyDepartureMinutes),
        totalWorkHours: formatDuration(totalWorkMinutes)
    }
}

export const updateAttendance = async (_: any, formData: FormData) => {
    const { data, success, error } = updateAttendanceSchema.safeParse(Object.fromEntries(formData))
    if (!success) {
        return {
            success: false,
            error: z.flattenError(error).fieldErrors
        }
    }

    try {
        const normalizedCheckInAt = normalizeClock(data.checkInAt)
        const normalizedCheckOutAt = normalizeClock(data.checkOutAt)

        const computed = calculateAttendanceMetrics({
            shiftCode: data.shiftCode,
            checkInAt: normalizedCheckInAt,
            checkOutAt: normalizedCheckOutAt
        })

        await db.schedule.upsert({
            where: {
                employeeId_date: {
                    employeeId: data.employeeId,
                    date: data.date
                }
            },
            update: {
                shiftCode: data.shiftCode,
                checkInAt: normalizedCheckInAt,
                checkOutAt: normalizedCheckOutAt,
                late: computed.late,
                earlyDeparture: computed.earlyDeparture,
                totalWorkHours: computed.totalWorkHours,
                note: data.note
            },
            create: {
                employeeId: data.employeeId,
                date: data.date,
                shiftCode: data.shiftCode,
                checkInAt: normalizedCheckInAt,
                checkOutAt: normalizedCheckOutAt,
                late: computed.late,
                earlyDeparture: computed.earlyDeparture,
                totalWorkHours: computed.totalWorkHours,
                note: data.note
            }
        })
        revalidatePath('/absensi')
        return {
            success: true,
            message: 'Data berhasil diperbarui'
        }
    } catch (e: any) {
        return {
            success: false,
            error: e.message
        }
    }
}

export const deleteAttendance = async (employeeId: string, date: string) => {
    try {
        await db.schedule.delete({
            where: {
                employeeId_date: {
                    employeeId,
                    date
                }
            }
        })
        revalidatePath('/absensi/create')
        return {
            success: true,
            message: 'Data berhasil dihapus'
        }
    } catch (e: any) {
        return {
            success: false,
            error: e.message
        }
    }
}
