export const app = {
    name: 'SISDM-RSIMNU',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    description: 'Sistem Manajemen SDM RSI Mabarrot MWC NU Bungah',
    author: {
        username: 'dq-alhq',
        name: 'Diqi Al Haqqi',
        url: 'https://x.com/dqalhq'
    }
}

export type SiteConfig = typeof app
