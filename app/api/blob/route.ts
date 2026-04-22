import { del, get, put } from '@vercel/blob'

export async function POST(request: Request) {
    const form = await request.formData()

    const file = form.get('file') as File

    const blob = await put(file.name, file, {
        access: 'private',
        addRandomSuffix: true
    })

    return Response.json(blob)
}

export async function GET(request: Request) {
    const url = new URL(request.url).searchParams.get('url')
    if (!url) {
        return new Response('/file.svg')
    }
    const blob = await get(url || '', { access: 'private' })
    if (!blob) {
        return new Response('Blob not found', { status: 404 })
    }

    return new Response(blob.stream, {
        headers: {
            'Content-Type': blob.headers.get('content-type') || ''
        }
    })
}

export async function DELETE(request: Request) {
    const blob = await request.json()
    await del(blob.url)
    return Response.json(blob)
}
