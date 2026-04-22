import type { Metadata } from 'next'
import Heading from '@/components/heading'
import { EditUserForm } from './edit-form'

export const metadata: Metadata = {
    title: 'Edit Pengguna'
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className='space-y-4 px-4 lg:px-6'>
            <Heading description='Fill the form below' title='Update User' />
            <EditUserForm id={id} />
        </div>
    )
}
