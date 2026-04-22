'use client'

import { IconFloppyDisk, IconPencilBox } from '@intentui/icons'
import { useActionState, useEffect, useState } from 'react'
import { Form, type TimeValue } from 'react-aria-components'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FieldError, FieldGroup, Label } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
import { TextField } from '@/components/ui/text-field'
import { Textarea } from '@/components/ui/textarea'
import { TimeField, TimeInput } from '@/components/ui/time-field'
import {
    formatDuration,
    normalizeTime,
    parseShiftRange,
    stringToTimeValue,
    timeValueToString,
    toMinutes
} from '@/lib/date'
import { listShifts } from '@/server/repositories/shift.repository'
import { updateAttendance } from '@/server/services/attendance.service'

interface Props {
    defaultValues: {
        employeeId: string
        date: string
        shiftCode: string
        checkInAt: string
        checkOutAt: string
        late: string
        earlyDeparture: string
        totalWorkHours: string
    }
    employeeName: string
}

export const EditAbsensi = ({ defaultValues, employeeName }: Props) => {
    const [open, setOpen] = useState(false)
    const [shifts, setShifts] = useState<{ id: string; name: string }[]>([])

    const [checkInAt, setCheckinAt] = useState(normalizeTime(defaultValues.checkInAt))
    const [checkOutAt, setCheckoutAt] = useState(normalizeTime(defaultValues.checkOutAt))
    const [late, setLate] = useState(defaultValues.late)
    const [earlyDeparture, setEarlyDeparture] = useState(defaultValues.earlyDeparture)
    const [totalWorkHours, setTotalWorkHours] = useState(defaultValues.totalWorkHours)
    const [shiftCode, setShiftCode] = useState(defaultValues.shiftCode)

    const recalculateMetrics = (nextCheckInAt: string, nextCheckOutAt: string, nextShiftCode: string) => {
        const shift = parseShiftRange(nextShiftCode)
        if (!shift) {
            setLate('00:00')
            setEarlyDeparture('00:00')
            setTotalWorkHours('00:00')
            return
        }

        const checkInMinutes = nextCheckInAt ? toMinutes(nextCheckInAt) : 0
        const checkOutMinutes = nextCheckOutAt ? toMinutes(nextCheckOutAt) : 0

        const normalizedShiftEnd = shift.overnight ? shift.endMinutes + 24 * 60 : shift.endMinutes
        const normalizedCheckOut =
            shift.overnight && checkOutMinutes < shift.startMinutes ? checkOutMinutes + 24 * 60 : checkOutMinutes
        const normalizedCheckOutFromCheckIn =
            nextCheckOutAt && nextCheckInAt && checkOutMinutes < checkInMinutes
                ? checkOutMinutes + 24 * 60
                : normalizedCheckOut

        const lateMinutes = nextCheckInAt ? Math.max(0, checkInMinutes - shift.startMinutes) : 0
        const earlyDepartureMinutes = nextCheckOutAt ? Math.max(0, normalizedShiftEnd - normalizedCheckOut) : 0
        const totalWorkMinutes =
            nextCheckInAt && nextCheckOutAt ? Math.max(0, normalizedCheckOutFromCheckIn - checkInMinutes) : 0

        setLate(formatDuration(lateMinutes))
        setEarlyDeparture(formatDuration(earlyDepartureMinutes))
        setTotalWorkHours(formatDuration(totalWorkMinutes))
    }

    const onTriggerPress = async () => {
        setOpen(true)
        setCheckinAt(normalizeTime(defaultValues.checkInAt))
        setCheckoutAt(normalizeTime(defaultValues.checkOutAt))
        setLate(defaultValues.late)
        setEarlyDeparture(defaultValues.earlyDeparture)
        setTotalWorkHours(defaultValues.totalWorkHours)
        setShiftCode(defaultValues.shiftCode)
        if (shifts.length === 0) {
            const res = await listShifts()
            if (res) setShifts(res)
        }
    }

    const [state, action, pending] = useActionState(updateAttendance, null)

    const onCheckInChange = (value: TimeValue | null) => {
        const nextCheckInAt = timeValueToString(value)
        setCheckinAt(nextCheckInAt)
        recalculateMetrics(nextCheckInAt, checkOutAt, shiftCode)
    }

    const onCheckOutChange = (value: TimeValue | null) => {
        const nextCheckOutAt = timeValueToString(value)
        setCheckoutAt(nextCheckOutAt)
        recalculateMetrics(checkInAt, nextCheckOutAt, shiftCode)
    }

    useEffect(() => {
        recalculateMetrics(checkInAt, checkOutAt, shiftCode)
    }, [shiftCode])

    useEffect(() => {
        if (state?.success) {
            toast.success(state?.message ?? 'Data berhasil diperbarui')
            setOpen(false)
        }
    }, [state])

    return (
        <Modal isOpen={open} onOpenChange={setOpen}>
            <Button intent='plain' onPress={onTriggerPress} size='sq-xs'>
                <IconPencilBox />
            </Button>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Edit Absensi</ModalTitle>
                    <ModalDescription>Edit absensi untuk pegawai</ModalDescription>
                </ModalHeader>
                <Form action={action} validationErrors={state?.error}>
                    <ModalBody>
                        <FieldGroup>
                            <input name='employeeId' type='hidden' value={defaultValues.employeeId} />
                            <div className='grid grid-cols-2 gap-2' data-slot='control'>
                                <TextField isReadOnly value={employeeName}>
                                    <Label>Nama</Label>
                                    <Input />
                                </TextField>
                                <TextField isReadOnly name='date' value={defaultValues.date}>
                                    <Label>Tanggal</Label>
                                    <Input />
                                    <FieldError />
                                </TextField>
                            </div>
                            <Select
                                name='shiftCode'
                                onChange={(e) => {
                                    const nextShiftCode = String(e)
                                    setShiftCode(nextShiftCode)
                                    recalculateMetrics(checkInAt, checkOutAt, nextShiftCode)
                                }}
                                value={shiftCode}
                            >
                                <Label>Shift</Label>
                                <SelectTrigger />
                                <SelectContent items={shifts}>
                                    {(item) => <SelectItem>{item.name}</SelectItem>}
                                </SelectContent>
                            </Select>
                            <div className='grid grid-cols-2 gap-2' data-slot='control'>
                                <TimeField
                                    className='w-full'
                                    hideTimeZone
                                    hourCycle={24}
                                    name='checkInAt'
                                    onChange={onCheckInChange}
                                    shouldForceLeadingZeros
                                    value={stringToTimeValue(normalizeTime(checkInAt))}
                                >
                                    <Label>Check-in</Label>
                                    <TimeInput className='font-mono' />
                                    <FieldError />
                                </TimeField>
                                <TimeField
                                    className='w-full'
                                    hideTimeZone
                                    hourCycle={24}
                                    name='checkOutAt'
                                    onChange={onCheckOutChange}
                                    shouldForceLeadingZeros
                                    value={stringToTimeValue(normalizeTime(checkOutAt))}
                                >
                                    <Label>Check-out</Label>
                                    <TimeInput className='font-mono' />
                                    <FieldError />
                                </TimeField>
                                <TextField isReadOnly name='late' value={late}>
                                    <Label>Telat</Label>
                                    <Input className='font-mono' />
                                    <FieldError />
                                </TextField>
                                <TextField isReadOnly name='earlyDeparture' value={earlyDeparture}>
                                    <Label>Pulang Cepat</Label>
                                    <Input className='font-mono' />
                                    <FieldError />
                                </TextField>
                            </div>
                            <TextField isReadOnly name='totalWorkHours' value={totalWorkHours}>
                                <Label>Total Jam</Label>
                                <Input className='font-mono' />
                                <FieldError />
                            </TextField>
                            <TextField defaultValue='Manual' name='note'>
                                <Label>Keterangan</Label>
                                <Textarea />
                                <FieldError />
                            </TextField>
                        </FieldGroup>
                    </ModalBody>
                    <ModalFooter>
                        <Button isPending={pending} type='submit'>
                            {pending ? <Loader /> : <IconFloppyDisk />}
                            Simpan
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalContent>
        </Modal>
    )
}
