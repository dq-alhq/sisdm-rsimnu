export type RawAttendanceRow = {
    'AC-No.': string | number
    'No.'?: string
    Name: string
    Time: string
    State: 'C/In' | 'C/Out'
    'New State'?: string
    Exception?: string
    Operation?: string
}

export type AttendanceImportError = {
    row: number
    errors: string[]
}

export type ShiftSettingMatcher = {
    id: string
    name: string
    checkInAt: string | null
    checkOutAt: string | null
}

export type EmployeeAttendanceMatcher = {
    id: string
    name: string
    preferredShiftCode?: string | null
}

export type ScheduleDraft = {
    employeeId: string
    date: string
    shiftCode: string
    checkInAt?: string
    checkOutAt?: string
    late?: string
    earlyDeparture?: string
    totalWorkHours?: string
}

export type SchedulePreviewRow = ScheduleDraft & {
    employeeName: string
    sourceName: string
    totalLogs: number
    status: string
    shiftLabel: string
    late: string
    earlyDeparture: string
    totalWorkHours: string
}

type NormalizedAttendanceLog = {
    employeeId: string
    sourceName: string
    state: 'C/In' | 'C/Out'
    time: Date
    row: number
    invalid: boolean
}

type ShiftWindow = {
    id: string
    code: string
    checkInMinutes: number
    checkOutMinutes: number
    overnight: boolean
}

type AttendanceMatch = {
    employeeId: string
    employeeName: string
    sourceName: string
    date: string
    shiftCode: string
    shiftLabel: string
    expectedCheckInAt: Date
    expectedCheckOutAt: Date
    checkInAt: Date | null
    checkOutAt: Date | null
    totalLogs: number
    status: string
    score: number
}

type ShiftMatchResult = {
    shift: ShiftWindow
    date: string
    expectedCheckInAt: Date
    expectedCheckOutAt: Date
    score: number
}

const pad2 = (value: number) => value.toString().padStart(2, '0')
const MAX_PAIR_SPAN_MIN = 18 * 60

const normalizeEmployeeId = (value: string | number) => String(value).replace(/\.0+$/, '').trim()

const parseClockToMinutes = (value?: string | null) => {
    if (!value) return null
    const [hours, minutes] = value.trim().split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
    return hours * 60 + minutes
}

const parseRawDateTime = (value: string) => {
    const [datePart, timePart] = value.trim().split(' ')
    if (!datePart || !timePart) return null

    const [day, month, year] = datePart.split('/').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)

    if ([day, month, year, hour, minute].some((part) => Number.isNaN(part))) {
        return null
    }

    return new Date(year, month - 1, day, hour, minute)
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const addMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60 * 1000)

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

const diffMinutes = (left: Date, right: Date) => Math.abs((left.getTime() - right.getTime()) / 60000)

const formatDateKey = (date: Date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`

const formatTimeKey = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
const formatDuration = (minutes: number) => `${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`

const formatShiftLabel = (shift: ShiftWindow) =>
    `${shift.code} ${pad2(Math.floor(shift.checkInMinutes / 60))}:${pad2(shift.checkInMinutes % 60)} - ${pad2(
        Math.floor(shift.checkOutMinutes / 60)
    )}:${pad2(shift.checkOutMinutes % 60)}`

const normalizeShiftCode = (value?: string | null) => value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? ''

const statePenalty = (state: 'C/In' | 'C/Out', expected: 'C/In' | 'C/Out') => (state === expected ? 0 : 10)

const invalidPenalty = (invalid: boolean) => (invalid ? 5 : 0)

const presenceScore = (checkInAt: Date | null, checkOutAt: Date | null) => {
    if (checkInAt && checkOutAt) return 2
    if (checkInAt || checkOutAt) return 1
    return 0
}

const statusFromPresence = (checkInAt: Date | null, checkOutAt: Date | null) => {
    if (checkInAt && checkOutAt) return ''
    if (checkInAt) return 'Lupa C/Out'
    if (checkOutAt) return 'Lupa C/In'
    return 'Tidak ada log'
}

const getCandidateBaseDates = (dates: Date[]) => {
    const unique = new Map<string, Date>()

    dates.forEach((date) => {
        const current = startOfDay(date)
        const previous = addDays(current, -1)

        unique.set(formatDateKey(current), current)
        unique.set(formatDateKey(previous), previous)
    })

    return Array.from(unique.values())
}

const normalizeAttendanceLogs = (rows: RawAttendanceRow[]) => {
    const logs: NormalizedAttendanceLog[] = []
    const errors: AttendanceImportError[] = []

    rows.forEach((row, index) => {
        const employeeId = normalizeEmployeeId(row['AC-No.'])
        const sourceName = row.Name?.trim() ?? ''
        const time = parseRawDateTime(row.Time)
        const invalid = Boolean(
            row.Exception?.toLowerCase().includes('invalid') || row['New State']?.toLowerCase().includes('invalid')
        )

        if (!employeeId) {
            errors.push({
                row: index + 2,
                errors: ['AC-No. wajib diisi']
            })
            return
        }

        if (!time) {
            errors.push({
                row: index + 2,
                errors: ['Format Time tidak valid']
            })
            return
        }

        if (row.State !== 'C/In' && row.State !== 'C/Out') {
            errors.push({
                row: index + 2,
                errors: ['State harus C/In atau C/Out']
            })
            return
        }

        logs.push({
            employeeId,
            sourceName,
            state: row.State,
            time,
            row: index + 2,
            invalid
        })
    })

    logs.sort((left, right) => left.time.getTime() - right.time.getTime())

    return { logs, errors }
}

const normalizeShiftWindows = (shiftSettings: ShiftSettingMatcher[]) =>
    shiftSettings
        .map((shift) => {
            const checkInMinutes = parseClockToMinutes(shift.checkInAt)
            const checkOutMinutes = parseClockToMinutes(shift.checkOutAt)

            if (checkInMinutes === null || checkOutMinutes === null) {
                return null
            }

            return {
                id: shift.id,
                code: shift.name,
                checkInMinutes,
                checkOutMinutes,
                overnight: checkOutMinutes <= checkInMinutes
            } satisfies ShiftWindow
        })
        .filter((shift): shift is ShiftWindow => shift !== null)

const scorePreferredShift = (shift: ShiftWindow, preferredShiftCode?: string | null) => {
    const preferredShift = normalizeShiftCode(preferredShiftCode)
    if (!preferredShift) return 0
    return normalizeShiftCode(shift.code) === preferredShift ? 0 : 120
}

const matchSingleLogToShift = (
    log: NormalizedAttendanceLog,
    shifts: ShiftWindow[],
    preferredShiftCode?: string | null
): AttendanceMatch | null => {
    let bestMatch: AttendanceMatch | null = null
    const candidateBaseDates = getCandidateBaseDates([log.time])

    shifts.forEach((shift) => {
        candidateBaseDates.forEach((baseDate) => {
            const expectedCheckInAt = addMinutes(baseDate, shift.checkInMinutes)
            const expectedCheckOutAt = addMinutes(
                shift.overnight ? addDays(baseDate, 1) : baseDate,
                shift.checkOutMinutes
            )
            const checkInScore =
                diffMinutes(log.time, expectedCheckInAt) +
                statePenalty(log.state, 'C/In') +
                invalidPenalty(log.invalid) +
                scorePreferredShift(shift, preferredShiftCode)
            const checkOutScore =
                diffMinutes(log.time, expectedCheckOutAt) +
                statePenalty(log.state, 'C/Out') +
                invalidPenalty(log.invalid) +
                scorePreferredShift(shift, preferredShiftCode)

            const asCheckIn = checkInScore <= checkOutScore
            const score = Math.min(checkInScore, checkOutScore)

            if (!bestMatch || score < bestMatch.score) {
                bestMatch = {
                    date: formatDateKey(baseDate),
                    employeeId: log.employeeId,
                    employeeName: '',
                    sourceName: log.sourceName,
                    shiftCode: formatShiftLabel(shift),
                    shiftLabel: formatShiftLabel(shift),
                    expectedCheckInAt,
                    expectedCheckOutAt,
                    checkInAt: asCheckIn ? log.time : null,
                    checkOutAt: asCheckIn ? null : log.time,
                    totalLogs: 1,
                    status: asCheckIn ? 'Lupa C/Out' : 'Lupa C/In',
                    score
                }
            }
        })
    })

    return bestMatch
}

const matchPairToShift = (
    firstLog: NormalizedAttendanceLog,
    secondLog: NormalizedAttendanceLog,
    shifts: ShiftWindow[],
    preferredShiftCode?: string | null
): ShiftMatchResult | null => {
    if (secondLog.time.getTime() <= firstLog.time.getTime()) return null
    if (diffMinutes(secondLog.time, firstLog.time) > MAX_PAIR_SPAN_MIN) return null

    let bestMatch: ShiftMatchResult | null = null
    const candidateBaseDates = getCandidateBaseDates([firstLog.time, secondLog.time])

    shifts.forEach((shift) => {
        candidateBaseDates.forEach((baseDate) => {
            const expectedCheckInAt = addMinutes(baseDate, shift.checkInMinutes)
            const expectedCheckOutAt = addMinutes(
                shift.overnight ? addDays(baseDate, 1) : baseDate,
                shift.checkOutMinutes
            )

            if (expectedCheckOutAt.getTime() <= expectedCheckInAt.getTime()) return

            const pairScore =
                diffMinutes(firstLog.time, expectedCheckInAt) +
                diffMinutes(secondLog.time, expectedCheckOutAt) +
                Math.abs(
                    diffMinutes(secondLog.time, firstLog.time) - diffMinutes(expectedCheckOutAt, expectedCheckInAt)
                ) *
                    0.15 +
                statePenalty(firstLog.state, 'C/In') +
                statePenalty(secondLog.state, 'C/Out') +
                invalidPenalty(firstLog.invalid) +
                invalidPenalty(secondLog.invalid) +
                scorePreferredShift(shift, preferredShiftCode)

            if (!bestMatch || pairScore < bestMatch.score) {
                bestMatch = {
                    shift,
                    date: formatDateKey(baseDate),
                    expectedCheckInAt,
                    expectedCheckOutAt,
                    score: pairScore
                }
            }
        })
    })

    return bestMatch
}

const mergeAttendanceMatch = (current: AttendanceMatch | undefined, incoming: AttendanceMatch) => {
    if (!current) return incoming

    const currentPresence = presenceScore(current.checkInAt, current.checkOutAt)
    const incomingPresence = presenceScore(incoming.checkInAt, incoming.checkOutAt)

    if (incoming.shiftCode === current.shiftCode) {
        const checkInAt =
            current.checkInAt && incoming.checkInAt
                ? new Date(Math.min(current.checkInAt.getTime(), incoming.checkInAt.getTime()))
                : (current.checkInAt ?? incoming.checkInAt)
        const checkOutAt =
            current.checkOutAt && incoming.checkOutAt
                ? new Date(Math.max(current.checkOutAt.getTime(), incoming.checkOutAt.getTime()))
                : (current.checkOutAt ?? incoming.checkOutAt)

        return {
            ...current,
            sourceName: current.sourceName || incoming.sourceName,
            checkInAt,
            checkOutAt,
            totalLogs: current.totalLogs + incoming.totalLogs,
            status: statusFromPresence(checkInAt, checkOutAt),
            score: Math.min(current.score, incoming.score)
        }
    }

    if (incomingPresence > currentPresence) return incoming
    if (incomingPresence < currentPresence) return current
    if (incoming.score < current.score) return incoming

    return {
        ...current,
        totalLogs: current.totalLogs + incoming.totalLogs
    }
}

export const buildScheduleDraftsFromAttendance = ({
    rows,
    employees,
    shiftSettings
}: {
    rows: RawAttendanceRow[]
    employees: EmployeeAttendanceMatcher[]
    shiftSettings: ShiftSettingMatcher[]
}) => {
    const employeeMap = new Map(employees.map((employee) => [employee.id, employee]))
    const shifts = normalizeShiftWindows(shiftSettings)
    const { logs, errors } = normalizeAttendanceLogs(rows)

    if (shifts.length === 0) {
        return {
            attendances: [] as ScheduleDraft[],
            preview: [] as SchedulePreviewRow[],
            errors: [
                ...errors,
                {
                    row: 0,
                    errors: ['ShiftSetting belum dikonfigurasi atau jam masuk/keluar belum lengkap']
                }
            ]
        }
    }

    const employeeLogs = new Map<string, NormalizedAttendanceLog[]>()

    logs.forEach((log) => {
        const currentLogs = employeeLogs.get(log.employeeId) ?? []
        currentLogs.push(log)
        employeeLogs.set(log.employeeId, currentLogs)
    })

    const matchesByDate = new Map<string, AttendanceMatch>()

    employeeLogs.forEach((items, employeeId) => {
        const employee = employeeMap.get(employeeId)

        if (!employee) {
            items.forEach((log) => {
                errors.push({
                    row: log.row,
                    errors: [`Pegawai dengan ID ${log.employeeId} tidak ditemukan`]
                })
            })
            return
        }

        const sortedLogs = [...items].sort((left, right) => left.time.getTime() - right.time.getTime())
        const usedIndexes = new Set<number>()
        const pairCandidates: Array<{
            startIndex: number
            endIndex: number
            match: ShiftMatchResult
        }> = []

        sortedLogs.forEach((log, startIndex) => {
            for (let endIndex = startIndex + 1; endIndex < sortedLogs.length; endIndex += 1) {
                const candidate = sortedLogs[endIndex]
                if (diffMinutes(candidate.time, log.time) > MAX_PAIR_SPAN_MIN) break

                const match = matchPairToShift(log, candidate, shifts, employee.preferredShiftCode)
                if (!match) continue

                pairCandidates.push({
                    startIndex,
                    endIndex,
                    match
                })
            }
        })

        pairCandidates
            .sort((left, right) => {
                if (left.match.score !== right.match.score) return left.match.score - right.match.score
                return left.startIndex - right.startIndex
            })
            .forEach((candidate) => {
                if (usedIndexes.has(candidate.startIndex) || usedIndexes.has(candidate.endIndex)) return

                usedIndexes.add(candidate.startIndex)
                usedIndexes.add(candidate.endIndex)

                const startLog = sortedLogs[candidate.startIndex]
                const endLog = sortedLogs[candidate.endIndex]
                const key = `${employeeId}:${candidate.match.date}`

                matchesByDate.set(
                    key,
                    mergeAttendanceMatch(matchesByDate.get(key), {
                        employeeId,
                        employeeName: employee.name,
                        sourceName: startLog.sourceName || endLog.sourceName,
                        date: candidate.match.date,
                        shiftCode: formatShiftLabel(candidate.match.shift),
                        shiftLabel: formatShiftLabel(candidate.match.shift),
                        expectedCheckInAt: candidate.match.expectedCheckInAt,
                        expectedCheckOutAt: candidate.match.expectedCheckOutAt,
                        checkInAt: startLog.time,
                        checkOutAt: endLog.time,
                        totalLogs: candidate.endIndex - candidate.startIndex + 1,
                        status: '',
                        score: candidate.match.score
                    })
                )
            })

        sortedLogs.forEach((log, index) => {
            if (usedIndexes.has(index)) return

            const match = matchSingleLogToShift(log, shifts, employee.preferredShiftCode)
            if (!match) {
                errors.push({
                    row: log.row,
                    errors: ['Shift yang cocok tidak ditemukan']
                })
                return
            }

            const key = `${employeeId}:${match.date}`
            matchesByDate.set(
                key,
                mergeAttendanceMatch(matchesByDate.get(key), {
                    ...match,
                    employeeId,
                    employeeName: employee.name
                })
            )
        })
    })

    const preview = Array.from(matchesByDate.values())
        .sort((left, right) => {
            if (left.employeeId !== right.employeeId) return left.employeeId.localeCompare(right.employeeId)
            return left.date.localeCompare(right.date)
        })
        .map((group) => {
            const lateMinutes =
                group.checkInAt && group.checkInAt.getTime() > group.expectedCheckInAt.getTime()
                    ? Math.round((group.checkInAt.getTime() - group.expectedCheckInAt.getTime()) / 60000)
                    : 0
            const earlyDepartureMinutes =
                group.checkOutAt && group.checkOutAt.getTime() < group.expectedCheckOutAt.getTime()
                    ? Math.round((group.expectedCheckOutAt.getTime() - group.checkOutAt.getTime()) / 60000)
                    : 0
            const totalWorkMinutes =
                group.checkInAt && group.checkOutAt && group.checkOutAt.getTime() > group.checkInAt.getTime()
                    ? Math.round((group.checkOutAt.getTime() - group.checkInAt.getTime()) / 60000)
                    : 0

            return {
                employeeId: group.employeeId,
                employeeName: group.employeeName,
                sourceName: group.sourceName,
                date: group.date,
                shiftCode: group.shiftCode,
                shiftLabel: group.shiftLabel,
                checkInAt: group.checkInAt ? formatTimeKey(group.checkInAt) : undefined,
                checkOutAt: group.checkOutAt ? formatTimeKey(group.checkOutAt) : undefined,
                totalLogs: group.totalLogs,
                status: statusFromPresence(group.checkInAt, group.checkOutAt),
                late: formatDuration(lateMinutes),
                earlyDeparture: formatDuration(earlyDepartureMinutes),
                totalWorkHours: formatDuration(totalWorkMinutes)
            }
        })

    return {
        attendances: preview.map(
            ({ employeeId, date, shiftCode, checkInAt, checkOutAt, late, earlyDeparture, totalWorkHours }) => ({
                employeeId,
                date,
                shiftCode,
                checkInAt,
                checkOutAt,
                late,
                earlyDeparture,
                totalWorkHours
            })
        ),
        preview,
        errors
    }
}
