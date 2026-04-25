import type { GetPermissionResult } from '@/server/services/auth.service'
import {
    IconBookmarkOff,
    IconBriefcase2,
    IconCalendarClock,
    IconCalendarDaysFill,
    IconCirclePerson,
    IconFolderBox,
    IconGrid4,
    IconHome1,
    IconPeople
} from '@intentui/icons'

export const getNavigations = (permissions: GetPermissionResult) => {
    const { admin, hr, supervisor } = permissions
    const mainNavigations = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: IconGrid4,
            show: true
        },
        {
            title: 'Data Pegawai',
            href: '/employees',
            icon: IconPeople,
            show: true
        },
        {
            title: 'Data Unit',
            href: '/departments',
            icon: IconBriefcase2,
            show: admin || hr
        },
        {
            title: 'Absensi',
            href: '/absensi',
            icon: IconCalendarClock,
            show: true
        }
    ]

    const supervisorNavigations = [
        ...supervisor.map((d) => ({
            title: d.name,
            href: `/${d.id.toLowerCase()}`,
            icon: IconFolderBox,
            show: true
        })),
        {
            title: 'Jadwal',
            href: '/schedules',
            icon: IconCalendarClock,
            show: admin || hr || supervisor.length > 0
        },
        {
            title: 'Permohonan Cuti',
            href: '/leave-requests',
            icon: IconBookmarkOff,
            show: true
        }
    ]

    const userNavigations = [
        {
            title: 'Home',
            href: '/',
            icon: IconHome1,
            show: true
        },
        {
            title: 'Jadwal',
            href: '/jadwal',
            icon: IconCalendarDaysFill,
            show: true
        },
        {
            title: 'Rekap Absensi',
            href: '/rekap-absensi',
            icon: IconCalendarClock,
            show: true
        }
    ]

    const footerNavigations = [
        {
            title: 'Manajemen Pengguna',
            href: '/users',
            icon: IconPeople,
            show: admin
        },
        {
            title: 'Pengaturan',
            href: '/profile',
            icon: IconCirclePerson,
            show: true
        }
    ]

    return {
        supervisorNavigations,
        mainNavigations,
        footerNavigations,
        userNavigations
    }
}
