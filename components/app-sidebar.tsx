'use client'

import type { GetPermissionResult } from '@/server/services/auth.service'
import type { NavItem } from '@/types'
import { IconChevronsUpDown, IconCirclePerson, IconLogout } from '@intentui/icons'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { app } from '@/config/app'
import { getNavigations } from '@/config/navigations'
import { authClient } from '@/lib/auth-client'
import { AppLogo } from './app-logo'
import { Link } from './ui/link'
import { Menu, MenuContent, MenuHeader, MenuItem, MenuLabel, MenuSection, MenuSeparator, MenuTrigger } from './ui/menu'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarItem,
    SidebarLabel,
    SidebarSection,
    useSidebar
} from './ui/sidebar'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    permissions: GetPermissionResult
}

export function AppSidebar({ permissions, ...props }: AppSidebarProps) {
    const pathname = usePathname()
    const { setIsOpenOnMobile, isOpenOnMobile } = useSidebar()

    useEffect(() => {
        if (isOpenOnMobile) {
            setIsOpenOnMobile(false)
        }
    }, [pathname])

    const { mainNavigations, footerNavigations, supervisorNavigations } = getNavigations(permissions)

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <Link className='flex items-center gap-x-2' href={'/'}>
                    <AppLogo className='size-8' />
                    <SidebarLabel className='font-medium'>
                        SISDM<span className='text-muted-fg'>RSIMNU</span>
                    </SidebarLabel>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <NavMenu items={mainNavigations} label='Navigasi' />
                <NavMenu items={supervisorNavigations} label='Unit Manajemen' />
                <NavMenu className='mt-auto' items={footerNavigations} />
            </SidebarContent>
            <SidebarFooter className='flex flex-row justify-between gap-4 group-data-[state=collapsed]:flex-col'>
                <NavUser user={permissions.user} />
            </SidebarFooter>
        </Sidebar>
    )
}

function NavMenu({
    items,
    title,
    ...props
}: {
    items: NavItem[]
    title?: string
} & React.ComponentPropsWithoutRef<typeof SidebarSection>) {
    const pathname = usePathname()

    return (
        <SidebarSection {...props}>
            {items
                .filter((i) => i.show)
                .map((item) => (
                    <SidebarItem
                        href={item.href as string}
                        isCurrent={item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
                        key={item.href as string}
                        tooltip={item.title}
                    >
                        {item.icon && <item.icon />}
                        <SidebarLabel>{item.title}</SidebarLabel>
                    </SidebarItem>
                ))}
        </SidebarSection>
    )
}

function NavUser({ user }: { user: GetPermissionResult['user'] }) {
    const router = useRouter()
    const signOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/login')
                }
            }
        })
    }

    return (
        <Menu>
            <MenuTrigger aria-label='Profile' className='flex w-full items-center justify-between rounded-lg'>
                <div className='flex items-center gap-x-2'>
                    <Avatar
                        className='size-8 *:size-8 group-data-[state=collapsed]:size-6 group-data-[state=collapsed]:*:size-6'
                        initials={user?.displayUsername?.charAt(0)}
                        isSquare
                        src={user?.image ? `${app.url}/api/blob?url=${user?.image}` : ''}
                    />
                    <div className='in-data-[collapsible=dock]:hidden text-sm'>
                        <SidebarLabel>{user?.displayUsername}</SidebarLabel>
                        <span className='-mt-0.5 block text-muted-fg'>
                            {user?.username} - {user?.role}
                        </span>
                    </div>
                </div>
                <IconChevronsUpDown data-slot='chevron' />
            </MenuTrigger>
            <MenuContent
                aria-label='User Menu'
                className='in-data-[sidebar-collapsible=collapsed]:min-w-56 min-w-(--trigger-width)'
                placement='bottom right'
            >
                <MenuSection>
                    <MenuHeader separator>
                        <span className='block'>{user?.displayUsername}</span>
                        <span className='font-normal text-muted-fg'>
                            {user?.username} - {user?.role}
                        </span>
                    </MenuHeader>
                </MenuSection>
                <MenuItem href='/profile'>
                    <IconCirclePerson />
                    <MenuLabel>Profile</MenuLabel>
                </MenuItem>
                <MenuSeparator />
                <MenuItem intent='danger' onAction={signOut}>
                    <IconLogout />
                    <MenuLabel>Logout</MenuLabel>
                </MenuItem>
            </MenuContent>
        </Menu>
    )
}
