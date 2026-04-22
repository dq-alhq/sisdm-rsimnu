import type { Metadata } from 'next'
import Heading from '@/components/heading'
import ProfileUpdateForm from './form'

export const metadata: Metadata = {
    title: 'Keamanan'
}

export default async function Page() {
    return (
        <>
            <Heading description='Demi keamanan, ubah password anda' title='Keamanan' />
            <ProfileUpdateForm />
        </>
    )
}
