import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { AppSidebarHeader } from '@/components/app-sidebar-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { getPermissions } from '@/server/services/auth.service'

export default async function layout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const permissions = await getPermissions()

    if (!permissions?.user) {
        redirect('/login')
    }

    return (
        <SidebarProvider>
            <AppSidebar collapsible='dock' permissions={permissions} />
            <SidebarInset>
                <AppSidebarHeader />
                <div className='flex flex-col gap-y-(--layout-padding) p-(--layout-padding) [--layout-padding:--spacing(4)] lg:p-(--layout-padding) sm:[--layout-padding:--spacing(6)]'>
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
