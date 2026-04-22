'use client'

import type { User } from '@/generated/client'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { TextField } from '@/components/ui/text-field'
import { createUser, updateUser } from '@/server/services/auth.service'

export function UserForm({ user }: { user?: User }) {
    const router = useRouter()
    const [{ errors, success }, action, isPending] = useActionState(user ? updateUser : createUser, { errors: {} })
    useEffect(() => {
        if (success) {
            toast.success(user ? 'User updated successfully' : 'User created successfully')
            router.back()
        }
    }, [success])
    return (
        <Form action={action} validationErrors={errors}>
            <FieldGroup>
                {user && <input defaultValue={user?.id} name='userId' type='hidden' />}
                <TextField autoComplete='name' defaultValue={user?.name} isRequired name='name'>
                    <Label>Name</Label>
                    <Input placeholder='Name' />
                    <FieldError />
                </TextField>
                <TextField autoComplete='username' defaultValue={user?.username ?? ''} name='username'>
                    <Label>Username</Label>
                    <Input placeholder='Username' />
                    <FieldError />
                </TextField>
                <TextField autoComplete='email' defaultValue={user?.email} isRequired name='email'>
                    <Label>Email</Label>
                    <Input placeholder='Email' />
                    <FieldError />
                </TextField>
                {!user && (
                    <TextField autoComplete='current-password' isRequired name='password' type='password'>
                        <Label>Password</Label>
                        <Input placeholder='Password' />
                        <FieldError />
                    </TextField>
                )}
                <RadioGroup defaultValue={user?.role} name='role'>
                    <Label>Role</Label>
                    <Radio id='admin' value='admin'>
                        Admin
                    </Radio>
                    <Radio id='user' value='user'>
                        User
                    </Radio>
                </RadioGroup>
                <Button isPending={isPending} type='submit'>
                    {user ? 'Update User' : 'Create User'}
                </Button>
            </FieldGroup>
        </Form>
    )
}
