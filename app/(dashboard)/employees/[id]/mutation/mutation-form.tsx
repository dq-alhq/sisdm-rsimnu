'use client'

import type { ListDepartmentsResult } from '@/server/repositories/department.repository'
import type { CurrentEmployment } from '@/server/repositories/department-employee.repository'
import type { GetEmployeeByIdResult } from '@/server/repositories/employees.repository'
import { IconFloppyDisk, IconRefresh } from '@intentui/icons'
import { parseDate } from '@internationalized/date'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { SearchableSelect } from '@/components/searchable-select'
import { Button } from '@/components/ui/button'
import { DatePicker, DatePickerTrigger } from '@/components/ui/date-picker'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list'
import { FieldError, Fieldset, Label, Legend } from '@/components/ui/field'
import { Input, InputGroup } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { TextField } from '@/components/ui/text-field'
import { getTodayDate } from '@/lib/date'
import { formatDate } from '@/lib/utils'
import { mutateEmployee } from '@/server/services/department-employee.service'

interface Props {
    employee: GetEmployeeByIdResult
    departments: ListDepartmentsResult
    currentEmployment?: CurrentEmployment
}

export const MutationForm = ({ employee, departments, currentEmployment }: Props) => {
    const router = useRouter()
    const [state, action, pending] = useActionState(mutateEmployee, null)

    useEffect(() => {
        if (state?.success) {
            toast.success(state?.message)
            router.push(`/employees/${employee?.id}`)
        }
    }, [state])

    const [sk, setSk] = useState<string>('')

    return (
        <>
            {currentEmployment && (
                <Fieldset className='rounded-xl border p-4'>
                    <Legend className='rounded-lg border bg-muted px-2 py-1 text-muted-fg'>Unit Saat ini</Legend>
                    <DescriptionList>
                        <DescriptionTerm>Unit</DescriptionTerm>
                        <DescriptionDetails>{currentEmployment?.department.name}</DescriptionDetails>
                        <DescriptionTerm>Posisi</DescriptionTerm>
                        <DescriptionDetails>{currentEmployment?.position}</DescriptionDetails>
                        <DescriptionTerm>Mulai</DescriptionTerm>
                        <DescriptionDetails>{formatDate(String(currentEmployment?.assignedAt))}</DescriptionDetails>
                        <DescriptionTerm>Nomor SK</DescriptionTerm>
                        <DescriptionDetails>{currentEmployment?.number}</DescriptionDetails>
                    </DescriptionList>
                </Fieldset>
            )}
            <Form action={action} className='space-y-6' validationErrors={state?.error}>
                <input name='employeeId' type='hidden' value={employee?.id} />
                <Fieldset className='rounded-xl border p-4'>
                    <Legend className='rounded-lg border bg-muted px-2 py-1 text-muted-fg'>Mutasi ke</Legend>
                    <TextField className='mt-0!' defaultValue={employee?.name} isReadOnly>
                        <Label>Nama Pegawai</Label>
                        <Input />
                    </TextField>
                    <SearchableSelect
                        defaultValue={state?.data?.departmentId || ''}
                        items={departments}
                        label='Unit'
                        name={'departmentId'}
                    />
                    <RadioGroup defaultValue={state?.data?.position || 'Staf'} name='position'>
                        <Label>Posisi</Label>
                        <div className='my-2 flex gap-3' data-slot='control'>
                            <Radio value='Staf'>Staf</Radio>
                            <Radio value='Supervisor'>Kepala</Radio>
                        </div>
                        <FieldError />
                    </RadioGroup>
                    <SearchableSelect
                        defaultValue={state?.data?.shift || ''}
                        items={[
                            { id: 'PELAYANAN', name: 'Pelayanan' },
                            { id: 'KANTOR', name: 'Kantor' },
                            { id: 'CS', name: 'CS' },
                            { id: 'SATPAM', name: 'Satpam' },
                            { id: 'POLI', name: 'Poli' },
                            { id: 'PENYELIA', name: 'Penyelia' },
                            { id: 'DAPUR', name: 'Dapur' }
                        ]}
                        label='Jenis Shift'
                        name={'shift'}
                    />
                    <DatePicker
                        defaultValue={
                            state?.data?.assignedAt ? parseDate(String(state?.data?.assignedAt)) : getTodayDate()
                        }
                        name='assignedAt'
                    >
                        <Label>Mulai</Label>
                        <DatePickerTrigger />
                        <FieldError />
                    </DatePicker>
                    <TextField name='number' onChange={setSk} value={state?.data?.number ?? sk}>
                        <Label>Nomor SK</Label>
                        <InputGroup>
                            <Input />
                            <Button
                                intent='plain'
                                onPress={() => setSk(crypto.randomUUID())}
                                size='sq-sm'
                                type='button'
                            >
                                <IconRefresh />
                            </Button>
                        </InputGroup>
                        <FieldError />
                    </TextField>
                </Fieldset>
                <Button isPending={pending} type='submit'>
                    {pending ? <Loader /> : <IconFloppyDisk />}
                    Simpan
                </Button>
            </Form>
        </>
    )
}
