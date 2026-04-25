'use client'

import type { EmployeeDocument } from '@/generated/client'
import type { ListEmployeesDepartmentResult } from '@/server/repositories/employees.repository'
import { IconFloppyDisk } from '@intentui/icons'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { SearchableSelect } from '@/components/searchable-select'
import { Button } from '@/components/ui/button'
import { ComboBox, ComboBoxContent, ComboBoxInput, ComboBoxItem } from '@/components/ui/combo-box'
import { FieldGroup, Label } from '@/components/ui/field'
import { Loader } from '@/components/ui/loader'
import { upsertDocument } from '@/server/services/document.service'

const UploadPDF = dynamic(() => import('./upload-pdf'), {
    ssr: false
})

export default function FormDocument({
    currentDocument,
    employees,
    employeeId
}: {
    currentDocument: EmployeeDocument | null
    employees: ListEmployeesDepartmentResult
    employeeId: string
}) {
    const router = useRouter()
    const [state, action, pending] = useActionState(upsertDocument, null)

    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        if (state?.success) {
            toast.success(state?.message)
            router.push(`/employees/${employeeId}`)
        }
    }, [state])

    return (
        <Form
            action={(formData) => {
                if (file) {
                    formData.append('file', file)
                }
                action(formData)
            }}
            validationErrors={state?.error}
        >
            <div className='grid gap-4 sm:grid-cols-[auto_1fr]'>
                <input name='url' type='hidden' value={currentDocument?.url} />
                <UploadPDF action={setFile} currentFile={currentDocument?.url} />
                <FieldGroup>
                    {currentDocument?.employeeId && <input name='employeeId' type='hidden' value={employeeId} />}
                    <SearchableSelect
                        defaultValue={employeeId}
                        isDisabled={!!currentDocument?.employeeId}
                        items={employees}
                        label='Milik Pegawai'
                        name={'employeeId'}
                    />
                    <ComboBox allowsCustomValue defaultValue={currentDocument?.name} name='name'>
                        <Label>Nama Dokumen</Label>
                        <ComboBoxInput placeholder='Nama Dokumen' />
                        <ComboBoxContent items={documents}>
                            {(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
                        </ComboBoxContent>
                    </ComboBox>
                    <Button className='w-full' isPending={pending} type='submit'>
                        {pending ? <Loader /> : <IconFloppyDisk />}
                        Simpan
                    </Button>
                </FieldGroup>
            </div>
        </Form>
    )
}

const documents = [
    { id: 'CV', name: 'CV' },
    { id: 'Lamaran', name: 'Lamaran' },
    { id: 'KTP', name: 'KTP' },
    { id: 'KK', name: 'KK' },
    { id: 'Ijazah', name: 'Ijazah' },
    { id: 'Transkrip', name: 'Transkrip' },
    { id: 'SK Pegawai', name: 'SK Pegawai' },
    { id: 'STR', name: 'STR' },
    { id: 'SIP', name: 'SIP' },
    { id: 'NPWP', name: 'NPWP' },
    { id: 'BPJS Kes', name: 'BPJS Kes' },
    { id: 'BPJS TK', name: 'BPJS TK' },
    { id: 'Sertifikat', name: 'Sertifikat' }
]
