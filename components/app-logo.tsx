import type { ComponentProps, SVGProps } from 'react'
import Image from 'next/image'
import Logo from '@/app/android-chrome-512x512.png'
import { cn } from '@/lib/utils'

export const AppLogo = (props: ComponentProps<'div'>) => (
    <div {...props} className={cn('overflow-hidden object-cover', props.className)}>
        <Image alt='Logo' className='size-full rounded-full' height={512} placeholder='blur' src={Logo} width={512} />
    </div>
)
export const ExcelIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg data-slot='icon' viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path
            d='M200 24H72a16 16 0 0 0-16 16v24H40a16 16 0 0 0-16 16v96a16 16 0 0 0 16 16h16v24a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V40a16 16 0 0 0-16-16m-40 80h40v48h-40Zm40-16h-40v-8a16 16 0 0 0-16-16V40h56ZM72 40h56v24H72ZM40 80h104v96H40Zm32 112h56v24H72Zm72 24v-24a16 16 0 0 0 16-16v-8h40v48Zm-78.15-69.12L81.59 128l-15.74-18.88a8 8 0 0 1 12.3-10.24L92 115.5l13.85-16.62a8 8 0 1 1 12.3 10.24L102.41 128l15.74 18.88a8 8 0 0 1-12.3 10.24L92 140.5l-13.85 16.62a8 8 0 0 1-12.3-10.24'
            fill='currentColor'
        />
    </svg>
)

export const MaleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg data-slot='icon' viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path
            d='M216 28h-48a12 12 0 0 0 0 24h19l-32.72 32.74a84 84 0 1 0 17 17L204 69v19a12 12 0 0 0 24 0V40a12 12 0 0 0-12-12m-69.59 166.46a60 60 0 1 1 0-84.87a60.1 60.1 0 0 1 0 84.87'
            fill='currentColor'
        />
    </svg>
)

export const FemaleIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg data-slot='icon' viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg' {...props}>
        <path
            d='M212 96a84 84 0 1 0-96 83.13V196H88a12 12 0 0 0 0 24h28v20a12 12 0 0 0 24 0v-20h28a12 12 0 0 0 0-24h-28v-16.87A84.12 84.12 0 0 0 212 96M68 96a60 60 0 1 1 60 60a60.07 60.07 0 0 1-60-60'
            fill='currentColor'
        />
    </svg>
)
