'use client'
import type { ShiftPattern } from '@/generated/client'
import { IconCalendarClock, IconDownload, IconFloppyDisk, IconTrash } from '@intentui/icons'
import { useState, useTransition } from 'react'
import { Form, TableLayout, Virtualizer } from 'react-aria-components'
import { toast } from 'sonner'
import { ExcelIcon } from '@/components/app-logo'
import { Badge, getBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonStyles } from '@/components/ui/button-style'
import { DatePicker, DatePickerTrigger } from '@/components/ui/date-picker'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { FileTrigger } from '@/components/ui/file-trigger'
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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { getTodayDate } from '@/lib/date'
import { importShift } from '@/lib/import-shift'
import { strlimit } from '@/lib/utils'
import { createShift } from '@/server/services/shift.service'

const shiftOptions = [
    { id: 'P', label: 'Pagi' },
    { id: 'S', label: 'Siang' },
    { id: 'M', label: 'Malam' },
    { id: 'OFF', label: 'Off' }
]

export const ShiftForm = () => {
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [file, setFile] = useState<File | null>(null)
    const [shifts, setShift] = useState<
        {
            A: string
            B: string
            C: string
            D: string
            date: string
        }[]
    >([])

    const [importing, startImportTransition] = useTransition()
    const [isSaving, startSavingTransition] = useTransition()
    const [openImportModal, setOpenImportModal] = useState(false)

    const add = (formData: FormData) => {
        const data = Object.fromEntries(formData.entries()) as {
            A: string
            B: string
            C: string
            D: string
            date: string
        }

        const values = [data.A, data.B, data.C, data.D]
        const keys = ['A', 'B', 'C', 'D']

        const count: Record<string, number> = {}
        values.forEach((v) => {
            count[v] = (count[v] || 0) + 1
        })

        const newErrors: Record<string, string> = {}

        values.forEach((v, i) => {
            if (count[v] > 1) {
                newErrors[keys[i]] = 'Tidak boleh sama'
            }
        })

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        } else {
            setShift((prev) => [...prev, data])
        }
    }

    const processFileExcel = async () => {
        if (!file) return

        startImportTransition(() => {
            void (async () => {
                const imported = await importShift(file)

                if (!imported?.success) {
                    setShift([])
                    toast.error('File tidak valid')
                    return
                }

                if (imported.data) {
                    setShift(imported.data ?? [])
                    setFile(null)
                    setOpenImportModal(false)

                    toast.success(`Preview (${imported?.data.length} shift)`)
                }
            })()
        })
    }

    const handleSave = () => {
        startSavingTransition(() => {
            void (async () => {
                const res = await createShift(shifts)
                if (res.success) {
                    toast.success(res.message)
                    setShift([])
                    setFile(null)
                    setErrors({})
                } else {
                    toast.error(res.error)
                }
            })()
        })
    }

    return (
        <>
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center gap-2'>
                    <Modal>
                        <Button>
                            <IconCalendarClock />
                            Tambah
                        </Button>
                        <ModalContent>
                            <ModalHeader>
                                <ModalTitle>Tambah Shift</ModalTitle>
                                <ModalDescription>Isi sesuai dengan format</ModalDescription>
                            </ModalHeader>
                            <Form action={add} validationErrors={errors}>
                                <ModalBody>
                                    <FieldGroup>
                                        <DatePicker defaultValue={getTodayDate()} name='date'>
                                            <Label>Tanggal</Label>
                                            <DatePickerTrigger />
                                            <FieldError />
                                        </DatePicker>
                                        <div className='grid grid-cols-2 gap-3' data-slot='control'>
                                            <Select name='A'>
                                                <Label>A</Label>
                                                <SelectTrigger />
                                                <FieldError />
                                                <SelectContent items={shiftOptions}>
                                                    {(item) => <SelectItem>{item.label}</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                            <Select name='B'>
                                                <Label>B</Label>
                                                <SelectTrigger />
                                                <FieldError />
                                                <SelectContent items={shiftOptions}>
                                                    {(item) => <SelectItem>{item.label}</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                            <Select name='C'>
                                                <Label>C</Label>
                                                <SelectTrigger />
                                                <FieldError />
                                                <SelectContent items={shiftOptions}>
                                                    {(item) => <SelectItem>{item.label}</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                            <Select name='D'>
                                                <Label>D</Label>
                                                <SelectTrigger />
                                                <FieldError />
                                                <SelectContent items={shiftOptions}>
                                                    {(item) => <SelectItem>{item.label}</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </FieldGroup>
                                </ModalBody>
                                <ModalFooter>
                                    <Button type='submit'>Tambahkan</Button>
                                </ModalFooter>
                            </Form>
                        </ModalContent>
                    </Modal>
                    <Modal isOpen={openImportModal} onOpenChange={setOpenImportModal}>
                        <Button>
                            <IconDownload />
                            Import
                        </Button>
                        <ModalContent>
                            <ModalHeader>
                                <ModalTitle>Import Shift</ModalTitle>
                                <ModalDescription>Import shift dari file excel</ModalDescription>
                            </ModalHeader>
                            <ModalBody>
                                {file ? (
                                    <div className='flex items-center gap-2'>
                                        <div className={buttonStyles({ intent: 'success', className: 'w-full' })}>
                                            <ExcelIcon className='size-6' />
                                            {strlimit(file.name, 15)}
                                        </div>
                                        <Button intent='danger' onPress={() => setFile(null)} size='sq-sm'>
                                            <IconTrash />
                                        </Button>
                                    </div>
                                ) : (
                                    <FileTrigger
                                        acceptedFileTypes={[
                                            'application/vnd.ms-excel',
                                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                        ]}
                                        onSelect={(event) => {
                                            const files = Array.from(event ?? [])
                                            setFile(files[0] ?? null)
                                        }}
                                    />
                                )}
                            </ModalBody>
                            <ModalFooter>
                                <Button isPending={importing} onPress={processFileExcel}>
                                    {importing && <Loader />}Import
                                </Button>
                            </ModalFooter>
                        </ModalContent>
                    </Modal>
                </div>
                <div className='flex items-center gap-3'>
                    <Button
                        intent='danger'
                        isDisabled={!file && !shifts.length}
                        onPress={() => {
                            setFile(null)
                            setShift([])
                        }}
                    >
                        Hapus
                    </Button>
                    <Button intent='warning' isDisabled={!shifts.length} isPending={isSaving} onPress={handleSave}>
                        {isSaving ? <Loader /> : <IconFloppyDisk />}
                        Simpan
                    </Button>
                </div>
            </div>
            {shifts.length > 0 && (
                <Virtualizer
                    layout={TableLayout}
                    layoutOptions={{
                        rowHeight: 32,
                        headingHeight: 40,
                        padding: 0,
                        gap: 3
                    }}
                >
                    <Table aria-label='Shift'>
                        <TableHeader className='sticky top-0 z-50'>
                            <TableColumn className={'text-center **:pl-3'} id='group' isRowHeader>
                                Grup
                            </TableColumn>
                            {shifts.map((shift) => (
                                <TableColumn className='text-center' key={shift.date}>
                                    <Badge>{shift.date}</Badge>
                                </TableColumn>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {shifts.length > 0 &&
                                Object.keys(shifts[0])
                                    .filter((key) => key !== 'date')
                                    .map((group) => (
                                        <TableRow key={group}>
                                            <TableCell className={'sticky left-0 z-1 bg-bg *:justify-center **:pl-4'}>
                                                {group}
                                            </TableCell>
                                            {shifts.map((shift) => (
                                                <TableCell className='text-center *:justify-center' key={shift.date}>
                                                    {getBadge(shift[group as keyof ShiftPattern])}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                        </TableBody>
                    </Table>
                </Virtualizer>
            )}
        </>
    )
}
