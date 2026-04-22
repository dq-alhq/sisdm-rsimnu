import type { Metadata } from 'next'
import { IconPencilBox } from '@intentui/icons'
import { headers } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { buttonStyles } from '@/components/ui/button-style'
import { Card, CardContent } from '@/components/ui/card'
import { app } from '@/config/app'
import { auth, type User } from '@/lib/auth'
import { getUserById } from '@/server/services/auth.service'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const user = await getUserById(id)
    return {
        title: user?.name || 'User'
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserDetails id={id} />
        </Suspense>
    )
}

export const UserDetails = async ({ id }: { id: string }) => {
    const user: User = await auth.api.getUser({
        query: {
            id
        },
        headers: await headers()
    })

    return (
        <>
            <Card className='relative'>
                <CardContent>
                    <div>
                        <Link
                            className={buttonStyles({
                                className: 'absolute top-4 right-4',
                                size: 'sm',
                                intent: 'outline'
                            })}
                            href={`/users/${id}/edit`}
                        >
                            <IconPencilBox />
                            Edit
                        </Link>
                    </div>
                    <div className='flex flex-col items-center gap-3 lg:flex-row'>
                        <Avatar
                            className='[--avatar-size:--spacing(20)] lg:[--avatar-size:--spacing(14)]'
                            initials={user.displayUsername?.charAt(0)}
                            isSquare
                            src={user?.image ? `${app.url}/api/blob?url=${user?.image}` : ''}
                        />
                        <div className='flex flex-col items-center lg:items-start'>
                            <h1 className='font-semibold text-lg text-primary'>{user.name}</h1>
                            <p className='text-muted-foreground text-sm'>{user.role}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className='grid grid-cols-1 gap-3'>
                        <div>
                            <h3 className='text-muted-foreground text-sm'>Email</h3>
                            <p>{user?.email}</p>
                        </div>
                        <div>
                            <h3 className='text-muted-foreground text-sm'>Username</h3>
                            <p>{user?.username ?? <Badge intent='secondary'>Not Set</Badge>}</p>
                        </div>
                        <div>
                            <h3 className='text-muted-foreground text-sm'>Role</h3>
                            <p>{user?.role ?? '-'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
