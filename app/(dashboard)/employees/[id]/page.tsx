import { IconPencilBox, IconRepeat } from '@intentui/icons'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Details } from '@/app/(dashboard)/employees/[id]/details'
import Bg from '@/app/bg.jpg'
import Heading from '@/components/heading'
import { Avatar } from '@/components/ui/avatar'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'
import { app } from '@/config/app'
import { fullName, strlimit } from '@/lib/utils'
import { getEmployeeById } from '@/server/repositories/employees.repository'
import { getPermissions } from '@/server/services/auth.service'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const permissions = await getPermissions()
    if (!permissions.admin && !permissions.hr && permissions.currentDepartment?.employeeId !== id)
        return redirect(`/employees/${permissions.currentDepartment?.employeeId}`)

    return (
        <>
            <Heading description='Data lengkap kepegawaian' title='Data Pegawai'>
                <div className='flex items-center gap-2'>
                    {(permissions.admin || permissions.hr) && (
                        <Link className={buttonStyles({ intent: 'warning' })} href={`/employees/${id}/mutation`}>
                            <IconRepeat />
                            Mutasi
                        </Link>
                    )}
                    <Link className={buttonStyles()} href={`/employees/${id}/edit`}>
                        <IconPencilBox />
                        Edit
                    </Link>
                </div>
            </Heading>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <EmployeePage id={id} />
            </Suspense>
        </>
    )
}

const EmployeePage = async ({ id }: { id: string }) => {
    const employee = await getEmployeeById(id)

    if (!employee) {
        return (
            <div className='grid gap-4 sm:grid-cols-4'>
                <Skeleton className='h-96 w-full' />
                <Skeleton className='h-96 w-full sm:col-span-3' />
            </div>
        )
    }

    return (
        <div className='grid gap-4 sm:grid-cols-4'>
            <div className='flex w-full flex-col rounded-lg border shadow-sm'>
                <Image
                    alt='Profile Cover'
                    className='aspect-video w-full rounded-lg object-cover'
                    height={405}
                    placeholder='blur'
                    src={Bg}
                    width={720}
                />
                <div className='mx-auto -mt-20 mb-3 flex w-full shrink-0 flex-col items-center gap-3'>
                    <Avatar
                        alt={employee?.name}
                        className='bg-primary ring-4 ring-white'
                        initials={employee.user.displayUsername?.charAt(0) || employee.user.name.charAt(0)}
                        isSquare
                        size='7xl'
                        src={employee.user?.image ? `${app.url}/api/blob?url=${employee.user?.image}` : ''}
                    />
                    <div className='flex flex-col items-center text-center'>
                        <p className='text-muted-fg'>{employee.id}</p>
                        <h3 className='font-semibold text-lg'>
                            {strlimit(fullName(employee.name, employee.prefix, employee.suffix), 32)}
                        </h3>
                        <p className='text-muted-fg'>{employee.user.displayUsername || employee.user.name}</p>
                    </div>
                </div>
            </div>
            <div className='flex w-full flex-col rounded-lg border shadow-sm sm:col-span-3'>
                <Details employee={employee} />
            </div>
        </div>
    )
}
