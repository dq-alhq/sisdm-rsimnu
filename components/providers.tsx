'use client'

import type * as React from 'react'
import { useRouter } from 'next/navigation'
import { ThemeProvider, type ThemeProviderProps } from 'next-themes'
import { I18nProvider, RouterProvider } from 'react-aria-components'
import { Toast } from './ui/toast'

declare module 'react-aria-components' {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>['push']>[1]>
    }
}

function ClientProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    return <RouterProvider navigate={router.push}>{children}</RouterProvider>
}

export function Providers({ children, lang, ...props }: ThemeProviderProps & { lang?: string }) {
    return (
        <I18nProvider locale={lang || 'id'}>
            <ClientProvider>
                <ThemeProvider {...props}>
                    <Toast />
                    {children}
                </ThemeProvider>
            </ClientProvider>
        </I18nProvider>
    )
}
