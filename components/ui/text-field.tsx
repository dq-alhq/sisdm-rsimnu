'use client'

import { TextField as TextFieldPrimitive, type TextFieldProps } from 'react-aria-components/TextField'
import { cx } from '@/lib/primitive'
import { fieldStyles } from './field'

export function TextField({ className, ...props }: TextFieldProps) {
    return <TextFieldPrimitive className={cx(fieldStyles(), className)} data-slot='control' {...props} />
}
