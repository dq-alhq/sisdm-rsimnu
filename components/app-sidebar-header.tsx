import { SidebarNav, SidebarTrigger } from '@/components/ui/sidebar'
import { ModeToggle } from './mode-toggle'

export function AppSidebarHeader() {
    return (
        <SidebarNav>
            <span className='flex items-center gap-x-4'>
                <SidebarTrigger className='-ml-2.5 lg:ml-0' />
            </span>
            <div className='ml-auto'>
                <ModeToggle />
            </div>
        </SidebarNav>
    )
}
