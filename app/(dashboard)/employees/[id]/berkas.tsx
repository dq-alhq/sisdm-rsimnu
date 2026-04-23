'use client'
import type { GetEmployeeByIdResult } from '@/server/repositories/employees.repository'
import { IconEye } from '@intentui/icons'
import { GridList, GridListItem } from 'react-aria-components/GridList'
import { PDFIcon } from '@/components/app-logo'
import { Button } from '@/components/ui/button'
import { ItemActions, ItemContent, ItemMedia, ItemTitle, itemVariants } from '@/components/ui/item'

export const Berkas = ({ employee }: { employee: GetEmployeeByIdResult }) => {
    return (
        <GridList aria-label='Berkas' className='grid grid-cols-2 gap-3 sm:grid-cols-3' layout='grid'>
            <File title='KTP' url='#' />
            <File title='KK' url='#' />
            <File title='Ijazah Terakhir' url='#' />
            <File title='Transkrip Nilai' url='#' />
            <File title='SK Pegawai' url='#' />
            <File title='SK Penempatan' url='#' />
        </GridList>
    )
}

interface FileProps {
    title: string
    url: string
}

const File = ({ title, url = '#' }: FileProps) => (
    <GridListItem className={itemVariants({ size: 'sm', variant: 'outline' })} href={url}>
        <ItemMedia variant='icon'>
            <PDFIcon />
        </ItemMedia>
        <ItemContent>
            <ItemTitle>{title}</ItemTitle>
        </ItemContent>
        <ItemActions>
            <Button intent='outline' size='sq-xs'>
                <IconEye />
            </Button>
        </ItemActions>
    </GridListItem>
)
