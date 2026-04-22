import Link from 'next/link'
import { AppLogo } from '@/components/app-logo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from './login-form'

export default async function Page() {
    return (
        <div className='flex min-h-[90vh] w-full items-center justify-center p-6 md:min-h-svh md:p-10'>
            <div className='flex w-full max-w-sm flex-col items-center justify-center gap-6'>
                <Link className='text-center' href='/'>
                    <AppLogo className='h-20' />
                </Link>
                <Card className='w-full'>
                    <CardHeader>
                        <CardTitle>Masuk akun anda</CardTitle>
                        <CardDescription>Masukkan username atau email anda untuk masuk akun anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
