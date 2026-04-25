import type { RangeValue } from 'react-aria-components'
import { type CalendarDate, parseDate } from '@internationalized/date'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { DateRangePicker, DateRangePickerTrigger } from '@/components/ui/date-range-picker'
import { FieldError, Label } from '@/components/ui/field'
import { useDebounceCallback } from '@/hooks/use-debounce'
import { get25thDayOfNextMonth, get26thDayOfMonth } from '@/lib/date'

export const FilterRangeDate = () => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
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

    const value = {
        start: searchParams.get('start') ? parseDate(String(searchParams.get('start'))) : get26thDayOfMonth(),
        end: searchParams.get('end') ? parseDate(String(searchParams.get('end'))) : get25thDayOfNextMonth()
    }

    return (
        <DateRangePicker
            defaultValue={value}
            onChange={handleQuery}
            validate={(values) => {
                if (values.start > values.end) {
                    return 'Tanggal akhir harus lebih besar dari tanggal awal'
                }
            }}
        >
            <Label>Tanggal</Label>
            <DateRangePickerTrigger />
            <FieldError />
        </DateRangePicker>
    )
}
