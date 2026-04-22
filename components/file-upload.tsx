'use client'

import type { DropEvent } from '@react-types/shared'
import { IconX } from '@intentui/icons'
import { useRef, useState } from 'react'
import { isFileDropItem } from 'react-aria-components'
import { Button } from '@/components/ui/button'
import { DropZone } from '@/components/ui/drop-zone'
import { FileTrigger } from '@/components/ui/file-trigger'
import { app } from '@/config/app'
import { compressToWebp } from '@/lib/image'
import { Loader } from './ui/loader'

export const FileUpload = ({
    defaultValue,
    onChange,
    name = 'image'
}: {
    defaultValue?: string
    onChange?: (url: string) => void
    name?: string
}) => {
    const [oldFile] = useState<string>(defaultValue || '')
    const [droppedImage, setDroppedImage] = useState<string>('')
    const inputFileRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)

    const onDropHandler = async (e: DropEvent) => {
        const item = e.items.filter(isFileDropItem).find((item) => item.type.startsWith('image/'))

        if (item) {
            setLoading(true)

            const file = await item.getFile()

            const webpFile = await compressToWebp(file)

            const formData = new FormData()
            formData.append('file', webpFile)

            const res = await fetch(`${app.url}/api/blob`, {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            onChange?.(data.url)
            setDroppedImage(data.url)
            setLoading(false)
        }
    }

    const onSelectHandler = async (e: any) => {
        if (e) {
            const files = Array.from([...e])
            const item = files[0]

            if (item) {
                setLoading(true)

                const webpFile = await compressToWebp(item)

                const formData = new FormData()
                formData.append('file', webpFile)

                const res = await fetch(`${app.url}/api/blob`, {
                    method: 'POST',
                    body: formData
                })

                const data = await res.json()
                onChange?.(data.url)
                setDroppedImage(data.url)
                setLoading(false)
            }
        }
    }

    const onClearHandler = async () => {
        if (droppedImage) {
            setLoading(true)
            await fetch(`${app.url}/api/blob`, {
                method: 'DELETE',
                body: JSON.stringify({ url: droppedImage, method: 'DELETE' })
            })
            setLoading(false)
        }
        onChange?.('')
        setDroppedImage('')
    }

    return (
        <DropZone
            className='relative size-full max-h-none object-cover p-0 lg:w-72'
            getDropOperation={(types) => (types.has('image/jpeg') || types.has('image/png') ? 'copy' : 'cancel')}
            onDrop={onDropHandler}
        >
            {loading ? (
                <div className='flex size-full items-center justify-center'>
                    <Loader />
                </div>
            ) : droppedImage ? (
                <>
                    <div className='absolute top-2 right-2 z-50'>
                        <Button intent='danger' onPress={onClearHandler}>
                            <IconX />
                        </Button>
                    </div>
                    <img alt='' className='size-full object-cover' src={droppedImage} />
                </>
            ) : oldFile ? (
                <>
                    <img alt='' className='size-full object-cover' src={oldFile} />
                    <div className='absolute z-50 grid space-y-1 rounded-xl border bg-bg/40 p-2'>
                        <div className='flex justify-center'>
                            <FileTrigger
                                acceptedFileTypes={['image/png', 'image/jpeg']}
                                allowsMultiple={false}
                                onSelect={onSelectHandler}
                            >
                                Upload gambar
                            </FileTrigger>
                        </div>
                        <p className='rounded p-2 text-center text-accent-fg text-xs'>atau seret gambar kesini</p>
                    </div>
                </>
            ) : (
                <div className='grid space-y-3'>
                    <div className='flex justify-center'>
                        <FileTrigger
                            acceptedFileTypes={['image/png', 'image/jpeg']}
                            allowsMultiple={false}
                            onSelect={onSelectHandler}
                        >
                            Upload gambar
                        </FileTrigger>
                    </div>
                    <p className='text-center text-muted-fg text-xs'>atau seret gambar kesini</p>
                </div>
            )}
            <input name={name} ref={inputFileRef} type='hidden' value={droppedImage !== '' ? droppedImage : oldFile} />
        </DropZone>
    )
}
