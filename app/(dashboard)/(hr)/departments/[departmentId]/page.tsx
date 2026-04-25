import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { EmployeesDepartmentTable } from '@/app/(dashboard)/(hr)/departments/[departmentId]/table'
import Heading from '@/components/heading'
import { Paginator } from '@/components/paginator'
import { Search } from '@/components/search'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'
import { getDepartmentById } from '@/server/repositories/department.repository'
import { getEmployeesDepartment } from '@/server/repositories/employees.repository'

export const generateMetadata = async ({ params }: { params: Promise<{ departmentId: string }> }) => {
    const { departmentId } = await params
    const department = await getDepartmentById(departmentId)
    return {
        title: department?.name || 'Unit'
    }
}

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
            <Heading description='List semua pegawai di Unit ini' title='Staf Unit'>
                <Link className={buttonStyles({ intent: 'outline' })} href='/departments'>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
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
