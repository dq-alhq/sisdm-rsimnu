'use client'

import type { User } from '@/generated/client'
import { IconBriefcase, IconDotsHorizontal, IconEye, IconPencilBox, IconTrash } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Menu, MenuContent, MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/menu'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { app } from '@/config/app'
import { authClient } from '@/lib/auth-client'

export const UsersTable = ({ users }: { users: User[] }) => {
    const { refresh } = useRouter()
    const { data: session } = authClient.useSession()
    const removeUser = (userId: string) =>
        authClient.admin
            .removeUser({
                userId
            })
            .then(() => toast.success('User deleted successfully!'))
            .finally(refresh)

    const assignRole = (userId: string, role: 'admin' | 'user') =>
        authClient.admin
            .setRole({
                userId,
                role
            })
            .then(() => toast.success('Role set successfully!'))
            .finally(refresh)

    return (
        <Table aria-label='Users' bleed className='[--gutter:var(--layout-padding)]'>
            <TableHeader>
                <TableColumn className='w-10' isRowHeader>
                    #
                </TableColumn>
                <TableColumn>Nama</TableColumn>
                <TableColumn>Akses</TableColumn>
                <TableColumn className='w-0' />
            </TableHeader>
            <TableBody>
                {users.map((user, i) => (
                    <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>
                            <div className='users-center flex gap-2'>
                                <Avatar
                                    className='size-8'
                                    initials={user.displayUsername?.charAt(0)}
                                    isSquare
                                    src={user?.image ? `${app.url}/api/blob?url=${user?.image}` : ''}
                                />
                                <div className='flex flex-col'>
                                    <div className='font-medium text-sm'>{user?.displayUsername}</div>
                                    <span className='text-muted-foreground text-xs'>{user?.name}</span>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className='flex flex-col'>
                                <div className='font-medium text-sm'>{user?.username}</div>
                                <span className='text-muted-foreground text-xs'>{user?.role}</span>
                            </div>
                        </TableCell>
                        <TableCell>
                            <Menu>
                                <Button intent='plain' size='sq-xs'>
                                    <IconDotsHorizontal />
                                </Button>
                                <MenuContent placement='left top'>
                                    <MenuItem href={`/users/${user.id}`}>
                                        <IconEye />
                                        <MenuLabel>View</MenuLabel>
                                    </MenuItem>
                                    <MenuItem href={`/users/${user.id}/edit`}>
                                        <IconPencilBox />
                                        <MenuLabel>Edit</MenuLabel>
                                    </MenuItem>
                                    <MenuSeparator />
                                    <MenuItem
                                        isDisabled={!session?.user.id || session?.user.id === user.id}
                                        onAction={() => assignRole(user?.id, user.role === 'admin' ? 'user' : 'admin')}
                                    >
                                        <IconBriefcase />
                                        <MenuLabel>Set Role: {user.role === 'admin' ? 'User' : 'Admin'}</MenuLabel>
                                    </MenuItem>
                                    <MenuSeparator />
                                    <MenuItem
                                        intent='danger'
                                        isDisabled={!session?.user.id || session?.user.id === user.id}
                                        onAction={() =>
                                            toast.error("Are you sure wan't to delete this user?", {
                                                action: {
                                                    label: 'Delete',
                                                    onClick: () => removeUser(user.id)
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
                ))}
            </TableBody>
        </Table>
    )
}
