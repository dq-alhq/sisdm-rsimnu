'use client'

import type { GetEmployeeByUserIdResult } from '@/server/services/auth.service'
import { IconClipboard } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CardContent, CardFooter } from '@/components/ui/card'
import { DatePicker, DatePickerTrigger } from '@/components/ui/date-picker'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { TextField } from '@/components/ui/text-field'
import { Textarea } from '@/components/ui/textarea'
import { fullName } from '@/lib/utils'
import { createLeaveRequest } from '@/server/services/leave.service'

export const FormLeaveRequest = ({ employee }: { employee: GetEmployeeByUserIdResult }) => {
    const [state, action, pending] = useActionState(createLeaveRequest, null)
    const router = useRouter()
    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
            router.push('/leave-requests')
        }
    }, [state])
    if (!employee) return <div>Data tidak ditemukan</div>
    return (
        <Form action={action} validationErrors={state?.error}>
            <CardContent>
                <FieldGroup>
                    <input name={'employeeId'} type={'hidden'} value={employee.id} />
                    <TextField isReadOnly value={fullName(employee.name, employee.prefix, employee.suffix)}>
                        <Label>Nama</Label>
                        <Input />
                        <FieldError />
                    </TextField>
                    <RadioGroup isRequired name='leaveType'>
                        <Label>Tipe Cuti</Label>
                        <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-center'>
                            <Radio value='annual'>Cuti Tahunan</Radio>
                            <Radio value='sick'>Sakit</Radio>
                            <Radio value='maternity'>Maternal</Radio>
                            <Radio value='other'>Lainnya</Radio>
                        </div>
                        <FieldError />
                    </RadioGroup>
                    <TextField isRequired name='reason'>
                        <Label>Alasan</Label>
                        <Textarea />
                        <FieldError />
                    </TextField>
                    <div className='grid grid-cols-2 gap-2'>
                        <DatePicker isRequired name='startDate'>
                            <Label>Mulai</Label>
                            <DatePickerTrigger />
                            <FieldError />
                        </DatePicker>
                        <DatePicker isRequired name='endDate'>
                            <Label>Sampai</Label>
                            <DatePickerTrigger />
                            <FieldError />
                        </DatePicker>
                    </div>
                    <Button isPending={pending} type='submit'>
                        {pending ? <Loader /> : <IconClipboard />}
                        Ajukan
                    </Button>
                </FieldGroup>
            </CardContent>
            <CardFooter />
        </Form>
    )
}
