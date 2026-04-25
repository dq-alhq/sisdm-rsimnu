'use server'

import { app } from '@/config/app'
import db from '@/lib/db'
import z from '@/lib/zod'

const documentSchema = z.object({
    employeeId: z.string(),
    documentType: z.string(),
    documentUrl: z.string(),
    documentName: z.string()
})

export const upsertDocument = async (props: z.infer<typeof documentSchema>) => {
    const { data, success, error } = await documentSchema.safeParseAsync(props)
    if (!success) {
        return { success: false, error: z.flattenError(error).fieldErrors }
    }

    try {
        const old = await db.employeeDocument.findUnique({
            where: {
                employeeId_documentType: {
                    employeeId: data.employeeId,
                    documentType: data.documentType
                }
            }
        })
        if (old && old.documentUrl !== data.documentUrl) {
            await fetch(`${app.url}/api/blob`, {
                method: 'DELETE',
                body: JSON.stringify({ url: old.documentUrl, method: 'DELETE' })
            })
        }
        await db.employeeDocument.upsert({
            where: {
                employeeId_documentType: {
                    employeeId: data.employeeId,
                    documentType: data.documentType
                }
            },
            update: {
                documentUrl: data.documentUrl,
                documentName: data.documentName
            },
            create: data
        })
        return { success: true, message: 'File berhasil diupdate' }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export const deleteDocument = async (id: string) => {
    const document = await db.employeeDocument.findUnique({
        where: { id }
    })
    if (!document) {
        return { success: false, error: 'Document not found' }
    }
    try {
        if (document.documentUrl) {
            const res = await fetch(`${app.url}/api/blob`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: document.documentUrl })
            })

            if (!res.ok) {
                throw new Error(`Failed to delete blob: ${document.documentUrl}`)
            }
        }
        await db.employeeDocument.delete({ where: { id } })
        return {
            success: true,
            message: 'Document deleted'
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}

export const deleteDocumentByEmployeeId = async (employeeId: string) => {
    try {
        const documents = await db.employeeDocument.findMany({
            where: { employeeId }
        })
        if (documents.length === 0) {
            return {
                success: true,
                message: 'No documents to delete'
            }
        }

        await Promise.all(
            documents.map(async (document) => {
                if (document?.documentUrl) {
                    const res = await fetch(`${app.url}/api/blob`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: document.documentUrl })
                    })

                    if (!res.ok) {
                        throw new Error(`Failed to delete blob: ${document.documentUrl}`)
                    }
                }
            })
        )

        await db.employeeDocument.deleteMany({
            where: { employeeId }
        })

        return {
            success: true,
            message: 'Documents deleted'
        }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
