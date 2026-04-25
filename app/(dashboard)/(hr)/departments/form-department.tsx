'use client'

import type { Department } from '@/generated/client'
import { IconFloppyDisk } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldError, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { TextField } from '@/components/ui/text-field'
import { upsertDepartment } from '@/server/services/department.service'

export const FormDepartment = ({ data }: { data?: Department }) => {
    const router = useRouter()

    const [state, action, pending] = useActionState(upsertDepartment, null)

    const department = state?.department || data

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
            router.push('/departments')
        }
        if (state?.error) {
            toast.error('Terjadi kesalahan')
        }
    }, [state])

    return (
        <Form action={action} className='flex flex-col gap-6' validationErrors={state?.error}>
            <TextField defaultValue={department?.id || ''} isReadOnly={!!data} name='id'>
                <Label>Kode</Label>
                <Input placeholder='Kode Unit' />
                <FieldError />
            </TextField>
            <TextField defaultValue={department?.name || ''} name='name'>
                <Label>Nama</Label>
                <Input placeholder='Nama Unit' />
                <FieldError />
            </TextField>
            <Checkbox defaultSelected={Boolean(department?.isMedis)} name='isMedis'>
                Medis
            </Checkbox>
            <Checkbox defaultSelected={Boolean(department?.isActive)} name='isActive'>
                Aktif
            </Checkbox>
            <Button isPending={pending} type='submit'>
                {pending ? <Loader /> : <IconFloppyDisk />}
                Simpan
            </Button>
        </Form>
    )
}
