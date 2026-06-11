import AccountController from '@/actions/App/Http/Controllers/AccountController';
import Heading from '@/components/heading';
import AccountFormModal from '@/components/pages/account/account-form-modal';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCan } from '@/hooks/use-can';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { AccountType, AccountTypeType } from '@/types/account-type';
import { Head } from '@inertiajs/react';
import { ChevronDown, Eye, EyeOff, Minus, Plus, SquarePen } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Chart of Accounts',
        href: AccountController.index().url,
    },
];

export default function Index({
    accountTypes,
    flatAccounts,
}: {
    accountTypes: AccountTypeType[];
    flatAccounts: AccountType[];
}) {
    const { canAll } = useCan();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAccountType, setSelectedAccountType] =
        useState<AccountTypeType | null>(null);
    const [editingAccount, setEditingAccount] = useState<AccountType | null>(
        null,
    );
    const [showBalances, setShowBalances] = useState(false);

    const handleCreate = (type: AccountTypeType) => {
        setEditingAccount(null);
        setSelectedAccountType(type);
        setIsModalOpen(true);
    };

    const handleEdit = (account: AccountType) => {
        setEditingAccount(account);
        const type =
            accountTypes.find((t) => t.id === account.account_type_id) || null;
        setSelectedAccountType(type);
        setIsModalOpen(true);
    };

    const AccountEditButton = ({ account }: { account: AccountType }) => {
        if (!canAll(['account.edit'])) {
            return null;
        }

        return (
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 transition-opacity group-hover/row:opacity-100"
                onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(account);
                }}
            >
                <SquarePen className="h-4 w-4" />
            </Button>
        );
    };

    const AccountRow = ({
        account,
        showBalances,
        showEditAction = true,
    }: {
        account: AccountType;
        showBalances: boolean;
        showEditAction?: boolean;
    }) => (
        <div className="group/row flex w-full items-center justify-between">
            <div className="flex flex-col">
                <span className="flex items-center space-x-2">
                    <span className="font-mono text-muted-foreground">
                        {account.code}
                    </span>
                    <span className="font-semibold">{account.name}</span>
                    {account.is_system && (
                        <span className="bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-secondary uppercase">
                            System
                        </span>
                    )}
                </span>
                {account.description && (
                    <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {account.description}
                    </span>
                )}
            </div>
            <div className="flex items-center space-x-4 pr-2">
                <span className="min-w-20 text-right text-sm font-medium tabular-nums">
                    {showBalances
                        ? `${(account.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : '******'}
                </span>
                {showEditAction && <AccountEditButton account={account} />}
            </div>
        </div>
    );

    const CollapsibleAccount = ({
        account,
        showBalances,
    }: {
        account: AccountType;
        showBalances: boolean;
    }) => {
        const hasChildren = account.children && account.children.length > 0;

        if (!hasChildren) {
            return (
                <div className="border-t px-4 py-2">
                    <div className="ps-6">
                        <AccountRow
                            account={account}
                            showBalances={showBalances}
                        />
                    </div>
                </div>
            );
        }

        return (
            <Collapsible className="space-y-1 border-t px-4 py-2">
                <div className="group/row flex items-center gap-2">
                    <CollapsibleTrigger className="flex flex-1 gap-2 text-left font-medium [&[data-state=open]>svg]:rotate-180">
                        <ChevronDown
                            aria-hidden="true"
                            className="mt-1 shrink-0 opacity-60 transition-transform duration-200"
                            size={16}
                            strokeWidth={2}
                        />
                        <div className="flex-1">
                            <AccountRow
                                account={account}
                                showBalances={showBalances}
                                showEditAction={false}
                            />
                        </div>
                    </CollapsibleTrigger>
                    <AccountEditButton account={account} />
                </div>
                <CollapsibleContent className="overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="mt-1 flex flex-col space-y-1 ps-6">
                        {account.children?.map((child) => (
                            <CollapsibleAccount
                                key={child.id}
                                account={child}
                                showBalances={showBalances}
                            />
                        ))}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Chart of Accounts" />
            <main className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Heading
                            title="Chart of Accounts"
                            description="View and manage standard financial account categories"
                        />
                    </div>
                </div>

                <Tabs
                    defaultValue={accountTypes[0]?.name || 'Assets'}
                    className="w-full"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <TabsList>
                            {accountTypes.map((type) => (
                                <TabsTrigger key={type.id} value={type.name}>
                                    {type.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setShowBalances(!showBalances)}
                                title={
                                    showBalances
                                        ? 'Hide balances'
                                        : 'Show balances'
                                }
                            >
                                {showBalances ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {accountTypes.map((type) => (
                        <TabsContent
                            key={type.id}
                            value={type.name}
                            className="space-y-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold">
                                        {type.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Manage your {type.name.toLowerCase()}{' '}
                                        accounts.
                                    </p>
                                </div>
                                {canAll(['account.create']) && (
                                    <Button onClick={() => handleCreate(type)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Account
                                    </Button>
                                )}
                            </div>

                            <Accordion
                                className="w-full -space-y-1"
                                collapsible
                                type="single"
                            >
                                {type.accounts?.map((account) => (
                                    <AccordionItem
                                        className="overflow-hidden border bg-background last:border-b"
                                        key={account.id}
                                        value={account.id.toString()}
                                    >
                                        <div className="group/row flex items-center px-4 py-2">
                                            <div className="flex-1">
                                                <AccordionTrigger className="group w-full p-0 hover:no-underline [&>svg]:hidden">
                                                    <div className="flex w-full items-center gap-3">
                                                        <div className="relative size-4 shrink-0">
                                                            <Plus className="absolute inset-0 size-4 text-muted-foreground transition-opacity duration-200 group-data-[state=open]:opacity-0" />
                                                            <Minus className="absolute inset-0 size-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <AccountRow
                                                                account={
                                                                    account
                                                                }
                                                                showBalances={
                                                                    showBalances
                                                                }
                                                                showEditAction={
                                                                    false
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </AccordionTrigger>
                                            </div>
                                            <AccountEditButton
                                                account={account}
                                            />
                                        </div>
                                        <AccordionContent className="p-0">
                                            <div className="flex flex-col">
                                                {account.children?.map(
                                                    (child) => (
                                                        <CollapsibleAccount
                                                            key={child.id}
                                                            account={child}
                                                            showBalances={
                                                                showBalances
                                                            }
                                                        />
                                                    ),
                                                )}
                                                {!account.children?.length && (
                                                    <div className="border-t bg-muted/10 p-4 text-sm text-muted-foreground italic">
                                                        No sub-accounts
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                                {!type.accounts?.length && (
                                    <Card className="border-dashed">
                                        <CardContent className="flex h-32 flex-col items-center justify-center space-y-2">
                                            <p className="text-muted-foreground">
                                                No accounts found in this
                                                category
                                            </p>
                                            {canAll(['account.create']) && (
                                                <Button
                                                    variant="link"
                                                    onClick={() =>
                                                        handleCreate(type)
                                                    }
                                                >
                                                    Create your first account
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </Accordion>
                        </TabsContent>
                    ))}
                </Tabs>

                <AccountFormModal
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    accountType={selectedAccountType}
                    account={editingAccount}
                    flatAccounts={flatAccounts}
                />
            </main>
        </AppLayout>
    );
}
