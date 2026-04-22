'use server'

import type { FilterSchema } from '@/lib/zod'
import db from '@/lib/db'
import { toObject } from '@/lib/utils'

export const getLeaveRequests = async (props: FilterSchema & { departmentId?: string }) => {
    const { departmentId, show, q, sort, order, page } = props

    const data = await db.leave.findMany({
        where: departmentId
            ? {
                  employee: {
                      name: {
                          contains: q,
                          mode: 'insensitive'
                      },
                      departments: {
                          some: {
                              departmentId,
                              endAt: null
                          }
                      }
                  }
              }
            : {
                  employee: {
                      name: {
                          contains: q,
                          mode: 'insensitive'
                      }
                  }
              },
        take: show,
        skip: (page - 1) * show,
        orderBy: toObject(sort, order),
        include: {
            replacedBy: true,
            employee: {
                include: {
                    departments: {
                        include: {
                            department: true
                        }
                    }
                }
            }
        }
    })

    const totalData = await db.leave.count({
        where: departmentId
            ? {
                  employee: {
                      name: {
                          contains: q,
                          mode: 'insensitive'
                      },
                      departments: {
                          some: {
                              departmentId,
                              endAt: null
                          }
                      }
                  }
              }
            : {
                  employee: {
                      name: {
                          contains: q,
                          mode: 'insensitive'
                      }
                  }
              }
    })
    const totalPages = Math.ceil(totalData / show)

    return {
        data,
        totalPages,
        totalData
    }
}
export type GetLeaveRequestResult = Awaited<ReturnType<typeof getLeaveRequests>>

export const getLeaveRequest = async (id: string) => {
    return db.leave.findUnique({
        where: { id },
        include: {
            employee: {
                include: {
                    departments: {
                        include: {
                            department: true
                        }
                    }
                }
            },
            replacedBy: true
        }
    })
}
export type GetLeaveRequest = Awaited<ReturnType<typeof getLeaveRequest>>
