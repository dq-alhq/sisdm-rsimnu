'use client'

import {
    ArrowTrendingUpIcon,
    BuildingOffice2Icon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    UsersIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { BarChart } from '@/components/ui/bar-chart'
import { buttonStyles } from '@/components/ui/button-style'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Leaderboard,
    LeaderboardContent,
    LeaderboardEnd,
    LeaderboardItem,
    LeaderboardStart
} from '@/components/ui/leaderboard'
import { LineChart } from '@/components/ui/line-chart'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { Separator } from '@/components/ui/separator'
import { Text } from '@/components/ui/text'

export interface DashboardContentsProps {
    attendanceRate: number
    attendanceTrend: Array<{
        label: string
        Jadwal: number
        Hadir: number
        Terlambat: number
    }>
    attentionCount: number
    checkedInToday: number
    departmentData: Array<{
        id: string
        name: string
        total: number
    }>
    highlightedSchedules: Array<{
        employeeName: string
        departmentName: string
        shiftCode: string
        checkInAt: string | null
        checkOutAt: string | null
        isLate: boolean
        hasManualNote: boolean
        hasMissingCheckout: boolean
    }>
    lateToday: number
    leaveStatusData: Array<{
        label: string
        total: number
    }>
    manualAttendanceToday: number
    missingCheckoutToday: number
    onTrackCount: number
    pendingLeaveCount: number
    probationEmployees: number
    roleBadges: Array<{
        label: string
        intent: 'primary' | 'info' | 'secondary'
    }>
    scopeLabel: string
    todayLabel: string
    todaySchedulesCount: number
    totalDepartments: number
    totalEmployees: number
    activeEmployees: number
    upcomingLeaves: Array<{
        id: string
        employeeName: string
        departmentName: string
        leaveType: string
        status: string
        startLabel: string
        endLabel: string
    }>
}

export function DashboardContents({
    attendanceRate,
    attendanceTrend,
    attentionCount,
    checkedInToday,
    departmentData,
    highlightedSchedules,
    lateToday,
    leaveStatusData,
    manualAttendanceToday,
    missingCheckoutToday,
    onTrackCount,
    pendingLeaveCount,
    probationEmployees,
    roleBadges,
    scopeLabel,
    todayLabel,
    todaySchedulesCount,
    totalDepartments,
    totalEmployees,
    activeEmployees,
    upcomingLeaves
}: DashboardContentsProps) {
    return (
        <div className='space-y-6'>
            <section className='grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]'>
                <div className='space-y-5 rounded-lg border bg-linear-to-br from-bg via-bg to-secondary/40 p-6'>
                    <div className='flex flex-wrap items-start justify-between gap-4'>
                        <div className='space-y-3'>
                            <div className='flex flex-wrap items-center gap-2'>
                                <Badge intent='primary'>Dashboard Operasional</Badge>
                                <Badge intent='outline'>{todayLabel}</Badge>
                                {roleBadges.map((badge) => (
                                    <Badge intent={badge.intent} key={badge.label}>
                                        {badge.label}
                                    </Badge>
                                ))}
                            </div>
                            <div className='space-y-2'>
                                <h1 className='font-semibold text-3xl text-fg tracking-tight'>
                                    Ringkasan kondisi SDM hari ini
                                </h1>
                                <Text className='max-w-3xl text-sm/6 sm:text-base/7'>
                                    {scopeLabel}. Fokus utama hari ini ada pada kehadiran, permohonan cuti yang masih
                                    menunggu, dan distribusi personel di unit aktif.
                                </Text>
                            </div>
                        </div>
                        <div className='flex flex-wrap gap-2'>
                            <Link className={buttonStyles()} href='/absensi'>
                                <ClockIcon />
                                Lihat absensi
                            </Link>
                            <Link className={buttonStyles({ intent: 'outline' })} href='/leave-requests'>
                                <DocumentTextIcon />
                                Permohonan cuti
                            </Link>
                        </div>
                    </div>

                    <div className='grid gap-3 sm:grid-cols-3'>
                        <QuickState
                            description='pegawai hadir sesuai jadwal'
                            icon={CheckCircleIcon}
                            intent='success'
                            title='Kehadiran'
                            value={`${checkedInToday}/${todaySchedulesCount}`}
                        />
                        <QuickState
                            description='perlu tindak lanjut hari ini'
                            icon={ExclamationTriangleIcon}
                            intent={attentionCount > 0 ? 'warning' : 'success'}
                            title='Perhatian'
                            value={String(attentionCount)}
                        />
                        <QuickState
                            description='pegawai masih masa percobaan'
                            icon={ArrowTrendingUpIcon}
                            intent='info'
                            title='Probation'
                            value={String(probationEmployees)}
                        />
                    </div>
                </div>

                <div className='rounded-lg border bg-bg p-6'>
                    <div className='flex items-start justify-between gap-4'>
                        <div className='space-y-1'>
                            <p className='font-medium text-fg text-sm'>Kesiapan hari ini</p>
                            <Text>Persentase kehadiran dari jadwal yang sudah tercatat check-in.</Text>
                        </div>
                        <ProgressCircle
                            aria-label='Persentase kehadiran'
                            className='size-18 text-primary'
                            maxValue={100}
                            value={attendanceRate}
                        />
                    </div>
                    <div className='mt-5 space-y-4'>
                        <div>
                            <div className='font-semibold text-3xl text-fg'>{attendanceRate}%</div>
                            <Text className='mt-1'>
                                Kehadiran tercatat terhadap jadwal aktif pada {todayLabel.toLowerCase()}.
                            </Text>
                        </div>
                        <Separator />
                        <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-1'>
                            <MiniStat label='Tepat waktu' value={onTrackCount} />
                            <MiniStat label='Terlambat' value={lateToday} />
                            <MiniStat label='Input manual' value={manualAttendanceToday} />
                            <MiniStat label='Belum checkout' value={missingCheckoutToday} />
                        </div>
                    </div>
                </div>
            </section>

            <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <MetricCard
                    description='pegawai dalam cakupan dashboard'
                    icon={UsersIcon}
                    title='Total Pegawai'
                    value={formatCompact(totalEmployees)}
                />
                <MetricCard
                    description='pegawai berstatus aktif'
                    icon={UserGroupIcon}
                    title='Pegawai Aktif'
                    value={formatCompact(activeEmployees)}
                />
                <MetricCard
                    description='unit kerja yang terpantau'
                    icon={BuildingOffice2Icon}
                    title='Unit Kerja'
                    value={formatCompact(totalDepartments)}
                />
                <MetricCard
                    description='permohonan menunggu proses'
                    icon={CalendarDaysIcon}
                    title='Cuti Pending'
                    value={formatCompact(pendingLeaveCount)}
                />
            </section>

            <section className='grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]'>
                <Card>
                    <CardHeader
                        description='Perbandingan jadwal, kehadiran, dan keterlambatan dalam 7 hari terakhir.'
                        title='Tren Absensi 7 Hari'
                    />
                    <CardContent>
                        <LineChart
                            className='mt-2'
                            config={{
                                Jadwal: { label: 'Jadwal', color: 'var(--color-muted-fg)' },
                                Hadir: { label: 'Hadir', color: 'var(--color-success)' },
                                Terlambat: { label: 'Terlambat', color: 'var(--color-warning)' }
                            }}
                            containerHeight={300}
                            data={attendanceTrend}
                            dataKey='label'
                            legend
                            lineProps={{ strokeWidth: 2.5 }}
                            valueFormatter={(value) => `${value} orang`}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader
                        description='Status seluruh permohonan cuti dalam cakupan yang sedang Anda monitor.'
                        title='Distribusi Status Cuti'
                    />
                    <CardContent>
                        <BarChart
                            className='mt-2'
                            config={{
                                total: { label: 'Jumlah', color: 'var(--color-primary)' }
                            }}
                            containerHeight={300}
                            data={leaveStatusData}
                            dataKey='label'
                            hideXAxis
                            layout='vertical'
                            legend={false}
                            valueFormatter={(value) => `${value} permohonan`}
                            xAxisProps={{ type: 'number' }}
                            yAxisProps={{ type: 'category', width: 110 }}
                        />
                    </CardContent>
                </Card>
            </section>

            <section className='grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.95fr)]'>
                <Card>
                    <CardHeader
                        description='Daftar pegawai yang sedang atau akan menjalani cuti dalam waktu dekat.'
                        title='Agenda Cuti Mendatang'
                    />
                    <CardContent className='space-y-4'>
                        {upcomingLeaves.length > 0 ? (
                            upcomingLeaves.map((leave) => (
                                <div className='flex flex-wrap items-start justify-between gap-3' key={leave.id}>
                                    <div className='space-y-1'>
                                        <div className='font-medium text-fg'>{leave.employeeName}</div>
                                        <Text>
                                            {leave.departmentName} • {formatLeaveType(leave.leaveType)}
                                        </Text>
                                    </div>
                                    <div className='space-y-1 text-right'>
                                        <Badge intent={mapLeaveBadgeIntent(leave.status)}>
                                            {formatLeaveStatus(leave.status)}
                                        </Badge>
                                        <Text>
                                            {leave.startLabel} - {leave.endLabel}
                                        </Text>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <EmptyState
                                description='Belum ada agenda cuti yang terdaftar dalam waktu dekat.'
                                title='Tidak ada agenda cuti'
                            />
                        )}
                    </CardContent>
                </Card>

                <div className='grid gap-6'>
                    <Card>
                        <CardHeader
                            description='Unit dengan jumlah personel aktif terbanyak pada cakupan saat ini.'
                            title='Komposisi Unit'
                        />
                        <CardContent>
                            {departmentData.length > 0 ? (
                                <Leaderboard>
                                    <LeaderboardContent>
                                        {departmentData.map((department) => (
                                            <LeaderboardItem
                                                key={department.id}
                                                maxValue={departmentData[0]?.total || 1}
                                                value={department.total}
                                            >
                                                <LeaderboardStart>{department.name}</LeaderboardStart>
                                                <LeaderboardEnd>{department.total} org</LeaderboardEnd>
                                            </LeaderboardItem>
                                        ))}
                                    </LeaderboardContent>
                                </Leaderboard>
                            ) : (
                                <EmptyState
                                    description='Belum ada unit aktif yang bisa ditampilkan pada dashboard ini.'
                                    title='Belum ada data unit'
                                />
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader
                            description='Catatan absensi hari ini yang tampak memerlukan perhatian.'
                            title='Perlu Ditinjau'
                        />
                        <CardContent className='space-y-4'>
                            {highlightedSchedules.length > 0 ? (
                                highlightedSchedules.map((schedule, index) => (
                                    <div className='space-y-3' key={`${schedule.employeeName}-${index}`}>
                                        <div className='flex flex-wrap items-start justify-between gap-3'>
                                            <div className='space-y-1'>
                                                <div className='font-medium text-fg'>{schedule.employeeName}</div>
                                                <Text>{schedule.departmentName}</Text>
                                            </div>
                                            <div className='flex flex-wrap justify-end gap-2'>
                                                {schedule.isLate && <Badge intent='warning'>Terlambat</Badge>}
                                                {schedule.hasManualNote && <Badge intent='info'>Input Manual</Badge>}
                                                {schedule.hasMissingCheckout && (
                                                    <Badge intent='danger'>Belum Checkout</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <Text>
                                            Shift {schedule.shiftCode} • Check-in {schedule.checkInAt ?? '-'} •
                                            Check-out {schedule.checkOutAt ?? '-'}
                                        </Text>
                                        {index < highlightedSchedules.length - 1 && <Separator />}
                                    </div>
                                ))
                            ) : (
                                <EmptyState
                                    description='Belum ada catatan absensi yang menonjol untuk ditindaklanjuti.'
                                    title='Kondisi absensi cukup stabil'
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}

function MetricCard({
    title,
    value,
    description,
    icon: Icon
}: {
    title: string
    value: string
    description: string
    icon: React.ComponentType<React.ComponentProps<'svg'>>
}) {
    return (
        <Card className='bg-bg'>
            <CardContent className='flex items-start justify-between gap-4 pt-6'>
                <div className='space-y-1'>
                    <Text className='text-xs/5 uppercase tracking-[0.08em]'>{title}</Text>
                    <div className='font-semibold text-3xl text-fg'>{value}</div>
                    <Text>{description}</Text>
                </div>
                <div className='rounded-lg border bg-secondary/50 p-3 text-primary'>
                    <Icon className='size-6' />
                </div>
            </CardContent>
        </Card>
    )
}

function QuickState({
    title,
    value,
    description,
    icon: Icon,
    intent
}: {
    title: string
    value: string
    description: string
    icon: React.ComponentType<React.ComponentProps<'svg'>>
    intent: 'success' | 'warning' | 'info'
}) {
    const intentClass = {
        success: 'border-success/20 bg-success/10 text-success',
        warning: 'border-warning/20 bg-warning/10 text-warning',
        info: 'border-info/20 bg-info/10 text-info'
    }[intent]

    return (
        <div className='rounded-lg border bg-bg/80 p-4'>
            <div className='flex items-start justify-between gap-3'>
                <div>
                    <div className='font-medium text-fg text-sm'>{title}</div>
                    <div className='mt-1 font-semibold text-2xl text-fg'>{value}</div>
                </div>
                <div className={`rounded-lg border p-2 ${intentClass}`}>
                    <Icon className='size-5' />
                </div>
            </div>
            <Text className='mt-2'>{description}</Text>
        </div>
    )
}

function MiniStat({ label, value }: { label: string; value: number }) {
    return (
        <div className='rounded-lg border bg-secondary/30 px-3 py-2'>
            <div className='font-semibold text-fg text-lg'>{value}</div>
            <Text>{label}</Text>
        </div>
    )
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className='rounded-lg border border-dashed px-4 py-6 text-center'>
            <CardTitle>{title}</CardTitle>
            <Text className='mt-1'>{description}</Text>
        </div>
    )
}

function formatCompact(value: number) {
    return new Intl.NumberFormat('id-ID').format(value)
}

function formatLeaveType(type: string) {
    switch (type) {
        case 'annual':
            return 'Cuti tahunan'
        case 'sick':
            return 'Cuti sakit'
        case 'maternity':
            return 'Cuti melahirkan'
        default:
            return 'Cuti lainnya'
    }
}

function formatLeaveStatus(status: string) {
    switch (status) {
        case 'pending':
            return 'Menunggu'
        case 'supervisorApproved':
            return 'Persetujuan Unit'
        case 'hrApproved':
            return 'Disetujui HR'
        case 'rejected':
            return 'Ditolak'
        default:
            return status
    }
}

function mapLeaveBadgeIntent(status: string): 'primary' | 'warning' | 'success' | 'danger' {
    switch (status) {
        case 'pending':
            return 'warning'
        case 'supervisorApproved':
            return 'primary'
        case 'hrApproved':
            return 'success'
        case 'rejected':
            return 'danger'
        default:
            return 'primary'
    }
}
