import type { Metadata } from 'next'
import Heading from '@/components/heading'
import { UserForm } from '../form'

export const metadata: Metadata = {
    title: 'Tambah Pengguna'
}

export default async function Page() {
    return (
        <div className='space-y-4 px-4 lg:px-6'>
            <Heading description='Silakan isi form berikut' title='Buat Pengguna Baru' />
            <UserForm />
        </div>
    )
}
