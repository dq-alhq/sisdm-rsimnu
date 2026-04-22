'use client'

import type { VariantProps } from 'tailwind-variants'
import type { buttonStyles } from '@/components/ui/button-style'
import { CameraIcon, FolderIcon, PaperClipIcon } from '@heroicons/react/24/outline'
import {
    FileTrigger as FileTriggerPrimitive,
    type FileTriggerProps as FileTriggerPrimitiveProps
} from 'react-aria-components/FileTrigger'
import { Button } from './button'
import { Loader } from './loader'

export interface FileTriggerProps extends FileTriggerPrimitiveProps, VariantProps<typeof buttonStyles> {
    isDisabled?: boolean
    isPending?: boolean
    ref?: React.RefObject<HTMLInputElement>
    className?: string
}

export function FileTrigger({
    intent = 'outline',
    size = 'md',
    isCircle = false,
    ref,
    className,
    ...props
}: FileTriggerProps) {
    return (
        <FileTriggerPrimitive ref={ref} {...props}>
            <Button className={className} intent={intent} isCircle={isCircle} isDisabled={props.isDisabled} size={size}>
                {!props.isPending ? (
                    props.defaultCamera ? (
                        <CameraIcon />
                    ) : props.acceptDirectory ? (
                        <FolderIcon />
                    ) : (
                        <PaperClipIcon />
                    )
                ) : (
                    <Loader />
                )}
                {props.children ? (
                    props.children
                ) : (
                    <>
                        {props.allowsMultiple ? 'Browse a files' : props.acceptDirectory ? 'Browse' : 'Browse a file'}
                        ...
                    </>
                )}
            </Button>
        </FileTriggerPrimitive>
    )
}
