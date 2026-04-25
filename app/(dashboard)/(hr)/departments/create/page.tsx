import type { Metadata } from 'next'
import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { FormDepartment } from '@/app/(dashboard)/(hr)/departments/form-department'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'

export const metadata: Metadata = {
    title: 'Tambah Unit'
}

export default async function CreateEmployeePage() {
    return (
        <>
            <Heading description={'Silakan isikan form di bawah ini'} title={'Tambah Unit'}>
                <Link className={buttonStyles({ intent: 'outline' })} href='/departments'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense>
                <DepartmentCreate />
            </Suspense>
        </>
    )
}

const DepartmentCreate = () => {
    return <FormDepartment />
}
