'use client'

import { ColorArea as ColorAreaPrimitive, type ColorAreaProps } from 'react-aria-components/ColorArea'
import { cx } from '@/lib/primitive'
import { ColorThumb } from './color-thumb'

export function ColorArea({ className, ...props }: ColorAreaProps) {
    return (
        <ColorAreaPrimitive
            {...props}
            className={cx(
                'size-56 shrink-0 rounded-md bg-muted disabled:bg-muted-fg forced-colors:bg-[GrayText]',
                className
            )}
            data-slot='color-area'
            style={({ defaultStyle, isDisabled }) => ({
                ...defaultStyle,
                background: isDisabled ? undefined : defaultStyle.background
            })}
        >
            <ColorThumb />
        </ColorAreaPrimitive>
    )
}
