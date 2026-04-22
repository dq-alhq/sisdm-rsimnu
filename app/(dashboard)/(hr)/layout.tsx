import { redirect } from 'next/navigation'
import { getPermissions } from '@/server/services/auth.service'

export default async function Layout({ children }: { children: React.ReactNode }) {
    const { user, hr, admin } = await getPermissions()

    if (!user) {
        return redirect('/login')
    }
    if (!hr && !admin) {
        return redirect('/dashboard')
    }

    return children
}
