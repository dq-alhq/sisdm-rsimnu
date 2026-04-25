import type { RangeValue } from 'react-aria-components'
import { IconChevronLeft, IconChevronRight } from '@intentui/icons'
import { type CalendarDate, parseDate } from '@internationalized/date'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DateRangePicker, DateRangePickerTrigger } from '@/components/ui/date-range-picker'
import { FieldError, Label } from '@/components/ui/field'
import { useDebounceCallback } from '@/hooks/use-debounce'
import { get25thDayOfNextMonth, get26thDayOfMonth } from '@/lib/date'
import { formatDate } from '@/lib/utils'

export const MonthNavigation = () => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const currentStart = searchParams.get('start') || get26thDayOfMonth().toString()
    const currentEnd = searchParams.get('end') || get25thDayOfNextMonth().toString()

    const handleQuery = useDebounceCallback((newValue: RangeValue<CalendarDate> | null) => {
        if (!newValue?.start || !newValue?.end || newValue?.start > newValue?.end) return
        const params = new URLSearchParams(searchParams)
        if (newValue) {
            params.set('start', newValue.start.toDate('UTC').toISOString().slice(0, 10))
            params.set('end', newValue.end.toDate('UTC').toISOString().slice(0, 10))
        } else {
            params.delete('start')
            params.delete('end')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const handlePrevMonth = useDebounceCallback(() => {
        handleQuery({
            start: parseDate(currentStart).subtract({ months: 1 }),
            end: parseDate(currentEnd).subtract({ months: 1 })
        })
    }, 300)

    const handleNextMonth = useDebounceCallback(() => {
        handleQuery({
            start: parseDate(currentStart).add({ months: 1 }),
            end: parseDate(currentEnd).add({ months: 1 })
        })
    }, 300)

    const handlePastMonth = useDebounceCallback(() => {
        handleQuery({
            start: parseDate(get26thDayOfMonth().toString()).subtract({ months: 1 }),
            end: parseDate(get25thDayOfNextMonth().toString()).subtract({ months: 1 })
        })
    }, 300)

    const handleThisMonth = useDebounceCallback(() => {
        handleQuery({
            start: parseDate(get26thDayOfMonth().toString()),
            end: parseDate(get25thDayOfNextMonth().toString())
        })
    }, 300)

    const value = {
        start: searchParams.get('start') ? parseDate(String(searchParams.get('start'))) : get26thDayOfMonth(),
        end: searchParams.get('end') ? parseDate(String(searchParams.get('end'))) : get25thDayOfNextMonth()
    }
    return (
        <div className='flex flex-col items-end gap-4 sm:flex-row'>
            <DateRangePicker
                onChange={handleQuery}
                validate={(values) => {
                    if (values.start > values.end) {
                        return 'Tanggal akhir harus lebih besar dari tanggal awal'
                    }
                }}
                value={value}
            >
                <Label>Tanggal</Label>
                <DateRangePickerTrigger />
                <FieldError />
            </DateRangePicker>
            <div className='flex w-full flex-col gap-2 sm:w-fit sm:items-center'>
                <Label>
                    {formatDate(currentStart)} - {formatDate(currentEnd)}
                </Label>
                <ButtonGroup className='w-full sm:w-fit'>
                    <Button intent='outline' onPress={handlePrevMonth}>
                        <IconChevronLeft />
                    </Button>
                    <Button className='w-full whitespace-nowrap sm:w-fit' intent='outline' onPress={handlePastMonth}>
                        Bulan Lalu
                    </Button>
                    <Button className='w-full whitespace-nowrap sm:w-fit' intent='outline' onPress={handleThisMonth}>
                        Bulan Ini
                    </Button>
                    <Button intent='outline' onPress={handleNextMonth}>
                        <IconChevronRight />
                    </Button>
                </ButtonGroup>
            </div>
        </div>
    )
}
