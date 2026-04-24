'use server'

import type { FilterSchema } from '@/lib/zod'
import db from '@/lib/db'
import { fullName, toObject } from '@/lib/utils'

export const getEmployees = async (props: FilterSchema) => {
    const { order, page, q, show, sort } = props
    const data = await db.employee.findMany({
        where: {
            OR: [
                { user: { displayUsername: { contains: q, mode: 'insensitive' } } },
                { name: { contains: q, mode: 'insensitive' } },
                { id: { contains: q, mode: 'insensitive' } }
            ]
        },
        take: show,
        skip: (page - 1) * show,
        orderBy: toObject(sort, order),
        select: {
            id: true,
            name: true,
            prefix: true,
            suffix: true,
            status: true,
            user: {
                select: { id: true, image: true, displayUsername: true }
            },
            departments: {
                select: {
                    position: true,
                    department: {
                        select: {
                            name: true,
                            id: true
                        }
                    }
                }
            }
        }
    })
    const totalData = await db.employee.count({
        where: {
            OR: [
                { user: { displayUsername: { contains: q, mode: 'insensitive' } } },
                { name: { contains: q, mode: 'insensitive' } },
                { id: { contains: q, mode: 'insensitive' } }
            ]
        }
    })

    const totalPages = Math.ceil(totalData / show)

    return {
        data,
        totalData,
        totalPages
    }
}
export type GetEmployeesResult = Awaited<ReturnType<typeof getEmployees>>

export const getEmployeesDepartment = async (props: FilterSchema & { departmentId: string }) => {
    const { order, page, q, show, sort, departmentId } = props
    const data = await db.employee.findMany({
        where: {
            departments: {
                some: {
                    departmentId
                }
            },
            OR: [
                { user: { displayUsername: { contains: q, mode: 'insensitive' } } },
                { name: { contains: q, mode: 'insensitive' } },
                { id: { contains: q, mode: 'insensitive' } }
            ]
        },
        take: show,
        skip: (page - 1) * show,
        orderBy: toObject(sort, order),
        select: {
            id: true,
            name: true,
            prefix: true,
            suffix: true,
            status: true,
            user: {
                select: { id: true, image: true, displayUsername: true }
            },
            departments: {
                select: {
                    assignedAt: true,
                    position: true,
                    department: {
                        select: {
                            name: true,
                            id: true
                        }
                    }
                }
            }
        }
    })
    const totalData = await db.employee.count({
        where: {
            departments: {
                some: {
                    departmentId
                }
            },
            OR: [
                { user: { displayUsername: { contains: q, mode: 'insensitive' } } },
                { name: { contains: q, mode: 'insensitive' } },
                { id: { contains: q, mode: 'insensitive' } }
            ]
        }
    })

    const totalPages = Math.ceil(totalData / show)

    return {
        data,
        totalData,
        totalPages
    }
}
export type GetEmployeeDepartmentResult = Awaited<ReturnType<typeof getEmployeesDepartment>>

export const getEmployeeById = async (id: string) => {
    return db.employee.findUnique({
        where: { id },
        include: {
            user: true,
            departments: {
                include: {
                    department: true
                }
            },
            leaves: true,
            employeeDocuments: true
        }
    })
}
export type GetEmployeeByIdResult = Awaited<ReturnType<typeof getEmployeeById>>

export const getEmployeeForEdit = async (id: string) => await db.employee.findUnique({ where: { id } })

export const listEmployeesDepartment = async (departmentIds?: string[]) => {
    const data = await db.employee.findMany({
        where: departmentIds
            ? {
                  departments: {
                      some: {
                          departmentId: {
                              in: departmentIds
                          },
                          endAt: null
                      }
                  }
              }
            : {},
        select: {
            id: true,
            name: true,
            prefix: true,
            suffix: true
        }
    })

    return data.map((item) => ({
        id: item.id,
        name: fullName(item.name, item.prefix, item.suffix)
    }))
}
export type ListEmployeesDepartmentResult = Awaited<ReturnType<typeof listEmployeesDepartment>>
