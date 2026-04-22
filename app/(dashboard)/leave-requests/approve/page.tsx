import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { FormApproval, FormRejection } from '@/app/(dashboard)/leave-requests/approve/form-approval'
import Heading from '@/components/heading'
import { getApprovalStatus, getJenisCuti } from '@/components/ui/badge'
import { buttonStyles } from '@/components/ui/button-style'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import { listEmployeesDepartment } from '@/server/repositories/employees.repository'
import { getLeaveRequest } from '@/server/repositories/leave.repository'
import { getPermissions } from '@/server/services/auth.service'

export default async function Page({ searchParams }: { searchParams: Promise<{ id: string }> }) {
    const params = await searchParams
    const leaveId = params.id || ''
    return (
        <>
            <Heading description='Silakan setujui / tolak permohonan cuti' title='Setujui / Tolak'>
                <Link className={buttonStyles({ intent: 'outline' })} href={'/leave-requests'}>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <LeaveRequestForm leaveId={leaveId} />
            </Suspense>
        </>
    )
}

async function LeaveRequestForm({ leaveId }: { leaveId: string }) {
    const permissions = await getPermissions()
    const departmentId = permissions.supervisor.map((d) => d.id).join('')

    if (!permissions.admin && !permissions.hr && !permissions.supervisor.some((s) => s.id === departmentId)) {
        return redirect('/dashboard')
    }

    const leave = await getLeaveRequest(leaveId)
    const employees = await listEmployeesDepartment(permissions.hr ? undefined : [departmentId])
    if (!leave) {
        return <div>Data tidak ditemukan</div>
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Permohnan Cuti</CardTitle>
                <CardDescription>Diajukan pada: {formatDate(String(leave.createdAt))}</CardDescription>
            </CardHeader>
            <CardContent>
                <DescriptionList>
                    <DescriptionTerm>Nama</DescriptionTerm>
                    <DescriptionDetails>{leave.employee.name}</DescriptionDetails>
                    <DescriptionTerm>Unit</DescriptionTerm>
                    <DescriptionDetails>{leave.employee.departments[0].department.name}</DescriptionDetails>
                    <DescriptionTerm>Masa</DescriptionTerm>
                    <DescriptionDetails>
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </DescriptionDetails>
                    <DescriptionTerm>Jenis Cuti</DescriptionTerm>
                    <DescriptionDetails>{getJenisCuti(leave.leaveType)}</DescriptionDetails>
                    <DescriptionTerm>Alasan</DescriptionTerm>
                    <DescriptionDetails>{leave.reason ?? '-'}</DescriptionDetails>
                    <DescriptionTerm>Status</DescriptionTerm>
                    <DescriptionDetails>{getApprovalStatus(leave.status)}</DescriptionDetails>
                    {leave.status === 'rejected' ? (
                        <>
                            <DescriptionTerm>Alasan Penolakan</DescriptionTerm>
                            <DescriptionDetails>{leave.rejectedReason ?? '-'}</DescriptionDetails>
                        </>
                    ) : (
                        <>
                            <DescriptionTerm>Pengganti</DescriptionTerm>
                            <DescriptionDetails>{leave.replacedBy?.name ?? 'Belum ditentukan'}</DescriptionDetails>
                        </>
                    )}
                </DescriptionList>
            </CardContent>
            <CardFooter className='flex justify-end gap-2'>
                <FormRejection leave={leave} />
                <FormApproval items={employees.filter((e) => e.id !== leave.employeeId)} leave={leave} />
            </CardFooter>
        </Card>
    )
}
