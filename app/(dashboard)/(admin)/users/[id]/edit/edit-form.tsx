import type { User } from '@/generated/client'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { UserForm } from '../../form'

export const EditUserForm = async ({ id }: { id: string }) => {
    const user = await auth.api.getUser({
        query: {
            id
        },
        headers: await headers()
    })

    if (!user) return null
    return <UserForm user={user as User} />
}
