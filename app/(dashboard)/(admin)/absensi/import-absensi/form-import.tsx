'use client'

import type { RawAttendanceRow, ScheduleDraft, SchedulePreviewRow } from '@/lib/attendance'
import { IconCircleExclamation, IconDownload, IconTrash } from '@intentui/icons'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { TableLayout, Virtualizer } from 'react-aria-components'
import { toast } from 'sonner'
import { ExcelIcon } from '@/components/app-logo'
import { Autocomplete } from '@/components/ui/autocomplete'
import { Button } from '@/components/ui/button'
import { buttonStyles } from '@/components/ui/button-style'
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
import { SearchField, SearchInput } from '@/components/ui/search-field'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { excelImport } from '@/lib/excel-import'
import { strlimit } from '@/lib/utils'
import { createAttendances, previewAttendances } from '@/server/services/attendance.service'

type ImportError = {
    row: number
    errors: string[]
}

type PreviewState = {
    attendances: ScheduleDraft[]
    preview: SchedulePreviewRow[]
}

export const FormImport = () => {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState<PreviewState | null>(null)
    const [errors, setErrors] = useState<ImportError[]>([])
    const [isImporting, startImportTransition] = useTransition()
    const [isSaving, startSaveTransition] = useTransition()

    const handleImport = () => {
        if (!file) return

        startImportTransition(() => {
            void (async () => {
                const imported = await excelImport(file)

                if (!imported?.success) {
                    setResult(null)
                    setErrors((imported?.errors ?? []).filter((error): error is ImportError => error !== null))
                    toast.error('File tidak valid')
                    return
                }

                const preview = await previewAttendances(imported.data as RawAttendanceRow[])

                if (!preview.success || !preview.data) {
                    setResult(null)
                    setErrors(preview.errors ?? [])
                    toast.error('Gagal memproses data absensi')
                    return
                }

                const previewData = preview.data

                setResult({
                    attendances: previewData.attendances,
                    preview: previewData.preview
                })
                setErrors(previewData.errors)
                setFile(null)

                if (previewData.preview.length === 0) {
                    toast.error('Tidak ada data yang bisa diimport')
                    return
                }

                toast.success(`Preview berhasil dibuat (${previewData.preview.length} jadwal)`)
            })()
        })
    }

    const handleSave = () => {
        if (!result?.attendances.length) return

        startSaveTransition(() => {
            void (async () => {
                const response = await createAttendances(result.attendances)

                if (!response.success) {
                    toast.error(response.error ?? 'Gagal menyimpan data')
                    return
                }

                toast.success(response.message)
                handleDelete()
                router.refresh()
            })()
        })
    }

    const handleDelete = () => {
        setResult(null)
        setFile(null)
        setErrors([])
    }

    return (
        <>
            <div className='flex items-center justify-between gap-3'>
                <Modal>
                    <Button isPending={isImporting}>{isImporting ? <Loader /> : <IconDownload />}Import</Button>
                    <ModalContent>
                        <ModalHeader>
                            <ModalTitle>Import Data</ModalTitle>
                            <ModalDescription>Silakan upload data mentah (csv/xlsx)</ModalDescription>
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
                                    acceptedFileTypes={['application/vnd.ms-excel']}
                                    onSelect={(event) => {
                                        const files = Array.from(event ?? [])
                                        setFile(files[0] ?? null)
                                    }}
                                />
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button isDisabled={!file} isPending={isImporting} onPress={handleImport} slot='close'>
                                Import
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
                <div className='flex items-center gap-3'>
                    <Button intent='danger' isDisabled={!file && !result && errors.length === 0} onPress={handleDelete}>
                        Hapus
                    </Button>
                    <Button
                        intent='warning'
                        isDisabled={!result?.attendances.length}
                        isPending={isSaving}
                        onPress={handleSave}
                    >
                        Simpan
                    </Button>
                </div>
            </div>

            <Autocomplete>
                <div className='flex items-center justify-between gap-2'>
                    <SearchField className='w-64' slot='search'>
                        <SearchInput placeholder='Cari...' />
                    </SearchField>
                    {errors.length > 0 && (
                        <Modal>
                            <Button intent='danger' slot='trigger'>
                                <IconCircleExclamation />
                                Tampilkan Error ({errors.length})
                            </Button>
                            <ModalContent size='3xl'>
                                <ModalHeader>
                                    <ModalTitle>Error Import</ModalTitle>
                                    <ModalDescription>Baris yang gagal diimport beserta pesan error</ModalDescription>
                                </ModalHeader>
                                <Virtualizer
                                    layout={TableLayout}
                                    layoutOptions={{
                                        rowHeight: 32,
                                        headingHeight: 32,
                                        padding: 0,
                                        gap: 6
                                    }}
                                >
                                    <ModalBody>
                                        <Table aria-label='Error Import' className='h-140 **:text-xs'>
                                            <TableHeader className='sticky top-0 z-50 **:border-danger **:bg-danger **:text-danger-fg'>
                                                <TableColumn isRowHeader>Baris</TableColumn>
                                                <TableColumn>Error</TableColumn>
                                            </TableHeader>
                                            <TableBody items={errors}>
                                                {(item) => (
                                                    <TableRow id={`error-${item.row}`}>
                                                        <TableCell>{item.row}</TableCell>
                                                        <TableCell>
                                                            {item.errors.map(
                                                                (error, index) =>
                                                                    error + (index < item.errors.length - 1 ? ', ' : '')
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </ModalBody>
                                </Virtualizer>
                                <ModalFooter />
                            </ModalContent>
                        </Modal>
                    )}
                </div>
                {result?.preview && (
                    <div className='overflow-hidden rounded-lg border'>
                        <Virtualizer
                            layout={TableLayout}
                            layoutOptions={{
                                rowHeight: 32,
                                headingHeight: 40,
                                padding: 0,
                                gap: 3
                            }}
                        >
                            <Table aria-label='Hasil Import' className='h-140'>
                                <TableHeader className='sticky top-0 z-50 **:border-primary **:bg-primary **:text-primary-fg'>
                                    <TableColumn isRowHeader>NIP</TableColumn>
                                    <TableColumn id='employeeName'>Nama Pegawai</TableColumn>
                                    <TableColumn>Tanggal</TableColumn>
                                    <TableColumn>Shift</TableColumn>
                                    <TableColumn>Check In</TableColumn>
                                    <TableColumn>Check Out</TableColumn>
                                    <TableColumn>Telat</TableColumn>
                                    <TableColumn>Pulang Cepat</TableColumn>
                                    <TableColumn>Status</TableColumn>
                                    <TableColumn>Total Jam</TableColumn>
                                </TableHeader>
                                <TableBody items={result?.preview ?? []}>
                                    {(item) => (
                                        <TableRow id={`${item.employeeId}-${item.date}`}>
                                            <TableCell>{item.employeeId}</TableCell>
                                            <TableCell textValue={item.employeeName}>{item.employeeName}</TableCell>
                                            <TableCell>{item.date}</TableCell>
                                            <TableCell textValue={item.shiftLabel}>{item.shiftLabel}</TableCell>
                                            <TableCell>{item.checkInAt ?? '-'}</TableCell>
                                            <TableCell>{item.checkOutAt ?? '-'}</TableCell>
                                            <TableCell>{item.late}</TableCell>
                                            <TableCell>{item.earlyDeparture}</TableCell>
                                            <TableCell>{item.status || '-'}</TableCell>
                                            <TableCell>{item.totalWorkHours}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Virtualizer>
                    </div>
                )}
            </Autocomplete>
        </>
    )
}
