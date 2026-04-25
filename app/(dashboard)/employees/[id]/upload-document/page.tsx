import { IconArrowLeft } from '@intentui/icons'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import FormDocument from '@/app/(dashboard)/employees/[id]/upload-document/form-document'
import Heading from '@/components/heading'
import { buttonStyles } from '@/components/ui/button-style'
import { getDocumentById } from '@/server/repositories/document.repository'
import { listEmployeesDepartment } from '@/server/repositories/employees.repository'
import { getPermissions } from '@/server/services/auth.service'

export default async function EmployeeDocumentPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ docId: string }>
}) {
    const { id } = await params
    const { docId } = await searchParams

    const permissions = await getPermissions()
    if (!permissions.admin && !permissions.hr && permissions.currentDepartment?.employeeId !== id)
        return redirect(`/employees/${permissions.currentDepartment?.employeeId}`)

    return (
        <>
            <Heading description={'Upload berkas pegawai'} title={'Upload Berkas'}>
                <Link className={buttonStyles({ intent: 'outline' })} href={`/employees/${id}`}>
                    <IconArrowLeft />
                    Kembali
                </Link>
            </Heading>
            <Suspense>
                <UploadBerkas docId={docId || ''} id={id} />
            </Suspense>
        </>
    )
}

const UploadBerkas = async ({ id, docId }: { id: string; docId: string }) => {
    const data = docId ? await getDocumentById(docId) : null
    const employees = await listEmployeesDepartment()
    return <FormDocument currentDocument={data} employeeId={id} employees={employees} />
}
