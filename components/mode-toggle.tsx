'use client'

import { IconMoon, IconSun } from '@intentui/icons'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ModeToggle({ intent = 'plain' }: { intent?: 'outline' | 'plain' }) {
    const { theme, setTheme } = useTheme()
    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
        setTheme(nextTheme)
    }
    return (
        <Button aria-label='Switch Theme' intent={intent} onPress={toggleTheme} size='sq-sm'>
            <IconSun aria-hidden className='rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <IconMoon aria-hidden className='absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
        </Button>
    )
}
