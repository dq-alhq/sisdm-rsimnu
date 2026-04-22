import imageCompression from 'browser-image-compression'

export async function compressToWebp(file: File): Promise<File> {
    // 1. compress dulu (jpeg/png)
    const compressed = await imageCompression(file, {
        maxSizeMB: 0.2,
        maxWidthOrHeight: 1280,
        useWebWorker: true
    })

    // 2. convert ke webp pakai canvas
    const bitmap = await createImageBitmap(compressed)
    const canvas = document.createElement('canvas')

    canvas.width = bitmap.width
    canvas.height = bitmap.height

    const ctx = canvas.getContext('2d')
    ctx?.drawImage(bitmap, 0, 0)

    const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/webp', 0.7))

    return new File([blob], file.name.replace(/\.\w+$/, '.webp'), {
        type: 'image/webp'
    })
}
