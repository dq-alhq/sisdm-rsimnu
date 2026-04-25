import { Suspense } from 'react'
import { AbsensiEmployeeTable } from '@/app/(app)/rekap-absensi/absensi-table'
import { Autocomplete } from '@/components/ui/autocomplete'
import { Skeleton } from '@/components/ui/skeleton'
import { get25thDayOfNextMonth, get26thDayOfMonth } from '@/lib/date'
import { getAbsensi } from '@/server/repositories/absensi.repository'
import { getEmployeeByUserId } from '@/server/services/auth.service'

type searchParamsProps = {
    start: string
    end: string
}

type Props = {
    searchParams: Promise<searchParamsProps>
}

export default async function Absensi(props: Props) {
    const searchParams = await props.searchParams
    const startDate = searchParams.start || get26thDayOfMonth().toString()
    const endDate = searchParams.end || get25thDayOfNextMonth().toString()
    return (
        <div className='space-y-4'>
            <Autocomplete>
                <Suspense fallback={<Skeleton className='m-2 h-7 w-full' />}>
                    <AbsensiTable end={endDate} start={startDate} />
                </Suspense>
            </Autocomplete>
        </div>
    )
}

async function AbsensiTable({ start, end }: searchParamsProps) {
    const employee = await getEmployeeByUserId()
    if (!employee) {
        return null
    }
    const absensiData = await getAbsensi({
        startDate: start,
        endDate: end,
        employeeIds: [employee.id]
    })
    return <AbsensiEmployeeTable data={absensiData} />
}
