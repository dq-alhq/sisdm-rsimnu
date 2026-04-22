'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PerPage } from './per-page'
import {
    Pagination,
    PaginationFirst,
    PaginationLabel,
    PaginationLast,
    PaginationList,
    PaginationNext,
    PaginationPrevious,
    PaginationSection
} from './ui/pagination'

interface Props {
    className?: string
    totalData: number
    totalPages: number
}

export function Paginator({ className, totalData, totalPages }: Props) {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentPage = Number(searchParams.get('page')) || 1

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams)
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    return (
        <div
            className={cn('flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-between', className)}
        >
            <div className='flex w-fit items-center justify-center gap-2 whitespace-nowrap font-medium text-muted-fg text-sm'>
                <PerPage />
                Total {totalData} data
            </div>
            <div className='ml-auto flex w-full items-center gap-2 sm:w-fit lg:ml-0'>
                <Pagination>
                    <PaginationList>
                        <PaginationFirst href={createPageURL(1)} isDisabled={currentPage <= 1} />
                        <PaginationPrevious href={createPageURL(currentPage - 1)} isDisabled={currentPage <= 1} />
                        <PaginationSection className='rounded-(--section-radius) border px-3 *:min-w-4'>
                            <PaginationLabel>{currentPage}</PaginationLabel>
                            <PaginationLabel className='text-muted-fg'>/</PaginationLabel>
                            <PaginationLabel>{totalPages}</PaginationLabel>
                        </PaginationSection>
                        <PaginationNext href={createPageURL(currentPage + 1)} isDisabled={currentPage >= totalPages} />
                        <PaginationLast href={createPageURL(totalPages)} isDisabled={currentPage >= totalPages} />
                    </PaginationList>
                </Pagination>
            </div>
        </div>
    )
}
