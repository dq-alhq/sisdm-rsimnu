import * as XLSX from 'xlsx'
import z from '@/lib/zod'

const rowSchema = z.object({
    date: z.string().min(1, 'Date wajib diisi'),
    A: z.enum(['P', 'S', 'M', 'OFF']),
    B: z.enum(['P', 'S', 'M', 'OFF']),
    C: z.enum(['P', 'S', 'M', 'OFF']),
    D: z.enum(['P', 'S', 'M', 'OFF'])
})

const ALLOWED_HEADERS = ['date', 'A', 'B', 'C', 'D']

const filterAllowedHeaders = (row: any) => {
    return Object.fromEntries(Object.entries(row).filter(([key]) => ALLOWED_HEADERS.includes(key)))
}

const normalizeRow = (row: any) => {
    row.date = XLSX.SSF.format('yyyy-mm-dd', row.date)
    return row
}

export const importShift = async (file: File) => {
    if (!file) return

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
    const cleanedData = rawData.map((row) => {
        const noEmptyHeader = filterAllowedHeaders(row)
        return normalizeRow(noEmptyHeader)
    })

    const results = cleanedData.map((row, index) => {
        const normalized = normalizeRow(row)

        const parsed = rowSchema.safeParse(normalized)

        if (!parsed.success) {
            return {
                row: index + 2, // +2 karena header + index mulai 0
                errors: parsed.error.issues.map((e) => e.message)
            }
        }

        return null
    })

    const errors = results.filter(Boolean)

    if (errors.length) {
        return {
            success: false,
            errors
        }
    }

    return {
        success: true,
        data: cleanedData
    }
}
