import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import Heading from '@/components/heading'
import { auth } from '@/lib/auth'
import ProfileUpdateForm from './form'

export const metadata: Metadata = {
    title: 'Pengaturan Profil'
}
export default async function Page() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) {
        return redirect('/login')
    }
    return (
        <>
            <Heading description='Ubah profil anda' title='Profil' />
            <ProfileUpdateForm user={session?.user} />
        </>
    )
}
