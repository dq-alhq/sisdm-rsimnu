import { redirect } from 'next/navigation'
import AppNavbar from '@/components/app-navbar'
import { Container } from '@/components/ui/container'
import { NavbarProvider } from '@/components/ui/navbar'
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
        <NavbarProvider>
            <AppNavbar intent='float' permissions={permissions} />
            <Container className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>{children}</Container>
        </NavbarProvider>
    )
}
