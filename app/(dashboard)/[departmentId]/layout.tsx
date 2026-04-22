import { redirect } from 'next/navigation'
import { getPermissions } from '@/server/services/auth.service'

export default async function Layout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ departmentId: string }>
}) {
    const { departmentId } = await params
    const permissions = await getPermissions()
    if (!permissions.admin && !permissions.hr && !permissions.supervisor.some((s) => s.id === departmentId)) {
        return redirect('/dashboard')
    }
    return children
}
