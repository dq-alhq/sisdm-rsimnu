import { IconFolder } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { LeaveRequestTable } from '@/app/(dashboard)/leave-requests/table'
import Heading from '@/components/heading'
import { Paginator } from '@/components/paginator'
import { Search } from '@/components/search'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'
import { getLeaveRequests } from '@/server/repositories/leave.repository'
import { getPermissions } from '@/server/services/auth.service'

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const filters = await searchParams

    const q = filters?.q ?? ''
    const show = filters?.show ?? 10
    const page = filters?.page ?? 1

    const permissions = await getPermissions()
    const departmentId =
        permissions.supervisor.map((d) => d.id).join('') || permissions.currentDepartment?.departmentId || ''

    return (
        <>
            <Heading description='Daftar permohonan cuti pegawai' title='Permohonan Cuti'>
                <Link className={buttonStyles()} href={'/leave-requests/create'}>
                    <IconFolder />
                    Ajukan Cuti
                </Link>
            </Heading>
            <div>
                <Search />
            </div>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <LeaveRequestList
                    departmentId={permissions.hr ? '' : departmentId}
                    page={Number(page)}
                    q={q}
                    show={Number(show)}
                />
            </Suspense>
        </>
    )
}

async function LeaveRequestList({
    page,
    q,
    show,
    departmentId
}: {
    page: number
    q: string
    show: number
    departmentId: string
}) {
    const { data, totalData, totalPages } = await getLeaveRequests({
        page,
        q,
        show,
        order: 'desc',
        sort: 'createdAt',
        departmentId
    })

    return (
        <>
            <LeaveRequestTable data={data} />
            <Paginator totalData={totalData} totalPages={totalPages} />
        </>
    )
}
