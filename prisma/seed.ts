import { auth } from '@/lib/auth'
import db from '@/lib/db'
import Departments from './departments.json'
import Employees from './employees.json'
import shiftSettings from './shift-setting.json'
import Shifts from './shifts.json'

async function main() {
    console.info('🌱 Seeding start...')

    //////////////////////////
    // SHIFTS
    //////////////////////////

    console.info('👦 Seeding shifts')
    await db.shiftPattern.deleteMany()

    await db.shiftPattern.createMany({
        data: Shifts
    })
    console.info('✅ Seeding shifts selesai!')

    //////////////////////////
    // SHIFT SETTINGS
    //////////////////////////

    console.info('👦 Seeding shift settings')

    await db.shiftSetting.deleteMany()

    await db.shiftSetting.createMany({
        data: shiftSettings
    })
    console.info('✅ Seeding shift settings selesai!')

    //////////////////////////
    // DEPARTMENTS
    //////////////////////////

    console.info('👦 Seeding departments')

    await db.department.deleteMany()

    await db.department.createMany({
        data: Departments
    })
    console.info('✅ Seeding departments selesai!')

    //////////////////////////
    // EMPLOYEES
    //////////////////////////

    console.info('👦 Seeding employees')

    await db.employee.deleteMany()

    Employees.map(async (employee) => {
        const employeeAccount = await auth.api.createUser({
            body: {
                name: employee.name,
                email: `${employee.nip}@example.test`,
                role: employee.nip === '20220402' || employee.nip === '20200407' ? 'admin' : 'user',
                password: employee.nip,
                data: {
                    username: employee.nip,
                    displayUsername: employee.nick
                }
            }
        })

        await db.employee.create({
            data: {
                id: employee.nip,
                nik: employee.nik,
                birthPlace: employee.birthPlace,
                birthDate: employee.birthDate,
                address: employee.address,
                prefix: employee.prefix,
                gender: employee.gender as 'L' | 'P',
                name: employee.name,
                suffix: employee.suffix,
                joinDate: employee.joinDate,
                education: employee.education,
                str: employee.str,
                sip: employee.sip,
                sipEnd: employee.sipEnd,
                userId: employeeAccount.user.id,
                group: employee.group ?? null
            }
        })

        await db.employeesOnDepartments.create({
            data: {
                employeeId: employee.nip,
                departmentId: employee.departmentId,
                number: `01.${employee.nip.slice(5, 8)}/RSIM.NU.B/A/I/${employee.nip.slice(0, 4)}`,
                assignedAt: employee.joinDate,
                shift: employee.shift,
                position: employee.position
            }
        })
    })

    console.info('✅ Seeding employees selesai!')

    console.info('✅ Seeding employees selesai!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await db.$disconnect()
    })
