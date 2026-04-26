'use client'

import type { ShiftPattern } from '@/generated/client'
import type { GetScheduleResponse } from '@/server/repositories/schedule.repository'
import { FilterRangeDate } from '@/components/filter-range-date'
import { getBadge } from '@/components/ui/badge'
import { Label } from '@/components/ui/field'
import { SearchField, SearchInput } from '@/components/ui/search-field'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { cn, formatMonthYear, fullName } from '@/lib/utils'

export const JadwalTable = (props: GetScheduleResponse) => {
    const { schedules, currentEmployee, shiftPatterns, allEmployeesInDepartment, shiftSettingsMap } = props
    return (
        <div className='space-y-4'>
            <div className='grid grid-cols-1 items-start gap-4 lg:grid-cols-2'>
                <SearchField>
                    <Label>Cari</Label>
                    <SearchInput />
                </SearchField>
                <FilterRangeDate />
            </div>
            <div className='overflow-hidden rounded-lg border shadow-sm'>
                <Table aria-label='Jadwal' bleed className='w-full'>
                    <TableHeader>
                        <TableColumn className={'sticky left-0 z-1 bg-bg text-center **:pl-3'} id='group' isRowHeader>
                            Grup
                        </TableColumn>
                        <TableColumn className={'sticky left-16 z-1 bg-bg'} id='name'>
                            Nama
                        </TableColumn>
                        {shiftPatterns.map((pattern, i) => (
                            <TableColumn className='text-center' id={i} key={i}>
                                {formatMonthYear(pattern.date)}
                            </TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {allEmployeesInDepartment
                            .filter((e) => e.group)
                            .map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className={'sticky left-0 z-1 bg-bg *:justify-center **:pl-4'}>
                                        {employee.group || '-'}
                                    </TableCell>
                                    <TableCell
                                        className={cn(
                                            'sticky left-16 z-1 bg-bg',
                                            currentEmployee?.id === employee.id ? 'text-primary' : ''
                                        )}
                                        textValue={fullName(employee.name, employee.prefix, employee.suffix)}
                                    >
                                        {fullName(employee.name, employee.prefix, employee.suffix)}
                                    </TableCell>
                                    {shiftPatterns.map((pattern) => {
                                        const key = employee.group as keyof ShiftPattern
                                        const shift = pattern[key]
                                        const schedule = schedules.find(
                                            (s) => s.employeeId === employee.id && s.date === pattern.date
                                        )
                                        const value =
                                            schedule?.shiftCode && shiftSettingsMap
                                                ? shiftSettingsMap[schedule.shiftCode as keyof typeof shiftSettingsMap]
                                                : shift
                                        return (
                                            <TableCell className='text-center *:justify-center' key={pattern.date}>
                                                {getBadge(value)}
                                            </TableCell>
                                        )
                                    })}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
