'use server'

import { getTodayDate } from '@/lib/date'
import db from '@/lib/db'
import z, { parseFormData } from '@/lib/zod'
import { getDepartmentSupervisor } from '@/server/repositories/department.repository'

const departmentEmployeeSchema = z.object({
    employeeId: z.string(),
    departmentId: z.string(),
    position: z.string(),
    file: z.string().optional(),
    number: z.string(),
    shift: z.string(),
    assignedAt: z.string()
})

export const mutateEmployee = async (_: any, formData: FormData) => {
    const { data, success, error } = departmentEmployeeSchema.safeParse(Object.fromEntries(formData))
    if (!success) {
        return {
            success: false,
            data: parseFormData(formData),
            error: z.flattenError(error).fieldErrors
        }
    }

    const currentEmployment = await db.employeesOnDepartments.findFirst({
        where: {
            employeeId: data.employeeId,
            endAt: null
        },
        orderBy: {
            assignedAt: 'desc'
        }
    })

    const supervisor = await getDepartmentSupervisor(data?.departmentId)
    if (supervisor) {
        return {
            success: false,
            data: parseFormData(formData),
            error: {
                departmentId: 'Sudah ada kepala unit ini',
                position: 'Sudah ada kepala unit ini'
            }
        }
    }

    try {
        await db.$transaction(async (tx) => {
            if (currentEmployment) {
                await tx.employeesOnDepartments.update({
                    where: {
                        departmentId_employeeId_number: {
                            departmentId: currentEmployment.departmentId,
                            employeeId: currentEmployment.employeeId,
                            number: currentEmployment.number
                        }
                    },
                    data: {
                        endAt: getTodayDate().toString()
                    }
                })
            }
            await tx.employeesOnDepartments.create({
                data: { ...data, endAt: null }
            })
        })

        return {
            success: true,
            message: 'Mutasi berhasil'
        }
    } catch (error: any) {
        return {
            success: false,
            error: error?.message
        }
    }
}
