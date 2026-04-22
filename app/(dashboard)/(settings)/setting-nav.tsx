'use client'

import { usePathname } from 'next/navigation'
import { Tab, TabList, Tabs } from '@/components/ui/tabs'
import { useIsMobile } from '@/hooks/use-mobile'

const navs = [
    { url: '/profile', label: 'Profil' },
    { url: '/security', label: 'Password' },
    { url: '/kepegawaian', label: 'Kepegawaian' },
    { url: '/berkas', label: 'Berkas' }
]

export function SettingNav() {
    const pathname = usePathname()
    const isMobile = useIsMobile()
    return (
        <Tabs aria-label='Setting Navigation' orientation={isMobile ? 'horizontal' : 'vertical'} selectedKey={pathname}>
            <TabList items={navs}>
                {(item) => (
                    <Tab href={item.url} id={item.url}>
                        {item.label}
                    </Tab>
                )}
            </TabList>
        </Tabs>
    )
}
