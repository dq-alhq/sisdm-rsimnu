import { IconCalendarClock, IconDownload } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { AbsensiTable } from '@/app/(dashboard)/absensi/absensi-table'
import Heading from '@/components/heading'
import { ButtonGroup } from '@/components/ui/button-group'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'
import { get25thDayOfNextMonth, get26thDayOfMonth } from '@/lib/date'
import { getAbsensi } from '@/server/repositories/absensi.repository'
import { listDepartments } from '@/server/repositories/department.repository'
import { listEmployeesDepartment } from '@/server/repositories/employees.repository'
import { type GetPermissionResult, getPermissions } from '@/server/services/auth.service'

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const filters = await searchParams

    const startDate = filters?.start || get26thDayOfMonth().toString()
    const endDate = filters?.end || get25thDayOfNextMonth().toString()
    const permissions = await getPermissions()
    const employeeIds = filters?.employeeIds ?? permissions.currentDepartment?.employeeId
    const departmentIds = filters?.departmentIds ?? permissions.currentDepartment?.departmentId

    return (
        <>
            <Heading description='Data rekapan absensi anda' title='Rekap Absensi'>
                {permissions.admin && (
                    <ButtonGroup>
                        <Link className={buttonStyles({ intent: 'danger' })} href='/absensi/import-absensi'>
                            <IconDownload />
                            Import
                        </Link>
                        <Link className={buttonStyles()} href='/absensi/create'>
                            <IconCalendarClock />
                            Manual
                        </Link>
                    </ButtonGroup>
                )}
            </Heading>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <ListAbsensi
                    departmentIds={departmentIds}
                    employeeIds={employeeIds}
                    endDate={endDate}
                    permissions={permissions}
                    startDate={startDate}
                />
            </Suspense>
        </>
    )
}

async function ListAbsensi({
    departmentIds,
    employeeIds,
    startDate,
    endDate,
    permissions
}: {
    permissions: GetPermissionResult
    employeeIds?: string
    departmentIds?: string
    startDate?: string
    endDate?: string
}) {
    const [departments, employees] = await Promise.all([
        listDepartments(),
        listEmployeesDepartment(departmentIds ? departmentIds.split(',') : undefined)
    ])

    const absensiData = await getAbsensi({
        employeeIds: employeeIds?.split(','),
        startDate,
        endDate
    })

    return (
        <AbsensiTable
            absensiData={absensiData}
            departments={departments}
            employees={employees}
            permissions={permissions}
        />
    )
}
