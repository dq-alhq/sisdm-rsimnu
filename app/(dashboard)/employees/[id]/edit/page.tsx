import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { FormEmployee } from '@/app/(dashboard)/(hr)/employees/form-employee'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { getEmployeeForEdit } from '@/server/repositories/employees.repository'
import { getPermissions } from '@/server/services/auth.service'

export default async function EmployeeEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const permissions = await getPermissions()
    if (!permissions.admin && !permissions.hr && permissions.currentDepartment?.employeeId !== id)
        return redirect(`/employees/${permissions.currentDepartment?.employeeId}`)

    return (
        <>
            <Heading description={'Silakan isikan form di bawah ini'} title={'Edit Pegawai'}>
                <Link className={buttonStyles({ intent: 'outline' })} href='/employees'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense>
                <EmployeeEdit id={id} />
            </Suspense>
        </>
    )
}

const EmployeeEdit = async ({ id }: { id: string }) => {
    const employee = await getEmployeeForEdit(id)
    if (!employee) return null
    return <FormEmployee data={employee} />
}
