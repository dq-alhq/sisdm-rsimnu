'use server'

import { revalidatePath } from 'next/cache'
import { app } from '@/config/app'
import db from '@/lib/db'
import z from '@/lib/zod'

const documentSchema = z.object({
    employeeId: z.string(),
    name: z.string().min(1),
    file: z.file(),
    url: z.string()
})

export const upsertDocument = async (_: any, formData: FormData) => {
    const { data, success, error } = documentSchema.safeParse(Object.fromEntries(formData))
    if (!success) {
        return { success: false, error: z.flattenError(error).fieldErrors }
    }

    try {
        const old = await db.employeeDocument.findUnique({
            where: {
                employeeId_name: {
                    employeeId: data.employeeId,
                    name: data.name
                }
            }
        })
        if (old && old.url !== data.url) {
            await fetch(`${app.url}/api/blob`, {
                method: 'DELETE',
                body: JSON.stringify({ url: old.url, method: 'DELETE' })
            })
        }

        if (data.file) {
            const fileData = new FormData()
            fileData.append('file', data?.file)
            const res = await fetch(`${app.url}/api/blob`, {
                method: 'POST',
                body: fileData
            })
            if (!res.ok) throw new Error('File gagal diupload')
            const uploaded = await res.json()
            data.url = uploaded.url
        }

        await db.employeeDocument.upsert({
            where: {
                employeeId_name: {
                    employeeId: data.employeeId,
                    name: data.name
                }
            },
            update: {
                url: data.url,
                name: data.name
            },
            create: {
                name: data.name,
                employeeId: data.employeeId,
                url: data.url!
            }
        })
        revalidatePath(`/employees/${data.employeeId}`)
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
        if (document.url) {
            const res = await fetch(`${app.url}/api/blob`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: document.url })
            })

            if (!res.ok) {
                throw new Error(`Failed to delete blob: ${document.url}`)
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
                if (document?.url) {
                    const res = await fetch(`${app.url}/api/blob`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: document.url })
                    })

                    if (!res.ok) {
                        throw new Error(`Failed to delete blob: ${document.url}`)
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
