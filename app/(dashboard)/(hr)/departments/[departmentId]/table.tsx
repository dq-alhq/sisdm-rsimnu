'use client'

import type { GetEmployeeDepartmentResult } from '@/server/repositories/employees.repository'
import { IconDotsHorizontal, IconEye } from '@intentui/icons'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuLabel } from '@/components/ui/menu'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { app } from '@/config/app'
import { formatDate, fullName } from '@/lib/utils'

export const EmployeesDepartmentTable = ({ employees }: { employees: GetEmployeeDepartmentResult['data'] }) => {
    return (
        <Table aria-label='Users' bleed className='[--gutter:var(--layout-padding)]'>
            <TableHeader>
                <TableColumn isRowHeader>Nama</TableColumn>
                <TableColumn>Posisi/Mulai Pada</TableColumn>
                <TableColumn className='w-0' />
            </TableHeader>
            <TableBody items={employees}>
                {(employee) => (
                    <TableRow id={employee.id}>
                        <TableCell>
                            <div className='users-center flex gap-2'>
                                <Avatar
                                    className='size-8'
                                    initials={employee.user.displayUsername?.charAt(0)}
                                    isSquare
                                    src={employee.user?.image ? `${app.url}/api/blob?url=${employee.user?.image}` : ''}
                                />
                                <div className='flex flex-col'>
                                    <div className='font-medium text-sm'>
                                        {fullName(employee.name, employee.prefix, employee.suffix)}
                                    </div>
                                    <span className='text-muted-fg text-xs'>{employee?.id}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className='flex flex-col'>
                                <div className='font-medium text-sm'>{employee?.departments[0].position}</div>
                                <span className='text-muted-fg text-xs'>
                                    Mulai: {formatDate(employee.departments[0].assignedAt)}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Menu>
                                <Button intent='plain' size='sq-xs'>
                                    <IconDotsHorizontal />
                                </Button>
                                <MenuContent placement='left top'>
                                    <MenuItem href={`/employees/${employee.id}`}>
                                        <IconEye />
                                        <MenuLabel>View</MenuLabel>
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
