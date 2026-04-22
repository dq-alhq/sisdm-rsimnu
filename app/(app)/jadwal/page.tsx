import { headers } from 'next/headers'
import Link from 'next/link'
import { Suspense } from 'react'
import Heading from '@/components/heading'
import { Autocomplete } from '@/components/ui/autocomplete'
import { buttonStyles } from '@/components/ui/button-style'
import { Skeleton } from '@/components/ui/skeleton'
import { auth } from '@/lib/auth'
import { type GetScheduleResponse, getSchedules } from '@/server/repositories/schedule.repository'
import { JadwalTable } from './jadwal-table'

type searchParamsProps = {
    q: string
    start: string
    end: string
}

type Props = {
    searchParams: Promise<searchParamsProps>
}

export default async function Jadwal(props: Props) {
    const { q, start, end } = await props.searchParams
    return (
        <div className='space-y-4'>
            <Heading
                description='Menampilkan jadwal shift karyawan berdasarkan filter tanggal dan grup.'
                title='Jadwal Shift'
            >
                <Link className={buttonStyles()} href='/jadwal/export'>
                    Export
                </Link>
            </Heading>
            <Autocomplete>
                <Suspense fallback={<Skeleton className='m-2 h-7 w-full' />}>
                    <SchedulesTable end={end} q={q} start={start} />
                </Suspense>
            </Autocomplete>
        </div>
    )
}

async function SchedulesTable({ q, start, end }: searchParamsProps) {
    const session = await auth.api.getSession({ headers: await headers() })
    const res: GetScheduleResponse = await getSchedules({
        q,
        start,
        end,
        userId: session?.user?.id || ''
    })
    return <JadwalTable {...res} />
}
