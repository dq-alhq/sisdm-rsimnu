import { IconPersonAdd } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import Heading from '@/components/heading'
import { Paginator } from '@/components/paginator'
import { Search } from '@/components/search'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'
import { getEmployees } from '@/server/repositories/employees.repository'
import { EmployeesTable } from './table'

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const filters = await searchParams

    const q = filters?.q ?? ''
    const show = filters?.show ?? 10
    const page = filters?.page ?? 1

    return (
        <>
            <Heading description='List semua pegawai' title='Pegawai'>
                <Link className={buttonStyles()} href='/employees/create'>
                    <IconPersonAdd />
                    Tambah Pegawai
                </Link>
            </Heading>
            <div>
                <Search />
            </div>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <EmployeesList page={Number(page)} q={q} show={Number(show)} />
            </Suspense>
        </>
    )
}

const EmployeesList = async ({ q, show, page }: { q: string; show: number; page: number }) => {
    const { data, totalData, totalPages } = await getEmployees({
        page,
        q,
        show,
        order: 'asc',
        sort: 'id'
    })

    return (
        <>
            <EmployeesTable employees={data} />
            <Paginator totalData={totalData} totalPages={totalPages} />
        </>
    )
}
