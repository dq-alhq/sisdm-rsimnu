import { twMerge } from 'tailwind-merge'

const DescriptionList = ({ className, ref, ...props }: React.ComponentProps<'dl'>) => {
    return (
        <dl
            className={twMerge(
                'grid grid-cols-1 text-base/6 sm:grid-cols-[min(50%,calc(var(--spacing)*80))_auto] sm:text-sm/6',
                className
            )}
            ref={ref}
            {...props}
        />
    )
}

const DescriptionTerm = ({ className, ref, ...props }: React.ComponentProps<'dt'>) => {
    return (
        <dt
            className={twMerge('col-start-1 border-t pt-3 text-muted-fg first:border-none sm:py-3', className)}
            ref={ref}
            {...props}
        />
    )
}

const DescriptionDetails = ({ className, ...props }: React.ComponentProps<'dd'>) => {
    return (
        <dd
            {...props}
            className={twMerge('pt-1 pb-3 text-fg sm:border-t sm:nth-2:border-none sm:py-3', className)}
            data-slot='description-details'
        />
    )
}

export { DescriptionDetails, DescriptionList, DescriptionTerm }
