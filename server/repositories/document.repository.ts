'use server'

import db from '@/lib/db'

export const getDocumentsByEmployeeId = async (employeeId: string) => {
    return db.employeeDocument.findMany({
        where: {
            employeeId
        }
    })
}

export const getDocumentById = async (id: string) => {
    return db.employeeDocument.findUnique({
        where: {
            id
        }
    })
}
