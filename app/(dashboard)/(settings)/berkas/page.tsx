import type { Metadata } from 'next'
import Heading from '@/components/heading'

export const metadata: Metadata = {
    title: 'Berkas Pegawai'
}
export default async function Page() {
    return (
        <>
            <Heading description='Kelola berkas anda' title='Berkas' />
            <div>Berkas</div>
        </>
    )
}
