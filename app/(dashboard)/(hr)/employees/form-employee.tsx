'use client'

import type { Employee } from '@/generated/client'
import { IconFloppyDisk } from '@intentui/icons'
import { parseDate } from '@internationalized/date'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ComboBox, ComboBoxContent, ComboBoxInput, ComboBoxItem } from '@/components/ui/combo-box'
import { DatePicker, DatePickerTrigger } from '@/components/ui/date-picker'
import { FieldError, Fieldset, Label, Legend } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { TextField } from '@/components/ui/text-field'
import { Textarea } from '@/components/ui/textarea'
import { getLastDayOfYear } from '@/lib/date'
import { upsertEmployee } from '@/server/services/employee.service'

export const FormEmployee = ({ data }: { data: Employee }) => {
    const router = useRouter()

    const [state, action, pending] = useActionState(upsertEmployee, null)

    const employee = state?.employee || data

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
            router.push('/employees')
        }
        if (state?.error) {
            toast.error('Terjadi kesalahan')
        }
    }, [state])

    return (
        <Form action={action} className='flex flex-col gap-6' validationErrors={state?.error}>
            <Fieldset className='rounded-xl border p-4'>
                <Legend className='rounded-lg border bg-muted px-2 py-1 text-muted-fg'>Personal</Legend>
                <div className='mt-0! flex items-end gap-2' data-slot='control'>
                    <TextField className='w-32' defaultValue={employee?.prefix || ''} name='prefix'>
                        <Label>Nama</Label>
                        <Input placeholder='Gelar Depan' />
                        <FieldError />
                    </TextField>
                    <TextField defaultValue={employee?.name || ''} name='name'>
                        <Label className='sr-only'>Nama Lengkap</Label>
                        <Input placeholder='Nama Lengkap' />
                        <FieldError />
                    </TextField>
                    <TextField className='w-44' defaultValue={employee?.suffix || ''} name='suffix'>
                        <Label className={'sr-only'}>Gelar Belakang</Label>
                        <Input placeholder='Gelar Belakang' />
                        <FieldError />
                    </TextField>
                </div>
                <RadioGroup defaultValue={employee?.gender || 'L'} name='gender'>
                    <Label>Jenis Kelamin</Label>
                    <div className='my-2 flex gap-3' data-slot='control'>
                        <Radio value='L'>Laki-laki</Radio>
                        <Radio value='P'>Perempuan</Radio>
                    </div>
                    <FieldError />
                </RadioGroup>
                <div className='grid gap-3 sm:grid-cols-2' data-slot='control'>
                    <TextField defaultValue={employee?.birthPlace || ''} name='birthPlace'>
                        <Label>Tempat Lahir</Label>
                        <Input placeholder='No. Telepon' />
                        <FieldError />
                    </TextField>
                    <DatePicker
                        defaultValue={parseDate(employee?.birthDate || getLastDayOfYear().toString())}
                        name='birthDate'
                    >
                        <Label>Tanggal Lahir</Label>
                        <DatePickerTrigger />
                        <FieldError />
                    </DatePicker>
                </div>
                <TextField defaultValue={employee?.nik || ''} maxLength={16} name='nik'>
                    <Label>NIK</Label>
                    <Input placeholder='NIK' />
                    <FieldError />
                </TextField>
                <TextField defaultValue={employee?.address || ''} name='address'>
                    <Label>Alamat</Label>
                    <Textarea placeholder='Alamat Lengkap' />
                    <FieldError />
                </TextField>
                <ComboBox allowsCustomValue defaultValue={employee?.education || ''} name='education'>
                    <Label>Pendidikan Terakhir</Label>
                    <ComboBoxInput placeholder='Pilih atau Isi' />
                    <ComboBoxContent
                        items={['SD', 'SMP', 'SMA', 'D3', 'D4', 'S1', 'S2', 'S3'].map((i) => ({ id: i, name: i }))}
                    >
                        {(item) => (
                            <ComboBoxItem id={item.id} textValue={item.name}>
                                {item.name}
                            </ComboBoxItem>
                        )}
                    </ComboBoxContent>
                    <FieldError />
                </ComboBox>
                <div className='grid gap-3 sm:grid-cols-2' data-slot='control'>
                    <TextField defaultValue={employee?.phone || ''} name='phone'>
                        <Label>No. Telepon</Label>
                        <Input placeholder='No. Telepon' />
                        <FieldError />
                    </TextField>
                    <TextField defaultValue={employee?.email || ''} name='email'>
                        <Label>Email</Label>
                        <Input placeholder='Email' />
                        <FieldError />
                    </TextField>
                </div>
            </Fieldset>
            <Fieldset className='rounded-xl border p-4'>
                <Legend className='rounded-lg border bg-muted px-2 py-1 text-muted-fg'>Kepegawaian</Legend>
                <TextField className='mt-0!' defaultValue={employee?.id || ''} maxLength={8} name='id'>
                    <Label>NIP (username login)</Label>
                    <Input placeholder='NIP' />
                    <FieldError />
                </TextField>
                <DatePicker
                    defaultValue={parseDate(employee?.joinDate || getLastDayOfYear().toString())}
                    name='joinDate'
                >
                    <Label>Mulai Kerja</Label>
                    <DatePickerTrigger />
                    <FieldError />
                </DatePicker>
                <RadioGroup defaultValue={employee?.status || 'active'} name='status'>
                    <Label>Status Pegawai</Label>
                    <div className='my-2 flex gap-3' data-slot='control'>
                        <Radio value='active'>Tetap</Radio>
                        <Radio value='probation'>Percobaan</Radio>
                        <Radio value='inactive'>Nonaktif</Radio>
                        <Radio value='resigned'>Resign</Radio>
                    </div>
                    <FieldError />
                </RadioGroup>
            </Fieldset>
            <Fieldset className='rounded-xl border p-4'>
                <Legend className='rounded-lg border bg-muted px-2 py-1 text-muted-fg'>Legalitas</Legend>
                <TextField className='mt-0!' defaultValue={employee?.npwp || ''} name='npwp'>
                    <Label>NPWP</Label>
                    <Input placeholder='NPWP' />
                    <FieldError />
                </TextField>
                <TextField defaultValue={employee?.bpjsKes || ''} name='bpjsKes'>
                    <Label>No. BPJS Kesehatan</Label>
                    <Input placeholder='BPJS Kesehatan' />
                    <FieldError />
                </TextField>
                <TextField defaultValue={employee?.bpjsTk || ''} name='bpjsTk'>
                    <Label>No. BPJS Ketenagakerjaan</Label>
                    <Input placeholder='BPJS Ketenagakerjaan' />
                    <FieldError />
                </TextField>
                <TextField defaultValue={employee?.str || ''} name='str'>
                    <Label>No. STR</Label>
                    <Input placeholder='STR' />
                    <FieldError />
                </TextField>
                <TextField defaultValue={employee?.sip || ''} name='sip'>
                    <Label>No. SIP</Label>
                    <Input placeholder='SIP' />
                    <FieldError />
                </TextField>
                <div className='grid gap-3 sm:grid-cols-2' data-slot='control'>
                    <DatePicker
                        defaultValue={parseDate(employee?.sipStart || getLastDayOfYear().toString())}
                        name='sipStart'
                    >
                        <Label>Terbit SIP</Label>
                        <DatePickerTrigger />
                        <FieldError />
                    </DatePicker>
                    <DatePicker
                        defaultValue={parseDate(employee?.sipEnd || getLastDayOfYear().toString())}
                        name='sipEnd'
                    >
                        <Label>Berakhir SIP</Label>
                        <DatePickerTrigger />
                        <FieldError />
                    </DatePicker>
                </div>
            </Fieldset>
            <Button isPending={pending} type='submit'>
                {pending ? <Loader /> : <IconFloppyDisk />}
                Simpan
            </Button>
        </Form>
    )
}
