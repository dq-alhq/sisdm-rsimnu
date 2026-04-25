'use client'

import type { Key } from 'react-aria-components/TagGroup'
import { Popover } from 'react-aria-components/Popover'
import { Autocomplete } from '@/components/ui/autocomplete'
import { Dialog } from '@/components/ui/dialog'
import { FieldError, Label } from '@/components/ui/field'
import { ListBox } from '@/components/ui/list-box'
import { SearchField, SearchInput } from '@/components/ui/search-field'
import { Select, SelectItem, SelectTrigger } from '@/components/ui/select'

interface Props {
    label?: string
    items: { name: string; id: string }[]
    name: string
    defaultValue: string | string[]
    onChange?: (value: Key | null | Key[]) => void
    value?: string | string[]
    isDisabled?: boolean
}

export function SearchableSelect({ name, defaultValue, items, label, onChange, value, isDisabled }: Props) {
    return (
        <Select
            aria-label={label ?? 'Select'}
            defaultValue={defaultValue}
            isDisabled={isDisabled}
            name={name}
            onChange={onChange}
            selectionMode={Array.isArray(defaultValue) ? 'multiple' : 'single'}
            value={value}
        >
            {label && <Label>{label}</Label>}
            <SelectTrigger />
            <FieldError />
            <Popover className='entering:fade-in exiting:fade-out flex max-h-80 w-(--trigger-width) entering:animate-in exiting:animate-out flex-col overflow-hidden rounded-lg border bg-overlay'>
                <Dialog aria-label='Language'>
                    <Autocomplete>
                        <div className='border-b py-0.5'>
                            <SearchField autoFocus className='rounded-lg focus-within:ring-0'>
                                <SearchInput className='border-none ring-0 focus:ring-0' placeholder='Search&hellip;' />
                            </SearchField>
                        </div>
                        <ListBox
                            className='max-h-[inherit] min-w-[inherit] rounded-t-none border-0 bg-transparent shadow-none'
                            items={items}
                        >
                            {(item) => <SelectItem>{item.name}</SelectItem>}
                        </ListBox>
                    </Autocomplete>
                </Dialog>
            </Popover>
        </Select>
    )
}
