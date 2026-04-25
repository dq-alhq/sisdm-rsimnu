'use client'
import type { EmployeeDocument } from '@/generated/client'
import type { GetEmployeeByIdResult } from '@/server/repositories/employees.repository'
import { IconEye, IconOpenLink2, IconPencilBox, IconUpload } from '@intentui/icons'
import dynamic from 'next/dynamic'
import { GridList, GridListItem } from 'react-aria-components/GridList'
import { PDFIcon } from '@/components/app-logo'
import { Button } from '@/components/ui/button'
import { buttonStyles } from '@/components/ui/button-style'
import { ItemActions, ItemContent, ItemMedia, ItemTitle, itemVariants } from '@/components/ui/item'
import { Link } from '@/components/ui/link'
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle
} from '@/components/ui/modal'
import { app } from '@/config/app'
import { formatDate } from '@/lib/utils'

export const Berkas = ({ employee }: { employee: GetEmployeeByIdResult }) => {
    return (
        <GridList aria-label='Berkas' className='grid grid-cols-1 gap-3 sm:grid-cols-3' layout='grid'>
            {employee?.employeeDocuments?.map((document) => (
                <File data={document as EmployeeDocument} key={document.id} />
            ))}
            <GridListItem
                className={itemVariants({
                    size: 'sm',
                    variant: 'outline',
                    className: 'col-span-full cursor-pointer justify-center'
                })}
                href={`/employees/${employee?.id}/upload-document`}
                textValue='Tambah Berkas'
            >
                <IconUpload />
                Tambah Berkas
            </GridListItem>
        </GridList>
    )
}

const ViewPDF = dynamic(() => import('./view-file'), { ssr: false })

const File = ({ data }: { data: EmployeeDocument }) => (
    <GridListItem className={itemVariants({ size: 'sm', variant: 'outline' })} textValue={data.name}>
        <ItemMedia variant='icon'>
            <PDFIcon />
        </ItemMedia>
        <ItemContent>
            <ItemTitle>{data.name}</ItemTitle>
        </ItemContent>
        <ItemActions>
            <Modal>
                <Button intent='outline' size='sq-xs'>
                    <IconEye />
                </Button>
                <ModalContent size='2xl'>
                    <ModalHeader>
                        <ModalTitle>{data.name}</ModalTitle>
                        <ModalDescription>Diupload pada {formatDate(String(data.updatedAt))}</ModalDescription>
                    </ModalHeader>
                    <ModalBody>
                        <ViewPDF currentFile={data.url} />
                    </ModalBody>
                    <ModalFooter>
                        <Link
                            className={buttonStyles({ intent: 'warning', className: 'sm:mr-auto' })}
                            href={`/employees/${data.employeeId}/upload-document?docId=${data.id}`}
                        >
                            <IconPencilBox />
                            Perbarui
                        </Link>
                        <Link
                            className={buttonStyles()}
                            href={`${app.url}/api/blob?url=${data.url}`}
                            rel='noopener noreferrer'
                            target='_blank'
                        >
                            <IconOpenLink2 />
                            Buka Dokumen
                        </Link>
                        <Button intent='outline' slot='close'>
                            Tutup
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ItemActions>
    </GridListItem>
)
