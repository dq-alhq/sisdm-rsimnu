'use client'

import type { ComboBoxProps as ComboBoxPrimitiveProps, ComboBoxValueProps } from 'react-aria-components/ComboBox'
import type { InputProps } from 'react-aria-components/Input'
import type { PopoverProps } from 'react-aria-components/Popover'
import { IconChevronsUpDown } from '@intentui/icons'
import { Button } from 'react-aria-components/Button'
import {
    ComboBoxContext,
    ComboBox as ComboBoxPrimitive,
    ComboBoxValue as ComboBoxValuePrimitive
} from 'react-aria-components/ComboBox'
import { ListBox, type ListBoxProps } from 'react-aria-components/ListBox'
import { useSlottedContext } from 'react-aria-components/slots'
import { fieldStyles } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { cx } from '@/lib/primitive'
import { DropdownDescription, DropdownItem, DropdownLabel, DropdownSection } from './dropdown'
import { PopoverContent } from './popover'

interface ComboBoxProps<T extends object, M extends 'single' | 'multiple' = 'single'>
    extends Omit<ComboBoxPrimitiveProps<T, M>, 'children'> {
    children: React.ReactNode
}

const ComboBox = <T extends object, M extends 'single' | 'multiple' = 'single'>({
    className,
    ...props
}: ComboBoxProps<T, M>) => {
    return <ComboBoxPrimitive className={cx(fieldStyles(), className)} data-slot='control' {...props} />
}

interface ComboBoxListProps<T extends object>
    extends Omit<ListBoxProps<T>, 'layout' | 'orientation'>,
        Pick<PopoverProps, 'placement'> {
    popover?: Omit<PopoverProps, 'children'>
}

const ComboBoxContent = <T extends object>({ children, items, className, popover, ...props }: ComboBoxListProps<T>) => {
    return (
        <PopoverContent
            className={cx(
                'min-w-(--trigger-width) overflow-hidden *:data-[slot=popover-inner]:overflow-hidden',
                popover?.className
            )}
            placement={popover?.placement ?? 'bottom'}
            {...popover}
        >
            <ListBox
                className={cx(
                    "grid max-h-[inherit] w-full grid-cols-[auto_1fr] flex-col gap-y-1 overflow-y-auto p-1 outline-hidden *:[[role='group']+[role=group]]:mt-4 *:[[role='group']+[role=separator]]:mt-1",
                    className
                )}
                items={items}
                layout='stack'
                orientation='vertical'
                {...props}
            >
                {children}
            </ListBox>
        </PopoverContent>
    )
}

const ComboBoxInput = (props: InputProps) => {
    const context = useSlottedContext(ComboBoxContext)!
    return (
        <span className='relative isolate block has-[[data-slot=icon]:last-child]:[&_input]:pe-10' data-slot='control'>
            <Input {...props} placeholder={props?.placeholder} />
            <Button className='absolute end-0 top-0 grid h-full w-11 cursor-default place-content-center sm:w-9'>
                {!context?.inputValue && (
                    <IconChevronsUpDown className='-me-1 size-5 text-muted-fg sm:size-4' data-slot='chevron' />
                )}
            </Button>
        </span>
    )
}

const ComboBoxSection = DropdownSection
const ComboBoxItem = DropdownItem
const ComboBoxLabel = DropdownLabel
const ComboBoxDescription = DropdownDescription
const ComboBoxValue = <T extends object>(props: ComboBoxValueProps<T>) => (
    <ComboBoxValuePrimitive data-slot='control' {...props} />
)

export type { ComboBoxListProps, ComboBoxProps }
export {
    ComboBox,
    ComboBoxContent,
    ComboBoxDescription,
    ComboBoxInput,
    ComboBoxItem,
    ComboBoxLabel,
    ComboBoxSection,
    ComboBoxValue
}
