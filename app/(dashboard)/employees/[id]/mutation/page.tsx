import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { MutationForm } from '@/app/(dashboard)/employees/[id]/mutation/mutation-form'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { listDepartments } from '@/server/repositories/department.repository'
import { getCurrentEmploymentByEmployeeId } from '@/server/repositories/department-employee.repository'
import { getEmployeeById } from '@/server/repositories/employees.repository'
import { getPermissions } from '@/server/services/auth.service'

export default async function EmployeeMutationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const permissions = await getPermissions()
    if (!permissions.admin && !permissions.hr)
        return redirect(`/employees/${permissions.currentDepartment?.employeeId}`)

    return (
        <>
            <Heading description={'Silakan isikan form di bawah ini'} title={'Mutasi Pegawai'}>
                <Link className={buttonStyles({ intent: 'outline' })} href={`/employees/${id}`}>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense>
                <EmployeeMutation id={id} />
            </Suspense>
        </>
    )
}

const EmployeeMutation = async ({ id }: { id: string }) => {
    const currentEmployement = await getCurrentEmploymentByEmployeeId(id)
    const departments = await listDepartments()
    const employee = await getEmployeeById(id)

    if (!departments?.length || !employee) {
        return null
    }

    return <MutationForm currentEmployment={currentEmployement} departments={departments} employee={employee} />
}
