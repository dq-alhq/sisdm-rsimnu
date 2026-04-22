'use client'

import { IconFloppyDisk } from '@intentui/icons'
import { useActionState, useEffect } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { FileUpload } from '@/components/file-upload'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { TextField } from '@/components/ui/text-field'
import { app } from '@/config/app'
import { authClient } from '@/lib/auth-client'
import { updateProfile } from '@/server/services/auth.service'

export default function ProfileUpdateForm() {
    const { refetch, data, isPending: loading } = authClient.useSession()
    const [{ success, errors }, action, isPending] = useActionState(updateProfile, { errors: {} })

    useEffect(() => {
        if (success) {
            toast.success('Profile updated successfully')
            void refetch()
        }
    }, [success])

    return loading ? (
        <div className='grid gap-4 lg:w-1/2'>
            <Skeleton className='h-5 w-full' />
            <Skeleton className='h-7.5 w-full' />
            <Skeleton className='h-5 w-full' />
            <Skeleton className='h-7.5 w-full' />
            <Skeleton className='h-7.5 w-full' />
        </div>
    ) : (
        <Form action={action} className='grid gap-4 lg:grid-cols-[auto_1fr]' validationErrors={errors}>
            <div className='aspect-square'>
                <FileUpload
                    defaultValue={data?.user?.image ? `${app.url}/api/blob?url=${data?.user?.image}` : ''}
                    name='avatar'
                />
            </div>
            <FieldGroup>
                <TextField defaultValue={data?.user?.name} isRequired name='name'>
                    <Label>Name</Label>
                    <Input placeholder='Full Name' />
                    <FieldError />
                </TextField>
                <TextField defaultValue={data?.user?.username ?? ''} isRequired name='username'>
                    <Label>Username</Label>
                    <Input placeholder='Username' />
                    <FieldError />
                </TextField>
                <TextField defaultValue={data?.user?.email} isRequired name='email' type='email'>
                    <Label>Email</Label>
                    <Input placeholder='email@example.com' />
                    <FieldError />
                </TextField>

                <Button isPending={isPending} type='submit'>
                    <IconFloppyDisk />
                    Save
                </Button>
            </FieldGroup>
        </Form>
    )
}
