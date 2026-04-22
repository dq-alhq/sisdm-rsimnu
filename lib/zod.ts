import * as z from 'zod'

z.config(z.locales.id())

export const filterSchema = z.object({
    order: z.enum(['asc', 'desc']).catch('desc').default('desc'),
    page: z.number().catch(1).default(1),
    q: z.string().catch('').default(''),
    show: z.number().catch(10).default(10),
    sort: z.string().catch('createdAt').default('createdAt')
})
export type FilterSchema = z.infer<typeof filterSchema>

export default z
