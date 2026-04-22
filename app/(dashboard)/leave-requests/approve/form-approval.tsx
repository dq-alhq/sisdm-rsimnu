'use client'

import type { GetLeaveRequest } from '@/server/repositories/leave.repository'
import { IconCircleCheck, IconCircleX } from '@intentui/icons'
import { useActionState, useEffect, useRef } from 'react'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { SearchableSelect } from '@/components/searchable-select'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Loader } from '@/components/ui/loader'
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle
} from '@/components/ui/modal'
import { TextField } from '@/components/ui/text-field'
import { Textarea } from '@/components/ui/textarea'
import { approveLeaveRequest, rejectLeaveRequest } from '@/server/services/leave.service'

interface Props {
    items: { id: string; name: string }[]
    leave: GetLeaveRequest
}

export const FormApproval = ({ items, leave }: Props) => {
    const [state, action, pending] = useActionState(approveLeaveRequest, null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
            closeButtonRef.current?.click()
        }
    }, [state])
    if (!leave) return null
    return (
        <Modal>
            <Button isDisabled={leave.status === 'hrApproved'}>Setujui</Button>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Setujui Permohonan Cuti</ModalTitle>
                    <ModalDescription>Silakan pilih pengganti jika cuti disetujui</ModalDescription>
                </ModalHeader>
                <Form action={action} validationErrors={state?.error}>
                    <ModalBody>
                        <FieldGroup>
                            <input name={'id'} type={'hidden'} value={leave.id} />
                            <SearchableSelect
                                defaultValue={leave.replacedById ?? ''}
                                items={items}
                                label='Pengganti'
                                name={'replacedById'}
                            />
                        </FieldGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button intent='outline' ref={closeButtonRef} slot='close' type='button'>
                            Batal
                        </Button>
                        <Button isPending={pending} type='submit'>
                            {pending ? <Loader /> : <IconCircleCheck />}
                            Setujui
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalContent>
        </Modal>
    )
}

export const FormRejection = ({ leave }: { leave: GetLeaveRequest }) => {
    const [state, action, pending] = useActionState(rejectLeaveRequest, null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)
    useEffect(() => {
        if (state?.success) {
            toast.success(state.message)
            closeButtonRef.current?.click()
        }
    }, [state])
    if (!leave) return null
    return (
        <Modal>
            <Button intent='danger' isDisabled={leave.status === 'rejected' || leave.status === 'hrApproved'}>
                Tolak
            </Button>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Tolak Permohonan Cuti</ModalTitle>
                    <ModalDescription>Harap isi alasan penolakan permohonan cuti</ModalDescription>
                </ModalHeader>
                <Form action={action} validationErrors={state?.error}>
                    <ModalBody>
                        <FieldGroup>
                            <input name={'id'} type={'hidden'} value={leave.id} />
                            <TextField name='reason'>
                                <Label>Alasan</Label>
                                <Textarea />
                                <FieldError />
                            </TextField>
                        </FieldGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button intent='outline' ref={closeButtonRef} slot='close' type='button'>
                            Batal
                        </Button>
                        <Button intent='danger' isPending={pending} type='submit'>
                            {pending ? <Loader /> : <IconCircleX />}
                            Tolak
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalContent>
        </Modal>
    )
}
