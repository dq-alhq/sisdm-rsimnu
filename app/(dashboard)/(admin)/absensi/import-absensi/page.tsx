import type { Metadata } from 'next'
import { IconArrowLeft } from '@intentui/icons'
import { FormImport } from '@/app/(dashboard)/(admin)/absensi/import-absensi/form-import'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { Link } from '@/components/ui/link'

export const metadata: Metadata = {
    title: 'Import Absensi'
}

export default async function Page() {
    return (
        <>
            <Heading description='Import data rekap kehadiran pegawai' title='Import Absensi'>
                <Link className={buttonStyles({ intent: 'outline' })} href='/absensi'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <FormImport />
        </>
    )
}
