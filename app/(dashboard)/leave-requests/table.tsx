'use client'

import type { GetLeaveRequestResult } from '@/server/repositories/leave.repository'
import { IconDotsHorizontal, IconPencilBox } from '@intentui/icons'
import { getApprovalStatus, getJenisCuti } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuLabel } from '@/components/ui/menu'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/utils'

export const LeaveRequestTable = ({ data }: { data: GetLeaveRequestResult['data'] }) => {
    return (
        <Table aria-label='Users' bleed className='[--gutter:var(--layout-padding)]'>
            <TableHeader>
                <TableColumn isRowHeader>Nama/Unit</TableColumn>
                <TableColumn>Jenis Cuti</TableColumn>
                <TableColumn>Mulai</TableColumn>
                <TableColumn>Sampai</TableColumn>
                <TableColumn>Status</TableColumn>
                <TableColumn>Pengganti</TableColumn>
                <TableColumn className='w-0' />
            </TableHeader>
            <TableBody items={data}>
                {(leave) => (
                    <TableRow id={leave.id}>
                        <TableCell>
                            <div className='flex flex-col'>
                                <div className='font-medium text-sm'>{leave.employee.name}</div>
                                <span className='text-muted-fg text-xs'>
                                    {leave.employee.departments[0].department.name}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>{getJenisCuti(leave.leaveType)}</TableCell>
                        <TableCell>{formatDate(leave.startDate)}</TableCell>
                        <TableCell>{formatDate(leave.endDate)}</TableCell>
                        <TableCell>{getApprovalStatus(leave.status)}</TableCell>
                        <TableCell>{leave.replacedBy?.name ?? 'Belum ada'}</TableCell>
                        <TableCell>
                            <Menu>
                                <Button intent='plain' size='sq-xs'>
                                    <IconDotsHorizontal />
                                </Button>
                                <MenuContent placement='left top'>
                                    <MenuItem href={`/leave-requests/approve?id=${leave.id}`}>
                                        <IconPencilBox />
                                        <MenuLabel>Setujui / Tolak</MenuLabel>
                                    </MenuItem>
                                </MenuContent>
                            </Menu>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
