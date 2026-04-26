'use server'

import { revalidatePath } from 'next/cache'
import db from '@/lib/db'
import z, { parseFormData } from '@/lib/zod'

const departmentSchema = z.object({
    id: z.string(),
    name: z.string(),
    isMedis: z.preprocess((val) => val === 'on', z.boolean()),
    isActive: z.preprocess((val) => val === 'on', z.boolean())
})

export const upsertDepartment = async (_: any, formData: FormData) => {
    const { data, success, error } = departmentSchema.safeParse(Object.fromEntries(formData))

    if (!success) {
        return {
            department: parseFormData(formData),
            success: false,
            error: z.flattenError(error).fieldErrors
        }
    }

    try {
        await db.department.upsert({
            where: {
                id: data.id
            },
            update: data,
            create: data
        })
        revalidatePath('/departments')
        return {
            success: true,
            message: 'Unit berhasil diperbarui'
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        }
    }
}
