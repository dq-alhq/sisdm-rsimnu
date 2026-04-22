'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useId } from 'react'
import { useDebounceCallback } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select'

export function PerPage({ className }: { className?: string }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const handlePerPage = useDebounceCallback((term) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.delete('page')
            params.set('show', term)
        } else {
            params.delete('show')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const id = useId()

    return (
        <Select
            aria-label='Tampilkan'
            className={cn('sm:max-w-16', className)}
            defaultValue={searchParams.get('show')?.toString()}
            id={id}
            onChange={handlePerPage}
            placeholder='10'
        >
            <SelectTrigger />
            <SelectContent items={['10', '20', '50', '100'].map((p) => ({ id: p, label: p }))}>
                {(page) => <SelectItem>{page.label}</SelectItem>}
            </SelectContent>
        </Select>
    )
}
