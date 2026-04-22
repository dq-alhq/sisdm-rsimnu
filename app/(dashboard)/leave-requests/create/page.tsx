import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { FormLeaveRequest } from '@/app/(dashboard)/leave-requests/create/form-request'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { getEmployeeByUserId } from '@/server/services/auth.service'

export default async function Page() {
    return (
        <>
            <Heading description='Mohon isi form pengajuan cuti di bawah ini' title='Pengajuan Cuti'>
                <Link className={buttonStyles({ intent: 'outline' })} href={'/leave-requests'}>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <LeaveRequestForm />
            </Suspense>
        </>
    )
}

async function LeaveRequestForm() {
    const employee = await getEmployeeByUserId()
    if (!employee) {
        return <div>Data tidak ditemukan</div>
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pengajuan Permohonan Cuti</CardTitle>
                <CardDescription>Diajukan pada: {formatDate(String(new Date()))}</CardDescription>
            </CardHeader>
            <FormLeaveRequest employee={employee} />
        </Card>
    )
}
