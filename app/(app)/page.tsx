import type { Metadata } from 'next'
import type { ComponentType, SVGProps } from 'react'
import {
    IconArrowRight,
    IconBuilding,
    IconCalendarDays,
    IconCircleCheck,
    IconClock,
    IconDocumentEdit
} from '@intentui/icons'
import Link from 'next/link'
import { Badge, getApprovalStatus, getJenisCuti } from '@/components/ui/badge'
import { buttonStyles } from '@/components/ui/button-style'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import db from '@/lib/db'
import { cn, fullName, getEmployeeStatus } from '@/lib/utils'
import { getEmployeeByUserId, getPermissions } from '@/server/services/auth.service'

export const metadata: Metadata = {
    title: 'Home',
    description: 'Selamat datang di sistem informasi manajemen sumber daya manusia RSIMNU.'
}

export default async function Page() {
    const [permissions, employee] = await Promise.all([getPermissions(), getEmployeeByUserId()])

    if (!employee) {
        return (
            <section className='rounded-[2rem] border bg-linear-to-br from-bg via-bg to-secondary/50 p-8 shadow-sm'>
                <div className='max-w-2xl space-y-3'>
                    <Badge intent='warning'>Profil pegawai belum terhubung</Badge>
                    <h1 className='font-semibold text-3xl tracking-tight'>Data pegawai Anda belum ditemukan</h1>
                    <p className='text-muted-fg text-sm/6 sm:text-base/7'>
                        Akun Anda sudah masuk, tetapi belum tersambung ke data kepegawaian. Silakan hubungi tim SDM agar
                        akun ini bisa menampilkan jadwal, absensi, dan layanan personal lainnya.
                    </p>
                </div>
            </section>
        )
    }

    const todayKey = getJakartaDateKey()
    const todayLabel = formatLongDate(todayKey)
    const greeting = getGreeting()
    const activeDepartment = employee.departments.find((item) => item.endAt === null)
    const monthStart = `${todayKey.slice(0, 7)}-01`

    const [todaySchedule, upcomingSchedules, monthSchedules, pendingLeaveCount, leaveRequests] = await Promise.all([
        db.schedule.findFirst({
            where: {
                employeeId: employee.id,
                date: todayKey
            },
            select: {
                date: true,
                shiftCode: true,
                checkInAt: true,
                checkOutAt: true,
                late: true,
                earlyDeparture: true,
                totalWorkHours: true,
                note: true
            }
        }),
        db.schedule.findMany({
            where: {
                employeeId: employee.id,
                date: {
                    gte: todayKey
                }
            },
            orderBy: [{ date: 'asc' }],
            take: 4,
            select: {
                date: true,
                shiftCode: true,
                checkInAt: true,
                checkOutAt: true,
                note: true
            }
        }),
        db.schedule.findMany({
            where: {
                employeeId: employee.id,
                date: {
                    gte: monthStart,
                    lte: todayKey
                }
            },
            orderBy: [{ date: 'asc' }],
            select: {
                date: true,
                checkInAt: true,
                late: true,
                earlyDeparture: true,
                totalWorkHours: true,
                note: true
            }
        }),
        db.leave.count({
            where: {
                employeeId: employee.id,
                status: 'pending'
            }
        }),
        db.leave.findMany({
            where: {
                employeeId: employee.id
            },
            orderBy: [{ createdAt: 'desc' }],
            take: 3,
            select: {
                id: true,
                startDate: true,
                endDate: true,
                leaveType: true,
                status: true
            }
        })
    ])

    const monthlySummary = summarizeSchedules(monthSchedules)
    const currentUnit =
        activeDepartment?.department.name ?? permissions.currentDepartment?.department.name ?? 'Belum ada unit aktif'
    const employeeName = fullName(employee.name, employee.prefix, employee.suffix)

    return (
        <div className='space-y-6'>
            <section className='grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]'>
                <div className='relative overflow-hidden rounded-[2rem] border bg-linear-to-br from-primary/15 via-bg to-warning/10 p-6 shadow-sm sm:p-8'>
                    <div className='absolute top-0 right-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl' />
                    <div className='absolute bottom-0 left-0 h-32 w-32 rounded-full bg-warning/15 blur-3xl' />
                    <div className='relative space-y-6'>
                        <div className='flex flex-wrap items-center gap-2'>
                            <Badge intent='primary'>{todayLabel}</Badge>
                            <Badge intent='outline'>{greeting}</Badge>
                            {permissions.hr && <Badge intent='info'>Tim SDM</Badge>}
                            {permissions.supervisor.length > 0 && <Badge intent='warning'>Supervisor</Badge>}
                            {permissions.admin && <Badge intent='danger'>Admin</Badge>}
                        </div>

                        <div className='max-w-3xl space-y-3'>
                            <h1 className='font-semibold text-3xl tracking-tight sm:text-4xl'>
                                Selamat datang, {permissions.user?.displayUsername ?? employeeName}!
                            </h1>
                            <p className='text-base/7 text-muted-fg sm:text-lg/8'>
                                Web ini merangkum aktivitas kerja Anda hari ini, progres absensi bulan berjalan, jadwal
                                terdekat, dan status cuti tanpa perlu pindah-pindah halaman.
                            </p>
                        </div>

                        <div className='grid gap-3 sm:grid-cols-3'>
                            <HeroStat icon={IconBuilding} label='Unit Aktif' value={currentUnit} />
                            <HeroStat
                                icon={IconCalendarDays}
                                label='Jadwal Bulan Ini'
                                value={`${monthlySummary.totalDays} hari`}
                            />
                            <HeroStat
                                icon={IconCircleCheck}
                                label='Hadir Tercatat'
                                value={`${monthlySummary.attendedDays} hari`}
                            />
                        </div>

                        <div className='flex flex-wrap gap-3'>
                            <Link className={buttonStyles()} href='/jadwal'>
                                <IconCalendarDays data-slot='icon' />
                                Lihat Jadwal
                            </Link>
                            <Link className={buttonStyles({ intent: 'outline' })} href='/rekap-absensi'>
                                <IconClock data-slot='icon' />
                                Rekap Absensi
                            </Link>
                            <Link className={buttonStyles({ intent: 'plain' })} href='/leave-requests/create'>
                                <IconDocumentEdit data-slot='icon' />
                                Ajukan Cuti
                            </Link>
                        </div>
                    </div>
                </div>

                <Card className='bg-bg/95'>
                    <CardHeader
                        description='Gambaran singkat kondisi kerja Anda pada hari ini.'
                        title='Status Hari Ini'
                    />
                    <CardContent className='space-y-5'>
                        <div className='rounded-2xl border bg-secondary/40 p-4'>
                            <p className='text-muted-fg text-xs uppercase tracking-[0.24em]'>Shift hari ini</p>
                            <div className='mt-2 flex items-end justify-between gap-3'>
                                <div>
                                    <div className='font-semibold text-2xl'>
                                        {todaySchedule?.shiftCode ?? 'Belum ada jadwal'}
                                    </div>
                                    <p className='mt-1 text-muted-fg text-sm'>
                                        {todaySchedule
                                            ? `Jadwal untuk ${todayLabel.toLowerCase()}.`
                                            : 'Belum ada penugasan yang tercatat untuk hari ini.'}
                                    </p>
                                </div>
                                <div
                                    className={cn(
                                        'rounded-full px-3 py-1 font-medium text-xs',
                                        todaySchedule?.checkInAt
                                            ? 'bg-success/20 text-success-fg'
                                            : 'bg-warning/20 text-warning-subtle-fg'
                                    )}
                                >
                                    {todaySchedule?.checkInAt ? 'Sudah check-in' : 'Menunggu check-in'}
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                            <MiniStat label='Check-in' value={todaySchedule?.checkInAt ?? '--:--'} />
                            <MiniStat label='Check-out' value={todaySchedule?.checkOutAt ?? '--:--'} />
                            <MiniStat label='Telat' value={todaySchedule?.late ?? '00:00'} />
                            <MiniStat label='Jam kerja' value={todaySchedule?.totalWorkHours ?? '00:00'} />
                        </div>

                        <div className='rounded-2xl border border-dashed p-4 text-muted-fg text-sm/6'>
                            {todaySchedule?.note
                                ? `Catatan hari ini: ${todaySchedule.note}`
                                : 'Belum ada catatan tambahan pada absensi hari ini.'}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <MetricCard
                    description='total hari yang memiliki jadwal pada bulan berjalan'
                    label='Hari Terjadwal'
                    value={String(monthlySummary.totalDays)}
                />
                <MetricCard
                    description='hari yang sudah memiliki catatan check-in'
                    label='Kehadiran'
                    value={String(monthlySummary.attendedDays)}
                />
                <MetricCard
                    description='akumulasi kejadian terlambat pada bulan berjalan'
                    label='Keterlambatan'
                    value={String(monthlySummary.lateDays)}
                />
                <MetricCard
                    description='permohonan cuti Anda yang masih menunggu persetujuan'
                    label='Cuti Pending'
                    value={String(pendingLeaveCount)}
                />
            </section>

            <section className='grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.95fr)]'>
                <Card>
                    <CardHeader
                        description='Jadwal terdekat yang sudah disiapkan untuk Anda mulai hari ini.'
                        title='Agenda Shift'
                    />
                    <CardContent className='space-y-3'>
                        {upcomingSchedules.length > 0 ? (
                            upcomingSchedules.map((schedule, index) => (
                                <div
                                    className='flex flex-col gap-3 rounded-2xl border bg-linear-to-r from-bg to-secondary/35 p-4 sm:flex-row sm:items-center sm:justify-between'
                                    key={`${schedule.date}-${index}`}
                                >
                                    <div className='space-y-1'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <span className='font-medium'>{formatShortDate(schedule.date)}</span>
                                            <Badge intent={schedule.date === todayKey ? 'primary' : 'outline'}>
                                                {schedule.date === todayKey ? 'Hari ini' : 'Mendatang'}
                                            </Badge>
                                        </div>
                                        <p className='text-muted-fg text-sm'>
                                            Shift {schedule.shiftCode} {schedule.note ? `• ${schedule.note}` : ''}
                                        </p>
                                    </div>
                                    <div className='flex items-center gap-2 text-muted-fg text-sm'>
                                        <IconClock className='size-4' />
                                        <span>{schedule.checkInAt ?? '--:--'}</span>
                                        <span>-</span>
                                        <span>{schedule.checkOutAt ?? '--:--'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyBlock text='Belum ada jadwal mendatang yang tercatat.' />
                        )}
                    </CardContent>
                </Card>

                <div className='grid gap-4'>
                    <Card>
                        <CardHeader
                            description='Status pengajuan cuti terakhir Anda agar mudah dipantau.'
                            title='Status Cuti'
                        />
                        <CardContent className='space-y-3'>
                            {leaveRequests.length > 0 ? (
                                leaveRequests.map((leave) => (
                                    <div className='rounded-2xl border p-4' key={leave.id}>
                                        <div className='flex flex-wrap items-center justify-between gap-2'>
                                            <div className='font-medium'>
                                                {formatShortDate(leave.startDate)} - {formatShortDate(leave.endDate)}
                                            </div>
                                            {getApprovalStatus(leave.status)}
                                        </div>
                                        <div className='mt-2 text-muted-fg text-sm'>
                                            {getJenisCuti(leave.leaveType)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <EmptyBlock text='Belum ada riwayat pengajuan cuti.' />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader
                            description='Ringkasan identitas kerja yang sedang aktif pada akun Anda.'
                            title='Profil Singkat'
                        />
                        <CardContent className='space-y-4'>
                            <div className='space-y-1'>
                                <p className='text-muted-fg text-xs uppercase tracking-[0.24em]'>Nama lengkap</p>
                                <CardTitle>{employeeName}</CardTitle>
                            </div>
                            <div className='grid gap-3 sm:grid-cols-2'>
                                <ProfileItem label='Unit' value={currentUnit} />
                                <ProfileItem label='Posisi' value={activeDepartment?.position ?? 'Belum diatur'} />
                                <ProfileItem label='Status' value={getEmployeeStatus(employee.status)} />
                                <ProfileItem label='Kuota cuti' value={`${employee.leaveQuota} hari`} />
                            </div>
                            <Link
                                className='inline-flex items-center gap-2 font-medium text-primary text-sm hover:underline'
                                href='/profile'
                            >
                                Lihat profil lengkap
                                <IconArrowRight className='size-4' />
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}

function HeroStat({
    icon: Icon,
    label,
    value
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>
    label: string
    value: string
}) {
    return (
        <div className='rounded-2xl border border-white/40 bg-white/65 p-4 backdrop-blur dark:border-white/10 dark:bg-white/5'>
            <div className='flex items-center gap-2 text-muted-fg text-sm'>
                <Icon className='size-4' />
                {label}
            </div>
            <div className='mt-3 font-semibold text-base/6'>{value}</div>
        </div>
    )
}

function MiniStat({ label, value }: { label: string; value: string }) {
    return (
        <div className='rounded-2xl border p-4'>
            <p className='text-muted-fg text-sm'>{label}</p>
            <p className='mt-2 font-semibold text-lg'>{value}</p>
        </div>
    )
}

function MetricCard({ label, value, description }: { label: string; value: string; description: string }) {
    return (
        <Card className='bg-linear-to-br from-bg to-secondary/35'>
            <CardContent className='space-y-2 pt-6'>
                <p className='text-muted-fg text-sm'>{label}</p>
                <p className='font-semibold text-3xl tracking-tight'>{value}</p>
                <p className='text-muted-fg text-sm/6'>{description}</p>
            </CardContent>
        </Card>
    )
}

function ProfileItem({ label, value }: { label: string; value: string }) {
    return (
        <div className='rounded-2xl border bg-secondary/25 p-4'>
            <p className='text-muted-fg text-sm'>{label}</p>
            <p className='mt-2 font-medium'>{value}</p>
        </div>
    )
}

function EmptyBlock({ text }: { text: string }) {
    return <div className='rounded-2xl border border-dashed p-5 text-center text-muted-fg text-sm/6'>{text}</div>
}

function summarizeSchedules(
    schedules: Array<{
        checkInAt: string | null
        late: string | null
        earlyDeparture: string | null
        totalWorkHours: string | null
        note: string | null
    }>
) {
    return schedules.reduce(
        (acc, schedule) => {
            acc.totalDays += 1
            if (schedule.checkInAt) acc.attendedDays += 1
            if (schedule.late) acc.lateDays += 1
            if (schedule.earlyDeparture) acc.earlyDepartureDays += 1
            if (schedule.note) acc.manualNotes += 1
            acc.totalWorkMinutes += toMinutes(schedule.totalWorkHours)
            return acc
        },
        {
            totalDays: 0,
            attendedDays: 0,
            lateDays: 0,
            earlyDepartureDays: 0,
            manualNotes: 0,
            totalWorkMinutes: 0
        }
    )
}

function toMinutes(value?: string | null) {
    if (!value) return 0
    const [hours, minutes] = value.split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
    return hours * 60 + minutes
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

function getGreeting() {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        hour12: false
    })

    const hour = Number(formatter.format(new Date()))

    if (hour < 11) return 'Selamat pagi'
    if (hour < 15) return 'Selamat siang'
    if (hour < 18) return 'Selamat sore'
    return 'Selamat malam'
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
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    }).format(new Date(`${date}T00:00:00Z`))
}
