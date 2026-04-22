import type { Metadata } from 'next'
import Heading from '@/components/heading'

export const metadata: Metadata = {
    title: 'Kepegawaian'
}
export default async function Page() {
    return (
        <>
            <Heading description='Data kepegawaian anda' title='Kepegawaian' />
            <div>Kepegawaian</div>
        </>
    )
}
