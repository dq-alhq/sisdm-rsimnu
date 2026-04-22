'use client'

import { IconFloppyDisk } from '@intentui/icons'
import { useActionState, useEffect } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { TextField } from '@/components/ui/text-field'
import { authClient } from '@/lib/auth-client'
import { updatePassword } from '@/server/services/auth.service'

export default function SecurityUpdateForm() {
    const { refetch } = authClient.useSession()
    const [{ success, errors }, action, isPending] = useActionState(updatePassword, { errors: {} })

    useEffect(() => {
        if (success) {
            toast.success('Password updated successfully')
            refetch()
        }
    }, [success])

    return (
        <Form action={action} className='lg:w-1/2' validationErrors={errors}>
            <FieldGroup>
                <TextField isRequired name='currentPassword' type='password'>
                    <Label>Current Password</Label>
                    <Input placeholder='Current Password' />
                    <FieldError />
                </TextField>
                <TextField isRequired name='newPassword' type='password'>
                    <Label>New Password</Label>
                    <Input placeholder='New Password' />
                    <FieldError />
                </TextField>
                <TextField isRequired name='confirmNewPassword' type='password'>
                    <Label>Confirm New Password</Label>
                    <Input placeholder='Confirm New Password' />
                    <FieldError />
                </TextField>

                <Checkbox name='revokeOtherSession'>Revoke other session</Checkbox>

                <Button isPending={isPending} type='submit'>
                    <IconFloppyDisk />
                    Save
                </Button>
            </FieldGroup>
        </Form>
    )
}
