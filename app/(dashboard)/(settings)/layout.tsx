import type { PropsWithChildren } from 'react'
import { SettingNav } from '@/app/(dashboard)/(settings)/setting-nav'

export default async function Layout({ children }: PropsWithChildren) {
    return (
        <div className='space-y-4 md:grid md:grid-cols-[auto_1fr] md:gap-6'>
            <SettingNav />
            <div className='space-y-4 md:space-y-6'>{children}</div>
        </div>
    )
}
