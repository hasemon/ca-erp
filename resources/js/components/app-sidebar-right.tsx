import { Calendar } from '@/components/ui/calendar';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarRail,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { FileText, History, Info, Plus } from 'lucide-react';
import * as React from 'react';

interface SidebarRightProps extends React.ComponentProps<typeof Sidebar> {
    children?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

export function SidebarRight({
    children,
    header,
    footer,
    ...props
}: SidebarRightProps) {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (
        <Sidebar
            collapsible="none"
            className="sticky top-0 hidden h-svh w-80 border-l lg:flex"
            side="right"
            {...props}
        >
            <SidebarHeader className="border-b border-sidebar-border">
                {header}
            </SidebarHeader>
            <SidebarContent className="space-y-4 p-2">
                {children || (
                    <>
                        <div className="flex flex-col items-center">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md border shadow-sm"
                            />
                        </div>

                        <SidebarSeparator />

                        <SidebarGroup>
                            <SidebarGroupLabel className="flex items-center gap-2">
                                <History size={14} /> Recent Activities
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <div className="space-y-4 p-2 text-xs text-muted-foreground">
                                    <div className="flex gap-2">
                                        <div className="mt-0.5">
                                            <Plus
                                                size={12}
                                                className="text-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                JV-001 created
                                            </p>
                                            <p>2 minutes ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="mt-0.5">
                                            <FileText
                                                size={12}
                                                className="text-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">
                                                PV-042 approved
                                            </p>
                                            <p>1 hour ago</p>
                                        </div>
                                    </div>
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        <SidebarSeparator />

                        <SidebarGroup>
                            <SidebarGroupLabel className="flex items-center gap-2">
                                <Info size={14} /> Quick Stats
                            </SidebarGroupLabel>
                            <SidebarGroupContent>
                                <div className="grid grid-cols-2 gap-2 p-2">
                                    <div className="rounded-lg border bg-muted/50 p-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Pending
                                        </p>
                                        <p className="text-lg font-black">12</p>
                                    </div>
                                    <div className="rounded-lg border bg-muted/50 p-2">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Total
                                        </p>
                                        <p className="text-lg font-black">
                                            142
                                        </p>
                                    </div>
                                </div>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </>
                )}
            </SidebarContent>
            <SidebarFooter className="border-t">{footer}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
