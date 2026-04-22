'use server'

import type { FilterSchema } from '@/lib/zod'
import db from '@/lib/db'
import { toObject } from '@/lib/utils'

export const getUsers = async (props: FilterSchema) => {
    const { q, order, page, show, sort } = props
    const data = await db.user.findMany({
        where: {
            OR: [
                {
                    name: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },
                {
                    id: {
                        contains: q,
                        mode: 'insensitive'
                    }
                }
            ]
        },
        take: show,
        skip: (page - 1) * show,
        orderBy: toObject(sort, order)
    })
    const totalData = await db.user.count({
        where: {
            OR: [
                {
                    name: {
                        contains: q,
                        mode: 'insensitive'
                    }
                },
                {
                    id: {
                        contains: q,
                        mode: 'insensitive'
                    }
                }
            ]
        }
    })

    const totalPages = Math.ceil(totalData / show)
    return { data, totalData, totalPages }
}
