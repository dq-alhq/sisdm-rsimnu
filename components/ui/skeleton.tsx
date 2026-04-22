import { twMerge } from 'tailwind-merge'

export interface SkeletonProps extends React.ComponentProps<'div'> {
    soft?: boolean
}

export function Skeleton({ ref, soft = false, className, ...props }: SkeletonProps) {
    return (
        <div
            className={twMerge(
                'shrink-0 animate-pulse rounded-lg',
                soft ? 'bg-muted-fg/20' : 'bg-muted-fg/40',
                className
            )}
            data-slot='skeleton'
            ref={ref}
            {...props}
        />
    )
}
