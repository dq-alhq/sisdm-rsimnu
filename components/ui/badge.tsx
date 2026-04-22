import type { EmployeeStatus, LeaveStatus, LeaveType } from '@/generated/enums'
import { tv } from 'tailwind-variants'

export const badgeStyles = tv({
    base: [
        'inline-flex items-center gap-x-1.5 py-px font-medium text-xs/5 forced-colors:outline',
        'border border-(--badge-border,transparent) bg-(--badge-bg) text-(--badge-fg)',
        'group-hover:bg-(--badge-overlay) group-focus:bg-(--badge-overlay)',
        '*:data-[slot=icon]:size-3 *:data-[slot=icon]:shrink-0',
        'duration-200'
    ],
    variants: {
        intent: {
            primary:
                '[--badge-bg:var(--color-primary-subtle)] [--badge-fg:var(--color-primary-subtle-fg)] [--badge-overlay:var(--color-primary)]/20',
            secondary:
                '[--badge-bg:var(--color-secondary)] [--badge-fg:var(--color-secondary-fg)] [--badge-overlay:var(--color-muted-fg)]/25',
            success:
                '[--badge-bg:var(--color-success-subtle)] [--badge-fg:var(--color-success-subtle-fg)] [--badge-overlay:var(--color-success)]/20',
            info: '[--badge-bg:var(--color-info-subtle)] [--badge-fg:var(--color-info-subtle-fg)] [--badge-overlay:var(--color-sky-500)]/20',
            warning:
                '[--badge-bg:var(--color-warning-subtle)] [--badge-fg:var(--color-warning-subtle-fg)] [--badge-overlay:var(--color-warning)]/20',
            danger: '[--badge-bg:var(--color-danger-subtle)] [--badge-fg:var(--color-danger-subtle-fg)] [--badge-overlay:var(--color-danger)]/20',
            outline: '[--badge-border:var(--color-border)] [--badge-overlay:var(--color-secondary)]/20'
        },
        isCircle: {
            true: 'rounded-full px-[calc(--spacing(2)-1px)]',
            false: 'rounded-sm px-[calc(--spacing(1.5)-1px)]'
        }
    },
    defaultVariants: {
        intent: 'primary',
        isCircle: true
    }
})

export interface BadgeProps extends React.ComponentProps<'span'> {
    intent?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'outline'
    isCircle?: boolean
}

export function Badge({ intent, isCircle, className, ...props }: BadgeProps) {
    return <span {...props} className={badgeStyles({ intent, isCircle, className })} />
}

export const getBadge = (text: string | null) => {
    switch (text) {
        case 'P':
            return <Badge>{text}</Badge>
        case 'S':
            return <Badge intent='info'>{text}</Badge>
        case 'M':
            return <Badge intent='warning'>{text}</Badge>
        case 'OFF':
            return <Badge intent='secondary'>{text}</Badge>
        default:
            return text
    }
}

export const getJenisCuti = (text: LeaveType) => {
    switch (text) {
        case 'annual':
            return <Badge intent='success'>Cuti Tahunan</Badge>
        case 'maternity':
            return <Badge intent='info'>Maternal</Badge>
        case 'sick':
            return <Badge intent='warning'>Sakit</Badge>
        case 'other':
            return <Badge intent='secondary'>Lainnya</Badge>
        default:
            return ''
    }
}

export const getApprovalStatus = (text: LeaveStatus) => {
    switch (text) {
        case 'pending':
            return <Badge intent='warning'>Pending</Badge>
        case 'supervisorApproved':
            return <Badge intent='success'>Disetujui Kepala Unit</Badge>
        case 'hrApproved':
            return <Badge intent='primary'>Disetujui HR</Badge>
        case 'rejected':
            return <Badge intent='danger'>Ditolak</Badge>
        default:
            return ''
    }
}

export const getEmployeeStatus = (text: EmployeeStatus) => {
    switch (text) {
        case 'active':
            return <Badge intent='primary'>Tetap</Badge>
        case 'inactive':
            return <Badge intent='danger'>Tidak Aktif</Badge>
        case 'probation':
            return <Badge intent='info'>Tidak Tetap</Badge>
        case 'resigned':
            return <Badge intent='secondary'>Resign</Badge>
        default:
            return ''
    }
}
