import * as XLSX from 'xlsx'
import { fullName } from '@/lib/utils'

export const exportAbsensi = (data: any[]) => {
    const toMinutes = (value?: string | null) => {
        if (!value) return 0
        const [h, m] = value.split(':').map(Number)
        return (h || 0) * 60 + (m || 0)
    }

    const toDuration = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60)
        const m = totalMinutes % 60
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    }

    // =========================
    // 1. REKAP (GROUPING)
    // =========================
    const grouped = new Map()

    data.forEach((item) => {
        const id = item.employee.id

        const employeeName = fullName(item.employee.name, item.employee.prefix, item.employee.suffix)

        const departmentName = item.employee.departments[0]?.department.name ?? '-'

        const current = grouped.get(id)

        if (!current) {
            grouped.set(id, {
                employeeName,
                departmentName,
                totalLate: toMinutes(item.late),
                totalEarlyDeparture: toMinutes(item.earlyDeparture),
                totalWorkHours: toMinutes(item.totalWorkHours),
                totalWorkDays: 1
            })
        } else {
            current.totalLate += toMinutes(item.late)
            current.totalEarlyDeparture += toMinutes(item.earlyDeparture)
            current.totalWorkHours += toMinutes(item.totalWorkHours)
            current.totalWorkDays += 1
        }
    })

    const rekapData = Array.from(grouped.values()).map((item) => ({
        'Hari Kerja': item.totalWorkDays,
        Nama: item.employeeName,
        Unit: item.departmentName,
        'Total Telat': toDuration(item.totalLate),
        'Total Pulang Cepat': toDuration(item.totalEarlyDeparture),
        'Total Jam Kerja': toDuration(item.totalWorkHours)
    }))

    // =========================
    // 2. RINCIAN
    // =========================
    const rincianData = data.map((item) => ({
        Tanggal: item.date,
        Nama: fullName(item.employee.name, item.employee.prefix, item.employee.suffix),
        Unit: item.employee.departments[0]?.department.name ?? '-',
        Shift: item.shiftCode,
        'Check-in': item.checkInAt,
        'Check-out': item.checkOutAt,
        Telat: item.late,
        'Pulang Cepat': item.earlyDeparture,
        'Total Jam': item.totalWorkHours,
        Keterangan: item.note ?? `${!item.checkInAt ? 'Lupa C/in ' : ''}${!item.checkOutAt ? 'Lupa C/out' : ''}`
    }))

    // =========================
    // 3. BUILD EXCEL
    // =========================
    const wb = XLSX.utils.book_new()

    const wsRekap = XLSX.utils.json_to_sheet(rekapData)
    const wsRincian = XLSX.utils.json_to_sheet(rincianData)

    XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap')
    XLSX.utils.book_append_sheet(wb, wsRincian, 'Rincian')

    XLSX.writeFile(wb, `absensi-${new Date().toISOString()}.xlsx`)
}
