import type { ListDepartmentsResult } from '@/server/repositories/department.repository'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchableSelect } from '@/components/searchable-select'
import { useDebounceCallback } from '@/hooks/use-debounce'

export const FilterUnit = ({
    departments,
    defaultValue
}: {
    defaultValue?: string
    departments: ListDepartmentsResult
}) => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const handleQuery = useDebounceCallback((term) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('departmentIds', term)
        } else {
            params.delete('departmentIds')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const value = searchParams.get('departmentIds')?.split(',') || [defaultValue!]

    return (
        <SearchableSelect
            defaultValue={value}
            items={departments}
            label='Unit'
            name={'departmentId'}
            onChange={handleQuery}
        />
    )
}
