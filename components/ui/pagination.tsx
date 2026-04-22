'use client'

import type { ButtonProps } from '@/components/ui/button'
import { IconChevronLeft, IconChevronRight, IconChevronWallLeft, IconChevronWallRight } from '@intentui/icons'
import { twMerge } from 'tailwind-merge'
import { Link, type LinkProps } from '@/components/ui/link'
import { buttonStyles } from './button-style'

const Pagination = ({ className, ref, ...props }: React.ComponentProps<'nav'>) => (
    <nav
        aria-label='pagination'
        className={twMerge(
            'mx-auto flex w-full items-center justify-center gap-(--pagination-gap) [--pagination-gap:--spacing(2)] [--section-radius:calc(var(--radius-lg)-1px)] **:data-[slot=control]:w-auto',
            '**:data-[slot=pagination-item]:cursor-default',
            className
        )}
        data-slot='pagination'
        ref={ref}
        {...props}
    />
)

const PaginationSection = ({ className, ref, ...props }: React.ComponentProps<'ul'>) => (
    <li data-slot='pagination-section'>
        <ul className={twMerge('flex h-full gap-1.5 text-sm/6', className)} ref={ref} {...props} />
    </li>
)

const PaginationList = ({ className, ref, ...props }: React.ComponentProps<'ul'>) => {
    return (
        <ul
            aria-label={props['aria-label'] || 'Pagination'}
            className={twMerge('flex gap-1.25', className)}
            data-slot='pagination-list'
            ref={ref}
            {...props}
        />
    )
}

interface PaginationItemProps extends Omit<LinkProps, 'children'>, Pick<ButtonProps, 'isCircle' | 'size' | 'intent'> {
    className?: string
    isCurrent?: boolean
    children?: string | number
}

const PaginationItem = ({ className, size = 'sm', isCircle, isCurrent, ...props }: PaginationItemProps) => {
    return (
        <li>
            <Link
                aria-current={isCurrent ? 'page' : undefined}
                className={buttonStyles({
                    size: size,
                    isCircle: isCircle,
                    intent: isCurrent ? 'outline' : 'plain',
                    className: twMerge('touch-target min-w-9 shrink-0', className)
                })}
                data-slot='pagination-item'
                href={isCurrent ? undefined : props.href}
                {...props}
            />
        </li>
    )
}

interface PaginationAttributesProps
    extends Omit<LinkProps, 'className'>,
        Pick<ButtonProps, 'size' | 'isCircle' | 'intent'> {
    className?: string
}

const PaginationFirst = ({
    className,
    children,
    size = 'sq-sm',
    intent = 'outline',
    isCircle,
    ...props
}: PaginationAttributesProps) => {
    return (
        <li>
            <Link
                aria-label='First page'
                className={buttonStyles({
                    size: children ? 'sm' : size,
                    isCircle,
                    intent,
                    className: twMerge('shrink-0', className)
                })}
                data-slot='pagination-item'
                {...props}
            >
                <>
                    <IconChevronWallLeft />
                    {children}
                </>
            </Link>
        </li>
    )
}
const PaginationPrevious = ({
    className,
    children,
    size = 'sq-sm',
    intent = 'outline',
    isCircle = false,
    ...props
}: PaginationAttributesProps) => {
    return (
        <li>
            <Link
                aria-label='Previous page'
                className={buttonStyles({
                    size: children ? 'sm' : size,
                    isCircle,
                    intent,
                    className: twMerge('shrink-0', className)
                })}
                data-slot='pagination-item'
                {...props}
            >
                <>
                    <IconChevronLeft />
                    {children}
                </>
            </Link>
        </li>
    )
}
const PaginationNext = ({
    className,
    children,
    size = 'sq-sm',
    intent = 'outline',
    isCircle = false,
    ...props
}: PaginationAttributesProps) => {
    return (
        <li>
            <Link
                aria-label='Next page'
                className={buttonStyles({
                    size: children ? 'sm' : size,
                    isCircle,
                    intent,
                    className: twMerge('shrink-0', className)
                })}
                data-slot='pagination-item'
                {...props}
            >
                <>
                    {children}
                    <IconChevronRight />
                </>
            </Link>
        </li>
    )
}
const PaginationLast = ({
    className,
    children,
    size = 'sq-sm',
    intent = 'outline',
    isCircle = false,
    ...props
}: PaginationAttributesProps) => {
    return (
        <li>
            <Link
                aria-label='Last page'
                className={buttonStyles({
                    size: children ? 'sm' : size,
                    isCircle,
                    intent,
                    className: twMerge('shrink-0', className)
                })}
                data-slot='pagination-item'
                {...props}
            >
                <>
                    {children}
                    <IconChevronWallRight />
                </>
            </Link>
        </li>
    )
}

const PaginationSpacer = ({ className, ref, ...props }: React.ComponentProps<'div'>) => {
    return <div aria-hidden className={twMerge('flex-1', className)} ref={ref} {...props} />
}

const PaginationGap = ({ className, children = <>&hellip;</>, ...props }: React.ComponentProps<'li'>) => {
    return (
        <li
            className={twMerge('w-9 select-none text-center font-semibold text-fg text-sm/6 outline-hidden', className)}
            data-slot='pagination-gap'
            {...props}
            aria-hidden
        >
            {children}
        </li>
    )
}

const PaginationLabel = ({ className, ref, ...props }: React.ComponentProps<'li'>) => {
    return (
        <li
            className={twMerge(
                'min-w-4 self-center text-center text-fg *:[strong]:font-medium *:[strong]:text-fg',
                className
            )}
            data-slot='pagination-label'
            ref={ref}
            {...props}
        />
    )
}

const PaginationInfo = ({ className, ...props }: React.ComponentProps<'p'>) => {
    return (
        <p
            className={twMerge('text-muted-fg text-sm/6 *:[strong]:font-medium *:[strong]:text-fg', className)}
            {...props}
        />
    )
}

export {
    Pagination,
    PaginationFirst,
    PaginationGap,
    PaginationInfo,
    PaginationItem,
    PaginationLabel,
    PaginationLast,
    PaginationList,
    PaginationNext,
    PaginationPrevious,
    PaginationSection,
    PaginationSpacer
}
