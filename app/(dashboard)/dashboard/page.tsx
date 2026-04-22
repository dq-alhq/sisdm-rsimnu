import type { Metadata } from 'next'
import { IconPersonAdd } from '@intentui/icons'
import Link from 'next/link'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'

export const metadata: Metadata = {
    title: 'Dashboard'
}
export default function Dashboard() {
    return (
        <Heading description='Manage users in this applications' title='Users'>
            <Link className={buttonStyles()} href='/users/create'>
                <IconPersonAdd />
                Add new User
            </Link>
        </Heading>
    )
}
