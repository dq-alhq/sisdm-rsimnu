import type { Metadata } from 'next'
import { IconPersonAdd } from '@intentui/icons'
import { Suspense } from 'react'
import Heading from '@/components/heading'
import { Paginator } from '@/components/paginator'
import { Search } from '@/components/search'
import { buttonStyles } from '@/components/ui/button-style'
import { Link } from '@/components/ui/link'
import { getUsers } from '@/server/repositories/users.repository'
import { UsersTable } from './table'

export const metadata: Metadata = {
    title: 'Daftar Pengguna'
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const filters = await searchParams

    const q = filters?.q ?? ''
    const show = filters?.show ?? 10
    const page = filters?.page ?? 1

    return (
        <>
            <Heading description='Manage users in this applications' title='Users'>
                <Link className={buttonStyles()} href='/users/create'>
                    <IconPersonAdd />
                    Add User
                </Link>
            </Heading>
            <div>
                <Search />
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <UserList page={Number(page)} q={q} show={Number(show)} />
            </Suspense>
        </>
    )
}

export const UserList = async ({ q, show, page }: { q: string; show: number; page: number }) => {
    const { data, totalData, totalPages } = await getUsers({
        page,
        q,
        show,
        order: 'asc',
        sort: 'id'
    })

    return (
        <>
            {data && <UsersTable users={data} />}
            <Paginator totalData={totalData} totalPages={totalPages} />
        </>
    )
}
