'use client'

import type { GetDepartmentsResult } from '@/server/repositories/department.repository'
import { IconDotsHorizontal, IconEye, IconPencilBox, IconTrash } from '@intentui/icons'
import Link from 'next/link'
import { toast } from 'sonner'
import { badgeStyles } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/menu'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'

export const DepartmentsTable = ({ departments }: { departments: GetDepartmentsResult['data'] }) => {
    return (
        <Table aria-label='Users' bleed className='[--gutter:var(--layout-padding)]'>
            <TableHeader>
                <TableColumn isRowHeader>Nama</TableColumn>
                <TableColumn>Kepala</TableColumn>
                <TableColumn>Jumlah Pegawai</TableColumn>
                <TableColumn className='w-0' />
            </TableHeader>
            <TableBody items={departments}>
                {(department) => (
                    <TableRow id={department.id}>
                        <TableCell>
                            <div className='flex flex-col'>
                                <div className='font-medium text-sm'>{department.name}</div>
                                <span className='text-muted-fg text-xs'>
                                    {department.isMedis ? 'Medis' : 'Non-Medis'}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell>
                            {department.employees.length > 0 ? (
                                <Link
                                    className={badgeStyles()}
                                    href={`/hr/employees/${department.employees[0].employee.id}`}
                                >
                                    {department.employees[0].employee.name}
                                </Link>
                            ) : (
                                'Belum ditunjuk'
                            )}
                        </TableCell>
                        <TableCell>{department._count.employees} Pegawai</TableCell>
                        <TableCell>
                            <Menu>
                                <Button intent='plain' size='sq-xs'>
                                    <IconDotsHorizontal />
                                </Button>
                                <MenuContent placement='left top'>
                                    <MenuItem href={`/departments/${department.id}`}>
                                        <IconEye />
                                        <MenuLabel>View</MenuLabel>
                                    </MenuItem>
                                    <MenuItem href={`/departments/${department.id}/edit`}>
                                        <IconPencilBox />
                                        <MenuLabel>Edit</MenuLabel>
                                    </MenuItem>
                                    <MenuSeparator />
                                    <MenuItem
                                        intent='danger'
                                        onAction={() =>
                                            toast.error('Yakin ingin menghapus data ini?', {
                                                action: {
                                                    label: 'Delete',
                                                    onClick: () => toast.error('Oh, Tidak bisa')
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
