'use client'

import { IconLogin } from '@intentui/icons'
import { useActionState } from 'react'
import { Form } from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { TextField } from '@/components/ui/text-field'
import { login } from '@/server/services/auth.service'

export function LoginForm() {
    const [{ errors }, action, isPending] = useActionState(login, { errors: {} })
    return (
        <Form action={action} validationErrors={errors}>
            <FieldGroup>
                <TextField autoComplete='username' isRequired name='username'>
                    <Label>Username</Label>
                    <Input placeholder='Username' />
                    <FieldError />
                </TextField>
                <TextField autoComplete='current-password' isRequired name='password' type='password'>
                    <Label>Password</Label>
                    <Input placeholder='Password' />
                    <FieldError />
                </TextField>
                <Button isPending={isPending} type='submit'>
                    {isPending ? <Loader /> : <IconLogin />}
                    Login
                </Button>
            </FieldGroup>
        </Form>
    )
}
