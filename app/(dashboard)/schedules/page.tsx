import type { Metadata } from 'next'
import { IconCalendarClock } from '@intentui/icons'
import Link from 'next/link'
import { Suspense } from 'react'
import { ShiftTable } from '@/app/(dashboard)/schedules/shift-table'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/lib/date'
import { getShiftPattern } from '@/server/repositories/shift.repository'

export const metadata: Metadata = {
    title: 'Jadwal Shift'
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const filters = await searchParams
    const startDate = filters?.start ?? getFirstDayOfMonth().toString()
    const endDate = filters?.end ?? getLastDayOfMonth().toString()
    return (
        <>
            <Heading description='Kelola Shift' title='Shift'>
                <Link className={buttonStyles()} href='/schedules/create'>
                    <IconCalendarClock />
                    Import Data
                </Link>
            </Heading>
            <Suspense fallback={<Skeleton className='h-20 w-full' />}>
                <ShiftList end={endDate} start={startDate} />
            </Suspense>
        </>
    )
}

const ShiftList = async ({ start, end }: { start: string; end: string }) => {
    const data = await getShiftPattern({ start, end })
    return <ShiftTable data={data} />
}
