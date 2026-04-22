import type { ReactNode } from 'react'

export default function Heading({
    title,
    description,
    children
}: {
    title: string
    description: string
    children?: ReactNode
}) {
    return (
        <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
                <h1 className='font-bold text-2xl'>{title}</h1>
                <p className='text-muted-fg text-sm'>{description}</p>
            </div>
            {children}
        </div>
    )
}
