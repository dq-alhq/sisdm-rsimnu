'use client'
import { useCallback, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import type { PDFDocumentProxy } from 'pdfjs-dist'
import { IconTrash } from '@intentui/icons'
import { useResizeObserver } from '@wojtekmaj/react-hooks'
import { isFileDropItem } from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { DropZone } from '@/components/ui/drop-zone'
import { FileTrigger } from '@/components/ui/file-trigger'
import { app } from '@/config/app'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
const resizeObserverOptions = {}

export default function UploadPdf({
    currentFile,
    action
}: {
    currentFile?: string
    action: (value: File | null) => void
}) {
    const [numPages, setNumPages] = useState<number>()

    const current = currentFile ? `${app.url}/api/blob?url=${currentFile}` : null

    const [file, setFile] = useState<File | string | null>(current)
    function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
        setNumPages(nextNumPages)
    }

    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
    const [containerWidth, setContainerWidth] = useState<number>()

    const onResize = useCallback<ResizeObserverCallback>((entries) => {
        const [entry] = entries

        if (entry) {
            setContainerWidth(entry.contentRect.width)
        }
    }, [])
    useResizeObserver(containerRef, resizeObserverOptions, onResize)

    return (
        <div className='relative aspect-3/4 overflow-hidden rounded-lg sm:h-96'>
            {file ? (
                <>
                    {!currentFile && (
                        <div className='absolute top-2 right-2 z-10'>
                            <Button intent='danger' onPress={() => setFile(current)} size='sq-sm'>
                                <IconTrash />
                            </Button>
                        </div>
                    )}
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                        <Carousel>
                            <CarouselContent ref={setContainerRef}>
                                {Array.from(new Array(numPages), (_el, index) => (
                                    <CarouselItem className='basis-full object-cover' key={`page_${index + 1}`}>
                                        <Page key={`page_${index + 1}`} pageNumber={index + 1} width={containerWidth} />
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                    </Document>
                </>
            ) : (
                <DropZone
                    className='h-full max-h-none'
                    onDrop={async (e) => {
                        const item = e.items.filter(isFileDropItem).find((item) => item.type === 'application/pdf')
                        if (item) {
                            const file = await item.getFile()
                            setFile(file)
                            action?.(file)
                        }
                    }}
                >
                    <FileTrigger
                        acceptedFileTypes={['application/pdf']}
                        onSelect={(e) => {
                            const files = Array.from(e ?? [])
                            setFile(files[0])
                            action?.(files[0])
                        }}
                    />
                </DropZone>
            )}
        </div>
    )
}
