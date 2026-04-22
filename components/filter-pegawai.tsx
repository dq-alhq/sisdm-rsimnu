import type { ListEmployeesDepartmentResult } from '@/server/repositories/employees.repository'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { SearchableSelect } from '@/components/searchable-select'
import { useDebounceCallback } from '@/hooks/use-debounce'

export const FilterPegawai = ({
    employees,
    defaultValue
}: {
    employees: ListEmployeesDepartmentResult
    defaultValue?: string
}) => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const handleQuery = useDebounceCallback((term) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('employeeIds', term)
        } else {
            params.delete('employeeIds')
        }
        replace(`${pathname}?${params.toString()}`)
    }, 300)

    const value = searchParams.get('employeeIds')?.split(',') || [defaultValue!]

    return (
        <SearchableSelect
            defaultValue={value}
            items={employees}
            label='Pegawai'
            name={'departmentId'}
            onChange={handleQuery}
        />
    )
}
