'use client'

import type { GetEmployeeByIdResult } from '@/server/repositories/employees.repository'
import { IconPencilBox } from '@intentui/icons'
import { Form } from 'react-aria-components'
import { toast } from 'sonner'
import { Berkas } from '@/app/(dashboard)/employees/[id]/berkas'
import { MaleIcon } from '@/components/app-logo'
import { Badge, getEmployeeStatus } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/components/ui/description-list'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/field'
import { Popover, PopoverContent } from '@/components/ui/popover'
import { Radio, RadioGroup } from '@/components/ui/radio'
import { Tab, TabList, TabPanel, TabPanels, Tabs } from '@/components/ui/tabs'
import { formatDate, fullName } from '@/lib/utils'
import { changeEmployeeShiftGroup } from '@/server/services/shift.service'

export const Details = ({ employee }: { employee: GetEmployeeByIdResult }) => {
    if (!employee) return null
    return (
        <div className='space-y-4 px-4'>
            <Tabs>
                <TabList className='w-full *:w-full *:justify-center'>
                    <Tab id='personal'>Personal</Tab>
                    <Tab id='employee'>Kepegawaian</Tab>
                    <Tab id='legal'>Legal</Tab>
                    <Tab id='files'>Berkas</Tab>
                </TabList>
                <TabPanels className='min-h-100'>
                    <TabPanel id='personal'>
                        <DescriptionList>
                            <DescriptionTerm>Nama Lengkap</DescriptionTerm>
                            <DescriptionDetails>
                                {fullName(employee.name, employee.prefix, employee.suffix)}
                            </DescriptionDetails>
                            <DescriptionTerm>Jenis Kelamin</DescriptionTerm>
                            <DescriptionDetails>
                                {employee.gender === 'L' ? (
                                    <Badge intent='info'>
                                        <MaleIcon />
                                        Laki-laki
                                    </Badge>
                                ) : (
                                    <Badge intent='danger'>
                                        <MaleIcon />
                                        Perempuan
                                    </Badge>
                                )}
                            </DescriptionDetails>
                            <DescriptionTerm>Tempat, Tanggal Lahir</DescriptionTerm>
                            <DescriptionDetails>
                                {[
                                    employee.birthPlace,
                                    employee.birthDate && formatDate(String(employee.birthDate))
                                ].join(', ')}
                            </DescriptionDetails>
                            <DescriptionTerm>Alamat</DescriptionTerm>
                            <DescriptionDetails>{employee.address}</DescriptionDetails>
                            <DescriptionTerm>Pendidikan</DescriptionTerm>
                            <DescriptionDetails>{employee.education}</DescriptionDetails>
                            <DescriptionTerm>NIK</DescriptionTerm>
                            <DescriptionDetails>{employee.nik}</DescriptionDetails>
                            <DescriptionTerm>No. Telepon</DescriptionTerm>
                            <DescriptionDetails>{employee.phone}</DescriptionDetails>
                        </DescriptionList>
                    </TabPanel>
                    <TabPanel id='employee'>
                        <DescriptionList>
                            <DescriptionTerm>NIP</DescriptionTerm>
                            <DescriptionDetails>{employee.id}</DescriptionDetails>
                            <DescriptionTerm>Mulai Kerja</DescriptionTerm>
                            <DescriptionDetails>{formatDate(String(employee.joinDate))}</DescriptionDetails>
                            <DescriptionTerm>Status Pegawai</DescriptionTerm>
                            <DescriptionDetails>{getEmployeeStatus(employee.status)}</DescriptionDetails>
                            <DescriptionTerm>Unit</DescriptionTerm>
                            <DescriptionDetails>
                                {employee.departments?.find((d) => !d.endAt)?.department.name}
                            </DescriptionDetails>
                            <DescriptionTerm>Posisi</DescriptionTerm>
                            <DescriptionDetails>
                                {employee.departments?.find((d) => !d.endAt)?.position}
                            </DescriptionDetails>
                            <DescriptionTerm>Jenis Shift</DescriptionTerm>
                            <DescriptionDetails>{employee.departments.find((d) => !d.endAt)?.shift}</DescriptionDetails>
                            <DescriptionTerm>Grup Shift</DescriptionTerm>
                            <DescriptionDetails>
                                <div className='flex items-center gap-2 capitalize'>
                                    <Badge>{employee.group ?? '-'}</Badge>
                                    <Popover>
                                        <Button className='m-0' intent='outline' size='sq-xxs'>
                                            <IconPencilBox />
                                        </Button>
                                        <PopoverContent>
                                            <Dialog>
                                                <Form
                                                    action={async (formData) => {
                                                        const group = formData.get('group')
                                                        const res = await changeEmployeeShiftGroup(
                                                            employee.id,
                                                            String(group)
                                                        )
                                                        if (!res.success) {
                                                            toast.error('Gagal mengubah grup shift')
                                                        } else {
                                                            toast.success(res.message)
                                                        }
                                                    }}
                                                    className='p-4'
                                                >
                                                    <RadioGroup
                                                        defaultValue={employee.group}
                                                        name='group'
                                                        orientation='horizontal'
                                                    >
                                                        <Label>Ubah Grup</Label>
                                                        <div className='flex items-center gap-4'>
                                                            <Radio value='A'>A</Radio>
                                                            <Radio value='B'>B</Radio>
                                                            <Radio value='C'>C</Radio>
                                                            <Radio value='D'>D</Radio>
                                                        </div>
                                                    </RadioGroup>
                                                    <Button className='mt-2' size='sm' slot='close' type='submit'>
                                                        Simpan
                                                    </Button>
                                                </Form>
                                            </Dialog>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </DescriptionDetails>
                            <DescriptionTerm>PIN Fingerprint</DescriptionTerm>
                            <DescriptionDetails>{employee.fingerprint}</DescriptionDetails>
                            <DescriptionTerm>Kuota Cuti</DescriptionTerm>
                            <DescriptionDetails>{employee.leaveQuota}</DescriptionDetails>
                        </DescriptionList>
                    </TabPanel>
                    <TabPanel id='legal'>
                        <DescriptionList>
                            <DescriptionTerm>BPJS Kesehatan</DescriptionTerm>
                            <DescriptionDetails>{employee.bpjsKes}</DescriptionDetails>
                            <DescriptionTerm>BPJS Ketenagakerjaan</DescriptionTerm>
                            <DescriptionDetails>{employee.bpjsTk}</DescriptionDetails>
                            <DescriptionTerm>NPWP</DescriptionTerm>
                            <DescriptionDetails>{employee.npwp}</DescriptionDetails>
                            <DescriptionTerm>STR</DescriptionTerm>
                            <DescriptionDetails>{employee.str}</DescriptionDetails>
                            <DescriptionTerm>Masa Berlaku STR</DescriptionTerm>
                            <DescriptionDetails></DescriptionDetails>
                            <DescriptionTerm>SIP</DescriptionTerm>
                            <DescriptionDetails>{employee?.sip ?? '-'}</DescriptionDetails>
                            <DescriptionTerm>Mulai SIP</DescriptionTerm>
                            <DescriptionDetails>
                                {employee.sipStart && formatDate(String(employee.sipStart))}
                            </DescriptionDetails>
                            <DescriptionTerm>Berakhir SIP</DescriptionTerm>
                            <DescriptionDetails>
                                {employee.sipEnd && formatDate(String(employee.sipEnd))}
                            </DescriptionDetails>
                        </DescriptionList>
                    </TabPanel>
                    <TabPanel id='files'>
                        <Berkas employee={employee} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    )
}
