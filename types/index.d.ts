import type { TablerIcon } from '@tabler/icons-react'

export type BreadcrumbItem = {
    title: string
    href: string
}

export type NavItem = {
    title: string
    href: NonNullable<InertiaLinkProps['href']>
    icon?: TablerIcon | null
    isActive?: boolean
    items?: NavItem[]
    show?: boolean
}
