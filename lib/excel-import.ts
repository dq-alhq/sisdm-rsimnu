import * as XLSX from 'xlsx'
import z from '@/lib/zod'

const rowSchema = z.object({
    'AC-No.': z.any(),
    'No.': z.string().optional(),
    Name: z.string().min(1, 'Name wajib diisi'),
    Time: z
        .string()
        .min(1, 'Time wajib diisi')
        .refine((val) => /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(val), 'Format Time harus dd/MM/yyyy HH:mm'),
    State: z.enum(['C/In', 'C/Out'], {
        message: 'State harus C/In atau C/Out'
    }),
    'New State': z.string().optional(),
    Exception: z.string().optional(),
    Operation: z.string().optional()
})

const ALLOWED_HEADERS = ['AC-No.', 'No.', 'Name', 'Time', 'State', 'New State', 'Exception', 'Operation']

const filterAllowedHeaders = (row: any) => {
    return Object.fromEntries(Object.entries(row).filter(([key]) => ALLOWED_HEADERS.includes(key)))
}

const normalizeRow = (row: any) => {
    // if (typeof row.Time === 'number') {
    row.Time = XLSX.SSF.format('dd/mm/yyyy hh:mm', row.Time)
    // }

    return row
}
export const excelImport = async (file: File) => {
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
