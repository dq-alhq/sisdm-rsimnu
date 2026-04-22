import type { Metadata } from 'next'
import { IconArrowLeft } from '@intentui/icons'
import { Suspense } from 'react'
import { AbsensiManualTable } from '@/app/(dashboard)/(admin)/absensi/create/absensi-manual-table'
import { FormAbsensi } from '@/app/(dashboard)/(admin)/absensi/create/form-absensi'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { Link } from '@/components/ui/link'
import { Skeleton } from '@/components/ui/skeleton'
import { getDate } from '@/lib/utils'
import { getAbsensiManual } from '@/server/repositories/absensi.repository'

export const metadata: Metadata = {
    title: 'Manual Absensi'
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const filters = await searchParams

    const startDate = filters?.start ?? getDate('01')
    const endDate = filters?.end ?? getDate('10')
    return (
        <>
            <Heading description='Buat manual absensi pegawai' title='Buat Absensi Manual'>
                <Link className={buttonStyles({ intent: 'outline' })} href='/absensi'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <FormAbsensi />
                <AbsensiManualList endDate={endDate} startDate={startDate} />
            </Suspense>
        </>
    )
}

async function AbsensiManualList({ startDate, endDate }: { startDate: string; endDate: string }) {
    const absensiManual = await getAbsensiManual({ startDate, endDate })
    if (absensiManual.length === 0) return null
    return <AbsensiManualTable absensiData={absensiManual} />
}
