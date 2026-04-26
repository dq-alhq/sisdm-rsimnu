'use client'
import type { AbsensiData } from '@/server/repositories/absensi.repository'
import type { ListDepartmentsResult } from '@/server/repositories/department.repository'
import type { ListEmployeesDepartmentResult } from '@/server/repositories/employees.repository'
import type { GetPermissionResult } from '@/server/services/auth.service'
import { IconEye } from '@intentui/icons'
import { useMemo } from 'react'
import { ExcelIcon } from '@/components/app-logo'
import { FilterPegawai } from '@/components/filter-pegawai'
import { FilterUnit } from '@/components/filter-unit'
import { MonthNavigation } from '@/components/month-navigation'
import { Autocomplete } from '@/components/ui/autocomplete'
import { Button } from '@/components/ui/button'
import { Disclosure, DisclosurePanel } from '@/components/ui/disclosure-group'
import { Label } from '@/components/ui/field'
import { SearchField, SearchInput } from '@/components/ui/search-field'
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from '@/components/ui/table'
import { exportAbsensi } from '@/lib/export-absensi'
import { fullName } from '@/lib/utils'
import { EditAbsensi } from './edit-absensi'

interface Props {
    permissions: GetPermissionResult
    departments: ListDepartmentsResult
    employees: ListEmployeesDepartmentResult
    absensiData: AbsensiData
}

export const AbsensiTable = ({ absensiData, departments, employees, permissions }: Props) => {
    const rekapan = useMemo(() => {
        const toMinutes = (value?: string | null) => {
            if (!value) return 0
            const [hours, minutes] = value.split(':').map(Number)
            if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0
            return hours * 60 + minutes
        }

        const toDuration = (totalMinutes: number) => {
            const hours = Math.floor(totalMinutes / 60)
            const minutes = totalMinutes % 60
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }

        const grouped = new Map<
            string,
            {
                employeeName: string
                departmentName: string
                totalLate: number
                totalEarlyDeparture: number
                totalWorkHours: number
                totalWorkDays: number
            }
        >()

        absensiData?.forEach((item) => {
            const employeeId = item.employee.id
            const employeeName = fullName(item.employee.name, item.employee.prefix, item.employee.suffix)
            const departmentName = item.employee.departments[0]?.department.name ?? '-'
            const current = grouped.get(employeeId)

            if (!current) {
                grouped.set(employeeId, {
                    employeeName,
                    departmentName,
                    totalLate: toMinutes(item.late),
                    totalEarlyDeparture: toMinutes(item.earlyDeparture),
                    totalWorkHours: toMinutes(item.totalWorkHours),
                    totalWorkDays: 1
                })
                return
            }

            current.totalLate += toMinutes(item.late)
            current.totalEarlyDeparture += toMinutes(item.earlyDeparture)
            current.totalWorkHours += toMinutes(item.totalWorkHours)
            current.totalWorkDays += 1
        })

        return Array.from(grouped.entries()).map(([employeeId, item]) => ({
            id: employeeId,
            employeeName: item.employeeName,
            departmentName: item.departmentName,
            totalLate: toDuration(item.totalLate),
            totalEarlyDeparture: toDuration(item.totalEarlyDeparture),
            totalWorkHours: toDuration(item.totalWorkHours),
            totalWorkDays: item.totalWorkDays
        }))
    }, [absensiData])

    const handleExport = () => {
        if (absensiData) {
            exportAbsensi(absensiData)
        }
    }

    return (
        absensiData && (
            <Autocomplete>
                <MonthNavigation />
                <div className='grid grid-cols-1 items-end gap-4 lg:grid-cols-4'>
                    <SearchField>
                        <Label>Cari</Label>
                        <SearchInput placeholder='Cari...' />
                    </SearchField>
                    {(permissions?.hr || permissions.admin || permissions.supervisor.length > 0) && (
                        <>
                            <FilterUnit
                                defaultValue={permissions?.currentDepartment?.departmentId}
                                departments={departments}
                                isDisabled={!permissions.admin && !permissions.hr}
                            />
                            <FilterPegawai
                                defaultValue={permissions?.currentDepartment?.employeeId}
                                employees={employees}
                            />
                        </>
                    )}
                    <Button onPress={handleExport}>
                        <ExcelIcon />
                        Export
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableColumn isRowHeader>Hari Kerja</TableColumn>
                        <TableColumn id='name'>Nama</TableColumn>
                        <TableColumn>Unit</TableColumn>
                        <TableColumn>Total Telat</TableColumn>
                        <TableColumn>Total Pulang Cepat</TableColumn>
                        <TableColumn>Total Jam Kerja</TableColumn>
                    </TableHeader>
                    <TableBody items={rekapan}>
                        {(item) => (
                            <TableRow id={item.id}>
                                <TableCell>{item.totalWorkDays}</TableCell>
                                <TableCell textValue={item.employeeName}>{item.employeeName}</TableCell>
                                <TableCell>{item.departmentName}</TableCell>
                                <TableCell>{item.totalLate}</TableCell>
                                <TableCell>{item.totalEarlyDeparture}</TableCell>
                                <TableCell>{item.totalWorkHours}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                <Disclosure>
                    <Button className='w-full' slot='trigger'>
                        <IconEye />
                        Rincian
                    </Button>
                    <DisclosurePanel>
                        <Table>
                            <TableHeader>
                                <TableColumn isRowHeader>Tanggal</TableColumn>
                                <TableColumn id='name'>Nama</TableColumn>
                                <TableColumn>Unit</TableColumn>
                                <TableColumn>Shift</TableColumn>
                                <TableColumn>Check-in</TableColumn>
                                <TableColumn>Check-out</TableColumn>
                                <TableColumn>Telat</TableColumn>
                                <TableColumn>Pulang Cepat</TableColumn>
                                <TableColumn>Total Jam</TableColumn>
                                <TableColumn>Keterangan</TableColumn>
                                <TableColumn />
                            </TableHeader>
                            <TableBody items={absensiData}>
                                {(item) => (
                                    <TableRow id={`${item.employee.id}_${item.date}`}>
                                        <TableCell>{item.date}</TableCell>
                                        <TableCell
                                            textValue={fullName(
                                                item.employee.name,
                                                item.employee.prefix,
                                                item.employee.suffix
                                            )}
                                        >
                                            {fullName(item.employee.name, item.employee.prefix, item.employee.suffix)}
                                        </TableCell>
                                        <TableCell>{item.employee.departments[0]?.department.name}</TableCell>
                                        <TableCell>{item.shiftCode}</TableCell>
                                        <TableCell>{item.checkInAt}</TableCell>
                                        <TableCell>{item.checkOutAt}</TableCell>
                                        <TableCell>{item.late}</TableCell>
                                        <TableCell>{item.earlyDeparture}</TableCell>
                                        <TableCell>{item.totalWorkHours}</TableCell>
                                        <TableCell>
                                            {item.note ?? (
                                                <>
                                                    {!item.checkInAt && 'Lupa C/in'}
                                                    {!item.checkOutAt && 'Lupa C/out'}
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {permissions.admin && (
                                                <EditAbsensi
                                                    defaultValues={{
                                                        checkInAt: item.checkInAt!,
                                                        checkOutAt: item.checkOutAt!,
                                                        date: item.date,
                                                        earlyDeparture: item.earlyDeparture!,
                                                        employeeId: item.employee.id,
                                                        late: item.late!,
                                                        shiftCode: item.shiftCode,
                                                        totalWorkHours: item.totalWorkHours!
                                                    }}
                                                    employeeName={item.employee.name}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </DisclosurePanel>
                </Disclosure>
            </Autocomplete>
        )
    )
}
