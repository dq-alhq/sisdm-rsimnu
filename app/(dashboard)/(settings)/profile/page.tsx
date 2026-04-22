import type { Metadata } from 'next'
import Heading from '@/components/heading'
import ProfileUpdateForm from './form'

export const metadata: Metadata = {
    title: 'Pengaturan Profil'
}
export default async function Page() {
    return (
        <>
            <Heading description='Ubah profil anda' title='Profil' />
            <ProfileUpdateForm />
        </>
    )
}
