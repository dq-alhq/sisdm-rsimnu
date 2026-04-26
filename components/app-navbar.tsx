'use client'

import type { GetPermissionResult } from '@/server/services/auth.service'
import { IconCalendarClock, IconGrid4, IconLogout, IconPeople } from '@intentui/icons'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Link } from '@/components/ui/link'
import { Menu, MenuContent, MenuHeader, MenuItem, MenuSection, MenuSeparator, MenuTrigger } from '@/components/ui/menu'
import {
    Navbar,
    NavbarGap,
    NavbarItem,
    NavbarLabel,
    NavbarMobile,
    type NavbarProps,
    NavbarSection,
    NavbarSeparator,
    NavbarSpacer,
    NavbarStart,
    NavbarTrigger,
    useNavbar
} from '@/components/ui/navbar'
import { Separator } from '@/components/ui/separator'
import { app } from '@/config/app'
import { getNavigations } from '@/config/navigations'
import { authClient } from '@/lib/auth-client'
import { AppLogo } from './app-logo'
import { ModeToggle } from './mode-toggle'

export default function AppNavbar(props: NavbarProps & { permissions: GetPermissionResult }) {
    const pathname = usePathname()
    const { setOpen, open } = useNavbar()
    useEffect(() => {
        if (open) setOpen(false)
    }, [pathname])

    const { userNavigations } = getNavigations(props.permissions)
    return (
        <>
            <Navbar {...props}>
                <NavbarStart>
                    <Link aria-label='Goto Home' className='flex items-center gap-x-2 font-medium' href='/'>
                        <AppLogo className='size-7' />
                        <span>
                            SISDM<span className='text-muted-fg'>RSIMNU</span>
                        </span>
                    </Link>
                </NavbarStart>
                <NavbarGap />
                <NavbarSection>
                    {userNavigations.map((item) => (
                        <NavbarItem href={item.href} isCurrent={pathname === item.href} key={item.href}>
                            {item.icon && <item.icon />}
                            <NavbarLabel>{item.title}</NavbarLabel>
                        </NavbarItem>
                    ))}
                </NavbarSection>
                <NavbarSpacer />
                <NavbarSection className='max-md:hidden'>
                    <ModeToggle />
                    <Separator className='mr-3 ml-1 h-5' orientation='vertical' />
                    <UserMenu user={props.permissions.user} />
                </NavbarSection>
            </Navbar>
            <NavbarMobile>
                <NavbarTrigger />
                <NavbarSpacer />
                <ModeToggle />
                <NavbarSeparator className='mr-2.5' />
                <UserMenu user={props.permissions.user} />
            </NavbarMobile>
        </>
    )
}

export function UserMenu({ user }: { user: GetPermissionResult['user'] }) {
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
            <MenuTrigger aria-label='Open Menu'>
                <Avatar
                    initials={user?.displayUsername?.charAt(0)}
                    isSquare
                    src={user?.image ? `${app.url}/api/blob?url=${user?.image}` : ''}
                />
            </MenuTrigger>
            <MenuContent className='min-w-60 sm:min-w-56' placement='bottom right'>
                <MenuSection>
                    <MenuHeader separator>
                        <span className='block'>{user?.displayUsername}</span>
                        <span className='font-normal text-muted-fg'>
                            {user?.username} - {user?.role}
                        </span>
                    </MenuHeader>
                </MenuSection>
                <MenuItem href='/dashboard'>
                    <IconGrid4 />
                    Dashboard
                </MenuItem>
                <MenuSeparator />
                <MenuItem href='/employees'>
                    <IconPeople />
                    Data Pegawai
                </MenuItem>
                <MenuItem href='/absensi'>
                    <IconCalendarClock />
                    Data Absensi
                </MenuItem>
                <MenuSeparator />
                <MenuItem intent='danger' onAction={signOut}>
                    <IconLogout />
                    Log out
                </MenuItem>
            </MenuContent>
        </Menu>
    )
}
