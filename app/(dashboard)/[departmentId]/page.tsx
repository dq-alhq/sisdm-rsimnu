import { Suspense } from 'react'
import { EmployeesDepartmentTable } from '@/app/(dashboard)/[departmentId]/table'
import Heading from '@/components/heading'
import { Paginator } from '@/components/paginator'
import { Search } from '@/components/search'
import { Skeleton } from '@/components/ui/skeleton'
import { getEmployeesDepartment } from '@/server/repositories/employees.repository'

export default async function Page({
    params,
    searchParams
}: {
    params: Promise<{ departmentId: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { departmentId } = await params
    const filters = await searchParams

    const q = filters?.q ?? ''
    const show = filters?.show ?? 10
    const page = filters?.page ?? 1

    return (
        <>
            <Heading description='List semua pegawai di Unit ini' title='Staf Unit' />
            <div>
                <Search />
            </div>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <DepartmentEmployeeList departmentId={departmentId} page={Number(page)} q={q} show={Number(show)} />
            </Suspense>
        </>
    )
}

async function DepartmentEmployeeList({
    page,
    q,
    show,
    departmentId
}: {
    page: number
    q: string
    show: number
    departmentId: string
}) {
    const { data, totalData, totalPages } = await getEmployeesDepartment({
        page,
        q,
        show,
        order: 'asc',
        sort: 'id',
        departmentId
    })

    return (
        <>
            <EmployeesDepartmentTable employees={data} />
            <Paginator totalData={totalData} totalPages={totalPages} />
        </>
    )
}
