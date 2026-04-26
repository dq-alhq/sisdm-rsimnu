import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
    return (
        <div className='flex flex-col gap-y-(--layout-padding) p-(--layout-padding) [--layout-padding:--spacing(4)] lg:p-(--layout-padding) sm:[--layout-padding:--spacing(6)]'>
            <Skeleton className='h-8 w-56' />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <Skeleton className='h-28 w-full rounded-xl' />
                <Skeleton className='h-28 w-full rounded-xl' />
                <Skeleton className='h-28 w-full rounded-xl' />
                <Skeleton className='h-28 w-full rounded-xl' />
            </div>
            <Skeleton className='h-80 w-full rounded-xl' />
            <Skeleton className='h-64 w-full rounded-xl' />
        </div>
    )
}
