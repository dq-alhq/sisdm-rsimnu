'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useId } from 'react'
import { useDebounceCallback } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { SearchField, SearchInput } from './ui/search-field'

export function Search({ className }: { className?: string }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const handleSearch = useDebounceCallback((term) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.delete('page')
            params.set('q', term)
        } else {
            params.delete('q')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const id = useId()

    return (
        <SearchField
            aria-label='Cari'
            className={cn('relative w-full max-w-56', className)}
            defaultValue={searchParams.get('q')?.toString()}
            id={id}
            onChange={handleSearch}
        >
            <SearchInput placeholder='Cari...' />
        </SearchField>
    )
}
