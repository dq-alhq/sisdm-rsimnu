'use client'

import { useCallback, useEffect, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

import type { PDFDocumentProxy } from 'pdfjs-dist'
import { useResizeObserver } from '@wojtekmaj/react-hooks'
import { Badge } from '@/components/ui/badge'
import {
    Carousel,
    type CarouselApi,
    CarouselButton,
    CarouselContent,
    CarouselHandler,
    CarouselItem
} from '@/components/ui/carousel'
import { app } from '@/config/app'

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
const resizeObserverOptions = {}

export default function ViewFile({ currentFile }: { currentFile?: string }) {
    const file = currentFile ? `${app.url}/api/blob?url=${currentFile}` : null
    const [numPages, setNumPages] = useState<number>()

    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null)
    const [containerWidth, setContainerWidth] = useState<number>()

    function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
        setNumPages(nextNumPages)
    }

    const onResize = useCallback<ResizeObserverCallback>((entries) => {
        const [entry] = entries

        if (entry) {
            setContainerWidth(entry.contentRect.width)
        }
    }, [])
    useResizeObserver(containerRef, resizeObserverOptions, onResize)

    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)
        api.on('select', () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    return (
        <Carousel setApi={setApi}>
            <div className='relative aspect-3/4 overflow-hidden rounded-lg'>
                {file && (
                    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                        <CarouselContent ref={setContainerRef}>
                            {Array.from(new Array(numPages), (_el, index) => (
                                <CarouselItem className='basis-full object-cover' key={`page_${index + 1}`}>
                                    <Page key={`page_${index + 1}`} pageNumber={index + 1} width={containerWidth} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Document>
                )}
                <CarouselHandler className='absolute top-0 right-6 z-50'>
                    <Badge className='select-none bg-primary text-primary-fg'>
                        Page {current} of {count}
                    </Badge>
                    <CarouselButton intent='primary' segment='previous' />
                    <CarouselButton intent='primary' segment='next' />
                </CarouselHandler>
            </div>
        </Carousel>
    )
}
