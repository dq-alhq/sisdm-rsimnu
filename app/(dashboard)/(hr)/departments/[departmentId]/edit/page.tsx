import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { FormDepartment } from '@/app/(dashboard)/(hr)/departments/form-department'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { getDepartmentById } from '@/server/repositories/department.repository'

export const generateMetadata = async ({ params }: { params: Promise<{ departmentId: string }> }) => {
    const { departmentId } = await params
    const department = await getDepartmentById(departmentId)
    return {
        title: `${department?.name} Edit`
    }
}
export default async function EmployeeEditPage({ params }: { params: Promise<{ departmentId: string }> }) {
    const { departmentId } = await params
    return (
        <>
            <Heading description={'Silakan isikan form di bawah ini'} title={'Edit Unit'}>
                <Link className={buttonStyles({ intent: 'outline' })} href='/departments'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense>
                <DepartmentEdit id={departmentId} />
            </Suspense>
        </>
    )
}

const DepartmentEdit = async ({ id }: { id: string }) => {
    const department = await getDepartmentById(id)
    if (!department) return null
    return <FormDepartment data={department} />
}
