'use client'

import { useRouter } from 'next/navigation'
import { Link as LinkPrimitive, type LinkProps as LinkPrimitiveProps } from 'react-aria-components/Link'
import { cx } from '@/lib/primitive'

export interface LinkProps extends LinkPrimitiveProps {
    ref?: React.RefObject<HTMLAnchorElement>
}

export function Link({ className, ref, ...props }: LinkProps) {
    const router = useRouter()

    const shouldPrefetch =
        typeof props.href === 'string' &&
        props.href.startsWith('/') &&
        !props.href.startsWith('//') &&
        !props.href.startsWith('/api')

    return (
        <LinkPrimitive
            className={cx(
                [
                    'font-medium text-(--text)',
                    'outline-0 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring forced-colors:outline-[Highlight]',
                    'disabled:cursor-default disabled:opacity-50 forced-colors:disabled:text-[GrayText]',
                    'href' in props && 'cursor-pointer'
                ],
                className
            )}
            onHoverStart={() => {
                if (shouldPrefetch) {
                    router.prefetch(props.href!)
                }
            }}
            ref={ref}
            {...props}
        />
    )
}
