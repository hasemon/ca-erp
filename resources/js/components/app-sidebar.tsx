import AccountController from '@/actions/App/Http/Controllers/AccountController';
import BusinessPartnerController from '@/actions/App/Http/Controllers/BusinessPartnerController';
import PostingRuleController from '@/actions/App/Http/Controllers/PostingRuleController';
import TransactionController from '@/actions/App/Http/Controllers/TransactionController';
import VoucherController from '@/actions/App/Http/Controllers/VoucherController';
import { Link } from '@inertiajs/react';
import {
    IconBuildingBank,
    IconUserFilled,
    IconWallet,
} from '@tabler/icons-react';
import {
    BookOpen,
    Calculator,
    FolderGit2,
    HandCoins,
    History,
    LayoutGrid,
    RefreshCcw,
    Settings,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Accounting',
        icon: Calculator,
        permission: 'account.access',
        items: [
            {
                title: 'Chart of Accounts',
                href: AccountController.index().url,
                icon: IconBuildingBank,
                permission: 'account.access',
            },
            {
                title: 'Business Partners',
                href: BusinessPartnerController.index().url,
                icon: IconUserFilled,
                permission: 'business-partner.access',
            },
            {
                title: 'Transactions',
                href: TransactionController.index().url,
                icon: History,
                permission: 'transaction.access',
            },
            {
                title: 'Posting Rules',
                href: PostingRuleController.index().url,
                icon: Settings,
                permission: 'posting-rule.access',
            },
            {
                title: 'Vouchers',
                icon: IconWallet,
                permission: 'voucher.create',
                items: [
                    {
                        title: 'Receipt',
                        href: VoucherController.createReceipt().url,
                        permission: 'voucher.create',
                    },
                    {
                        title: 'Payment',
                        href: VoucherController.createPayment().url,
                        permission: 'voucher.create',
                    },
                    {
                        title: 'Journal',
                        href: VoucherController.createJournal().url,
                        permission: 'voucher.create',
                    },
                    {
                        title: 'Contra',
                        href: VoucherController.createContra().url,
                        permission: 'voucher.create',
                    },
                    {
                        title: 'Expense',
                        href: VoucherController.createExpense().url,
                        permission: 'voucher.create',
                    },
                    {
                        title: 'Advance',
                        href: VoucherController.createAdvance().url,
                        icon: HandCoins,
                        permission: 'voucher.create',
                    },
                    {
                        title: 'Refund',
                        href: VoucherController.createRefund().url,
                        icon: RefreshCcw,
                        permission: 'voucher.create',
                    },
                ],
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
