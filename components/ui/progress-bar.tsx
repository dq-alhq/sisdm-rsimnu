'use client'

import { createContext, use } from 'react'
import {
    ProgressBar as ProgressBarPrimitive,
    type ProgressBarProps,
    type ProgressBarRenderProps
} from 'react-aria-components/ProgressBar'
import { twMerge } from 'tailwind-merge'
import { cx } from '@/lib/primitive'

const ProgressBarContext = createContext<ProgressBarRenderProps | null>(null)

export function ProgressBar({ className, children, ...props }: ProgressBarProps) {
    return (
        <ProgressBarPrimitive
            className={cx(
                'w-full',
                '[&>[data-slot=progress-bar-header]+[data-slot=progress-bar-track]]:mt-2',
                '[&>[data-slot=progress-bar-header]+[data-slot=progress-bar-track]]:mt-2',
                "[&>[data-slot=progress-bar-header]+[slot='description']]:mt-1",
                "[&>[slot='description']+[data-slot=progress-bar-track]]:mt-2",
                '[&>[data-slot=progress-bar-track]+[slot=description]]:mt-2',
                '[&>[data-slot=progress-bar-track]+[slot=errorMessage]]:mt-2',
                '*:data-[slot=progress-bar-header]:font-medium',
                className
            )}
            data-slot='control'
            {...props}
        >
            {(values) => (
                <ProgressBarContext value={{ ...values }}>
                    {typeof children === 'function' ? children(values) : children}
                </ProgressBarContext>
            )}
        </ProgressBarPrimitive>
    )
}

export function ProgressBarHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            className={twMerge('flex items-center justify-between', className)}
            data-slot='progress-bar-header'
            {...props}
        />
    )
}

export function ProgressBarValue({ className, ...props }: Omit<React.ComponentProps<'span'>, 'children'>) {
    const { valueText } = use(ProgressBarContext)!
    return (
        <span className={twMerge('text-base/6 sm:text-sm/6', className)} data-slot='progress-bar-value' {...props}>
            {valueText}
        </span>
    )
}

export function ProgressBarTrack({ className, ref, ...props }: React.ComponentProps<'div'>) {
    const { isIndeterminate, percentage } = use(ProgressBarContext)!
    return (
        <span className='relative block w-full' data-slot='progress-bar-track'>
            <style>{`
        @keyframes progress-slide {
          0% { inset-inline-start: 0% }
          50% { inset-inline-start: 100% }
          100% { inset-inline-start: 0% }
        }
      `}</style>
            <div className='flex w-full items-center gap-x-2' ref={ref} {...props}>
                <div
                    className={twMerge(
                        '[--progress-content-bg:var(--color-primary)]',
                        'relative h-1.5 w-full min-w-52 overflow-hidden rounded-full bg-(--progress-container-bg,var(--color-secondary)) outline-1 outline-transparent -outline-offset-1 will-change-transform',
                        className
                    )}
                    data-slot='progress-container'
                >
                    {!isIndeterminate ? (
                        <div
                            className='absolute start-0 top-0 h-full rounded-full bg-(--progress-content-bg) transition-[width] duration-200 ease-linear will-change-[width] motion-reduce:transition-none forced-colors:bg-[Highlight]'
                            data-slot='progress-content'
                            style={{ width: `${percentage}%` }}
                        />
                    ) : (
                        <div
                            className='absolute top-0 h-full animate-[progress-slide_2000ms_ease-in-out_infinite] rounded-full bg-primary forced-colors:bg-[Highlight]'
                            data-slot='progress-content'
                            style={{ width: '40%' }}
                        />
                    )}
                </div>
            </div>
        </span>
    )
}
