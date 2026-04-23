import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { FormEmployee } from '@/app/(dashboard)/(hr)/employees/form-employee'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'

export default async function CreateEmployeePage() {
    return (
        <>
            <Heading description={'Silakan isikan form di bawah ini'} title={'Tambah Pegawai'}>
                <Link className={buttonStyles({ intent: 'outline' })} href='/employees'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense>
                <EmployeeCreate />
            </Suspense>
        </>
    )
}

const EmployeeCreate = () => {
    return <FormEmployee />
}
