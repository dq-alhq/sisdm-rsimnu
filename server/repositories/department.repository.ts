'use server'

import type { FilterSchema } from '@/lib/zod'
import db from '@/lib/db'
import { toObject } from '@/lib/utils'

export const getDepartments = async (props: FilterSchema) => {
    const { order, page, q, show, sort } = props
    const data = await db.department.findMany({
        where: {
            OR: [{ name: { contains: q, mode: 'insensitive' } }, { id: { contains: q, mode: 'insensitive' } }]
        },
        take: show,
        skip: (page - 1) * show,
        orderBy: toObject(sort, order),
        select: {
            id: true,
            isMedis: true,
            name: true,
            _count: { select: { employees: true } },
            employees: {
                where: {
                    position: {
                        contains: 'ka',
                        mode: 'insensitive'
                    }
                },
                select: { employee: { select: { id: true, name: true } } }
            }
        }
    })
    const totalData = await db.department.count({
        where: {
            OR: [{ name: { contains: q, mode: 'insensitive' } }, { id: { contains: q, mode: 'insensitive' } }]
        }
    })

    const totalPages = Math.ceil(totalData / show)

    return {
        data,
        totalData,
        totalPages
    }
}

export type GetDepartmentsResult = Awaited<ReturnType<typeof getDepartments>>

export const getDepartmentById = async (id: string) => {
    return db.department.findUnique({ where: { id } })
}

export const listDepartments = async () => {
    return db.department.findMany({
        select: {
            id: true,
            name: true
        }
    })
}
export type ListDepartmentsResult = Awaited<ReturnType<typeof listDepartments>>
