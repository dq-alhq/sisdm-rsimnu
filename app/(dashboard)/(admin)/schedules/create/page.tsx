import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { ShiftForm } from '@/app/(dashboard)/(admin)/schedules/create/shift-form'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'

export default function Page() {
    return (
        <>
            <Heading description='Tambah/Ubah Shift' title='Tambah Shift'>
                <Link className={buttonStyles({ intent: 'outline' })} href='/schedules'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <ShiftForm />
            </Suspense>
        </>
    )
}
