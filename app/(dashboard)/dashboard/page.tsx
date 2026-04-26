import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import db from '@/lib/db'
import { fullName } from '@/lib/utils'
import { getPermissions } from '@/server/services/auth.service'
import { DashboardContents } from './dashboard-contents'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'Ringkasan operasional pegawai, absensi, unit kerja, dan cuti.'
}

export default async function Dashboard() {
    const permissions = await getPermissions()

    const scopedDepartmentIds = (
        permissions.admin || permissions.hr
            ? []
            : ([
                  ...new Set(
                      [
                          ...permissions.supervisor.map((item) => item.id),
                          permissions.currentDepartment?.departmentId
                      ].filter(Boolean)
                  )
              ] as string[])
    ).sort()

    const todayKey = getJakartaDateKey()
    const todayLabel = formatLongDate(todayKey)
    const lastSevenDays = buildDateRange(todayKey, 7)
    const startOfRange = lastSevenDays[0] ?? todayKey
    const scopeCacheKey = permissions.admin
        ? 'admin'
        : permissions.hr
          ? 'hr'
          : scopedDepartmentIds.join(',') || permissions.user?.id || 'user'

    const {
        totalEmployees,
        activeEmployees,
        probationEmployees,
        totalDepartments,
        pendingLeaveCount,
        supervisorApprovedLeaveCount,
        hrApprovedLeaveCount,
        rejectedLeaveCount,
        todaySchedules,
        recentSchedules,
        upcomingLeaves,
        departmentSnapshot
    } = await getDashboardData({
        scopeCacheKey,
        scopedDepartmentIds,
        startOfRange,
        todayKey
    })

    const checkedInToday = todaySchedules.filter((item) => item.checkInAt).length
    const lateToday = todaySchedules.filter((item) => item.late).length
    const manualAttendanceToday = todaySchedules.filter((item) => item.note).length
    const missingCheckoutToday = todaySchedules.filter((item) => item.checkInAt && !item.checkOutAt).length
    const attendanceRate =
        totalEmployees > 0 ? Math.round((checkedInToday / Math.max(todaySchedules.length, 1)) * 100) : 0
    const onTrackCount = Math.max(checkedInToday - lateToday, 0)
    const attentionCount = pendingLeaveCount + lateToday + manualAttendanceToday

    const attendanceTrend = lastSevenDays.map((date) => {
        const rows = recentSchedules.filter((item) => item.date === date)
        return {
            label: formatChartDate(date),
            Jadwal: rows.length,
            Hadir: rows.filter((item) => item.checkInAt).length,
            Terlambat: rows.filter((item) => item.late).length
        }
    })

    const leaveStatusData = [
        { label: 'Menunggu', total: pendingLeaveCount },
        { label: 'Persetujuan Unit', total: supervisorApprovedLeaveCount },
        { label: 'Disetujui HR', total: hrApprovedLeaveCount },
        { label: 'Ditolak', total: rejectedLeaveCount }
    ]

    const departmentData = departmentSnapshot
        .map((department) => ({
            id: department.id,
            name: department.name,
            total: department.employees.length
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 6)

    const highlightedSchedules = todaySchedules
        .filter((item) => item.late || item.note || (item.checkInAt && !item.checkOutAt))
        .slice(0, 5)
        .map((schedule) => ({
            employeeName: fullName(schedule.employee.name, schedule.employee.prefix, schedule.employee.suffix),
            departmentName: schedule.employee.departments[0]?.department.name ?? 'Tanpa unit',
            shiftCode: schedule.shiftCode,
            checkInAt: schedule.checkInAt,
            checkOutAt: schedule.checkOutAt,
            isLate: Boolean(schedule.late),
            hasManualNote: Boolean(schedule.note),
            hasMissingCheckout: Boolean(schedule.checkInAt && !schedule.checkOutAt)
        }))

    const scopeLabel = getScopeLabel({
        admin: permissions.admin,
        hr: permissions.hr,
        currentDepartmentName: permissions.currentDepartment?.department.name,
        supervisorNames: permissions.supervisor.map((item) => item.name)
    })

    const roleBadges = getRoleBadges({
        admin: permissions.admin,
        hr: permissions.hr,
        isSupervisor: permissions.supervisor.length > 0
    })

    const upcomingLeaveItems = upcomingLeaves.map((leave) => ({
        id: leave.id,
        employeeName: fullName(leave.employee.name, leave.employee.prefix, leave.employee.suffix),
        departmentName: leave.employee.departments[0]?.department.name ?? 'Tanpa unit',
        leaveType: leave.leaveType,
        status: leave.status,
        startLabel: formatShortDate(leave.startDate),
        endLabel: formatShortDate(leave.endDate)
    }))

    return (
        <DashboardContents
            activeEmployees={activeEmployees}
            attendanceRate={attendanceRate}
            attendanceTrend={attendanceTrend}
            attentionCount={attentionCount}
            checkedInToday={checkedInToday}
            departmentData={departmentData}
            highlightedSchedules={highlightedSchedules}
            lateToday={lateToday}
            leaveStatusData={leaveStatusData}
            manualAttendanceToday={manualAttendanceToday}
            missingCheckoutToday={missingCheckoutToday}
            onTrackCount={onTrackCount}
            pendingLeaveCount={pendingLeaveCount}
            probationEmployees={probationEmployees}
            roleBadges={roleBadges}
            scopeLabel={scopeLabel}
            todayLabel={todayLabel}
            todaySchedulesCount={todaySchedules.length}
            totalDepartments={totalDepartments}
            totalEmployees={totalEmployees}
            upcomingLeaves={upcomingLeaveItems}
        />
    )
}

function getJakartaDateKey() {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })

    const parts = formatter.formatToParts(new Date())
    const year = parts.find((part) => part.type === 'year')?.value
    const month = parts.find((part) => part.type === 'month')?.value
    const day = parts.find((part) => part.type === 'day')?.value

    return `${year}-${month}-${day}`
}

function buildDateRange(endDate: string, days: number) {
    const [year, month, day] = endDate.split('-').map(Number)
    const base = new Date(Date.UTC(year || 0, (month || 1) - 1, day || 1))

    return Array.from({ length: days }, (_, index) => {
        const date = new Date(base)
        date.setUTCDate(base.getUTCDate() - (days - index - 1))
        return date.toISOString().slice(0, 10)
    })
}

function formatLongDate(date: string) {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(new Date(`${date}T00:00:00Z`))
}

function formatShortDate(date: string) {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short'
    }).format(new Date(`${date}T00:00:00Z`))
}

function formatChartDate(date: string) {
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }).format(new Date(`${date}T00:00:00Z`))
}

function getScopeLabel({
    admin,
    hr,
    currentDepartmentName,
    supervisorNames
}: {
    admin: boolean
    hr: boolean
    currentDepartmentName?: string
    supervisorNames: string[]
}) {
    if (admin) {
        return 'Anda sedang memantau seluruh organisasi sebagai admin'
    }

    if (hr) {
        return 'Anda sedang memantau seluruh data operasional SDM lintas unit'
    }

    if (supervisorNames.length > 0) {
        return `Anda sedang memantau unit ${supervisorNames.join(', ')}${currentDepartmentName ? ` serta posisi aktif di ${currentDepartmentName}` : ''}`
    }

    if (currentDepartmentName) {
        return `Dashboard ini berfokus pada unit aktif Anda di ${currentDepartmentName}`
    }

    return 'Dashboard ini menampilkan data yang sesuai dengan akses Anda'
}

function getRoleBadges({ admin, hr, isSupervisor }: { admin: boolean; hr: boolean; isSupervisor: boolean }) {
    const badges: Array<{ label: string; intent: 'primary' | 'info' | 'secondary' }> = []

    if (admin) badges.push({ label: 'Admin', intent: 'primary' })
    if (hr) badges.push({ label: 'HR', intent: 'info' })
    if (isSupervisor) badges.push({ label: 'Supervisor', intent: 'secondary' })
    if (badges.length === 0) badges.push({ label: 'Pegawai', intent: 'secondary' })

    return badges
}

type DashboardDataParams = {
    scopedDepartmentIds: string[]
    todayKey: string
    startOfRange: string
    scopeCacheKey: string
}

const getDashboardData = unstable_cache(
    async ({ scopedDepartmentIds, todayKey, startOfRange, scopeCacheKey }: DashboardDataParams) => {
        // Included in function args so cache is scoped by user-access scope.
        void scopeCacheKey

        const employeeScopeWhere = scopedDepartmentIds.length
            ? {
                  departments: {
                      some: {
                          departmentId: {
                              in: scopedDepartmentIds
                          },
                          endAt: null
                      }
                  }
              }
            : {}

        const scheduleScopeWhere = scopedDepartmentIds.length
            ? {
                  employee: {
                      departments: {
                          some: {
                              departmentId: {
                                  in: scopedDepartmentIds
                              },
                              endAt: null
                          }
                      }
                  }
              }
            : {}

        const leaveScopeWhere = scopedDepartmentIds.length
            ? {
                  employee: {
                      departments: {
                          some: {
                              departmentId: {
                                  in: scopedDepartmentIds
                              },
                              endAt: null
                          }
                      }
                  }
              }
            : {}

        const [
            totalEmployees,
            activeEmployees,
            probationEmployees,
            totalDepartments,
            pendingLeaveCount,
            supervisorApprovedLeaveCount,
            hrApprovedLeaveCount,
            rejectedLeaveCount,
            todaySchedules,
            recentSchedules,
            upcomingLeaves,
            departmentSnapshot
        ] = await Promise.all([
            db.employee.count({
                where: employeeScopeWhere
            }),
            db.employee.count({
                where: {
                    ...employeeScopeWhere,
                    status: 'active'
                }
            }),
            db.employee.count({
                where: {
                    ...employeeScopeWhere,
                    status: 'probation'
                }
            }),
            db.department.count({
                where: scopedDepartmentIds.length
                    ? {
                          id: {
                              in: scopedDepartmentIds
                          }
                      }
                    : {
                          isActive: true
                      }
            }),
            db.leave.count({
                where: {
                    ...leaveScopeWhere,
                    status: 'pending'
                }
            }),
            db.leave.count({
                where: {
                    ...leaveScopeWhere,
                    status: 'supervisorApproved'
                }
            }),
            db.leave.count({
                where: {
                    ...leaveScopeWhere,
                    status: 'hrApproved'
                }
            }),
            db.leave.count({
                where: {
                    ...leaveScopeWhere,
                    status: 'rejected'
                }
            }),
            db.schedule.findMany({
                where: {
                    ...scheduleScopeWhere,
                    date: todayKey
                },
                select: {
                    checkInAt: true,
                    checkOutAt: true,
                    late: true,
                    note: true,
                    shiftCode: true,
                    employee: {
                        select: {
                            name: true,
                            prefix: true,
                            suffix: true,
                            departments: {
                                where: {
                                    endAt: null
                                },
                                select: {
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
            }),
            db.schedule.findMany({
                where: {
                    ...scheduleScopeWhere,
                    date: {
                        gte: startOfRange,
                        lte: todayKey
                    }
                },
                select: {
                    date: true,
                    checkInAt: true,
                    late: true
                }
            }),
            db.leave.findMany({
                where: {
                    ...leaveScopeWhere,
                    endDate: {
                        gte: todayKey
                    }
                },
                orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
                take: 5,
                select: {
                    id: true,
                    startDate: true,
                    endDate: true,
                    status: true,
                    leaveType: true,
                    employee: {
                        select: {
                            name: true,
                            prefix: true,
                            suffix: true,
                            departments: {
                                where: {
                                    endAt: null
                                },
                                select: {
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
            }),
            db.department.findMany({
                where: scopedDepartmentIds.length
                    ? {
                          id: {
                              in: scopedDepartmentIds
                          }
                      }
                    : {
                          isActive: true
                      },
                select: {
                    id: true,
                    name: true,
                    employees: {
                        where: {
                            endAt: null
                        },
                        select: {
                            employeeId: true
                        }
                    }
                }
            })
        ])

        return {
            totalEmployees,
            activeEmployees,
            probationEmployees,
            totalDepartments,
            pendingLeaveCount,
            supervisorApprovedLeaveCount,
            hrApprovedLeaveCount,
            rejectedLeaveCount,
            todaySchedules,
            recentSchedules,
            upcomingLeaves,
            departmentSnapshot
        }
    },
    ['dashboard-summary'],
    { revalidate: 20 }
)
