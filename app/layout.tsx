import type { Metadata } from 'next'
import { JetBrains_Mono, Raleway } from 'next/font/google'
import './globals.css'
import type { PropsWithChildren } from 'react'
import { Providers } from '@/components/providers'
import { app } from '@/config/app'

const fontSans = Raleway({
    variable: '--font-sans',
    subsets: ['latin']
})

const fontMono = JetBrains_Mono({
    variable: '--font-mono',
    subsets: ['latin']
})

export const metadata: Metadata = {
    metadataBase: new URL(app.url),
    title: {
        default: `${app.name}`,
        template: `%s / ${app.name}`
    },
    description: app.description,
    alternates: {
        canonical: './'
    },
    authors: [
        {
            name: app.author.name,
            url: app.author.url
        }
    ],
    creator: app.author.username
}

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
    const lang = 'id-ID'

    return (
        <html
            className={`${fontSans.variable} ${fontMono.variable}`}
            data-scroll-behavior='smooth'
            dir='ltr'
            lang={lang}
            suppressHydrationWarning
        >
            <head>
                <meta charSet='utf-8' />
                <meta content='width=device-width, initial-scale=1' name='viewport' />
            </head>
            <body className='flex min-h-full flex-col'>
                <Providers attribute='class' defaultTheme='system' disableTransitionOnChange enableSystem lang={lang}>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
