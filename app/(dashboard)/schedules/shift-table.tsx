'use client'
import type { ShiftPattern } from '@/generated/client'
import type { GetShiftPattern } from '@/server/repositories/shift.repository'
import { FilterRangeDate } from '@/components/filter-range-date'
import { getBadge } from '@/components/ui/badge'
import { Note } from '@/components/ui/note'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'

export const ShiftTable = ({ data }: { data: GetShiftPattern }) => {
    const { data: shifts, error } = data
    return (
        <>
            <div>
                <FilterRangeDate />
            </div>
            {error && <Note intent='danger'>{error}</Note>}
            {shifts && shifts.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableColumn className={'sticky left-0 z-1 bg-bg text-center **:pl-3'} id='group' isRowHeader>
                            Grup
                        </TableColumn>
                        {shifts.map((shift) => (
                            <TableColumn key={shift.date}>{shift.date}</TableColumn>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {Object.keys(shifts[0])
                            .filter((key) => key !== 'date')
                            .map((group) => (
                                <TableRow key={group}>
                                    <TableCell className={'sticky left-0 z-1 bg-bg *:justify-center **:pl-4'}>
                                        {group}
                                    </TableCell>
                                    {shifts.map((shift) => (
                                        <TableCell className='text-center *:justify-center' key={shift.date}>
                                            {getBadge(shift[group as keyof ShiftPattern])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            )}
        </>
    )
}
