'use client'

import { Label, type LabelProps } from 'react-aria-components/Label'
import { ProgressBar, type ProgressBarProps } from 'react-aria-components/ProgressBar'
import { twJoin, twMerge } from 'tailwind-merge'
import { cx } from '@/lib/primitive'

export function Leaderboard({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={twMerge('flex flex-col gap-y-(--leaderboard-gutter,--spacing(4))', className)} {...props} />
}

export function LeaderboardHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={twMerge(
                'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-(--gutter) has-data-[slot=card-action]:grid-cols-[1fr_auto]',
                className
            )}
            data-slot='leaderboard-header'
            {...props}
        />
    )
}

export function LeaderboardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={twMerge('text-balance font-semibold text-base/6', className)}
            data-slot='leaderboard-title'
            {...props}
        />
    )
}

export function LeaderboardAction({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={twMerge('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
            data-slot='leaderboard-action'
            {...props}
        />
    )
}

export function LeaderboardContent({ className, ...props }: React.ComponentProps<'ul'>) {
    return (
        <ul
            className={twMerge('flex max-h-96 list-none flex-col gap-y-1', className)}
            data-slot='leaderboard-content'
            {...props}
        />
    )
}

interface LeaderboardItemProps extends ProgressBarProps {
    onAction?: () => void
}

export function LeaderboardItem({ minValue = 0, className, children, onAction, ...props }: LeaderboardItemProps) {
    return (
        <li className='group' data-slot='leaderboard-item'>
            <ProgressBar
                className={cx(
                    'relative cursor-default overflow-hidden rounded-md px-1.5 py-1 text-sm/6 outline-hidden focus-visible:ring focus-visible:ring-ring',
                    "[&_svg:shrink-0 [&_svg:not([class*='size-'])]:size-4",
                    className
                )}
                minValue={minValue}
                onClick={onAction}
                {...props}
            >
                {(values) => (
                    <>
                        <span className='relative z-2 flex items-center justify-between font-medium'>
                            {typeof children === 'function' ? children(values) : children}
                        </span>
                        <span
                            className={twJoin(
                                'absolute inset-y-0 start-0 z-1 rounded-e-md bg-secondary/60',
                                onAction ? 'cursor-default group-hover:bg-secondary' : ''
                            )}
                            style={{ width: `${values.percentage}%` }}
                        />
                    </>
                )}
            </ProgressBar>
        </li>
    )
}

export function LeaderboardStart({ className, ...props }: LabelProps) {
    return (
        <Label className={twMerge('flex items-center gap-x-2', className)} data-slot='leaderboard-start' {...props} />
    )
}

export function LeaderboardEnd({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={twMerge('tabular-nums', className)} data-slot='leaderboard-start' {...props} />
}
