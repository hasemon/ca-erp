import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { SidebarRight } from '@/components/app-sidebar-right';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren } from 'react';

export default function VoucherLayout({
    children,
    sidebar,
    header,
    footer,
    breadcrumbs = [],
}: PropsWithChildren<{
    breadcrumbs?: BreadcrumbItem[];
    sidebar?: React.ReactNode;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}>) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            <SidebarRight header={header} footer={footer}>
                {sidebar}
            </SidebarRight>
        </AppShell>
    );
}
