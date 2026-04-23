'use client'

import type { GetEmployeesResult } from '@/server/repositories/employees.repository'
import { IconDotsHorizontal, IconEye, IconPencilBox, IconTrash } from '@intentui/icons'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/menu'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { app } from '@/config/app'
import { authClient } from '@/lib/auth-client'
import { fullName } from '@/lib/utils'

export const EmployeesTable = ({ employees }: { employees: GetEmployeesResult['data'] }) => {
    const { data: session } = authClient.useSession()

    return (
        <Table aria-label='Users' bleed className='[--gutter:var(--layout-padding)]'>
            <TableHeader>
                <TableColumn isRowHeader>Nama</TableColumn>
                <TableColumn>Unit/Posisi</TableColumn>
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
                                <div className='font-medium text-sm'>{employee?.departments[0]?.department?.name}</div>
                                <span className='text-muted-fg text-xs'>{employee.departments[0]?.position}</span>
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
                                    <MenuItem href={`/employees/${employee.id}/edit`}>
                                        <IconPencilBox />
                                        <MenuLabel>Edit</MenuLabel>
                                    </MenuItem>
                                    <MenuSeparator />
                                    <MenuItem
                                        intent='danger'
                                        isDisabled={!session?.user.id || session?.user.id === employee.user.id}
                                        onAction={() =>
                                            toast.error('Yakin ingin menghapus data ini?', {
                                                action: {
                                                    label: 'Delete',
                                                    onClick: () => console.log(employee.id)
                                                },
                                                cancel: {
                                                    label: 'Cancel',
                                                    onClick: () => {}
                                                },
                                                duration: Infinity
                                            })
                                        }
                                    >
                                        <IconTrash />
                                        <MenuLabel>Delete</MenuLabel>
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
