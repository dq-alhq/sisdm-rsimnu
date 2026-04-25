'use server'

import db from '@/lib/db'

export const getCurrentEmploymentByEmployeeId = async (employeeId: string) => {
    return db.employeesOnDepartments.findFirst({
        where: {
            employeeId: employeeId,
            endAt: null
        },
        orderBy: {
            assignedAt: 'desc'
        },
        include: {
            department: true,
            employee: true
        }
    })
}
export type CurrentEmployment = Awaited<ReturnType<typeof getCurrentEmploymentByEmployeeId>>
