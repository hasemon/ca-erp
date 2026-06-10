import { AccountSelect } from '@/components/account-select';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { update } from '@/routes/posting-rules';
import type { BreadcrumbItem } from '@/types';
import { AccountType } from '@/types/account-type';
import { PostingRuleAccountType } from '@/types/posting-rule-account-type';
import { PostingRuleType } from '@/types/posting-rule-type';
import { useForm } from '@inertiajs/react';
import {
    ArrowLeftRight,
    Banknote,
    CreditCard,
    Edit2,
    HandCoins,
    Info,
    Landmark,
    Lock,
    RefreshCcw,
    Receipt,
    Save,
    ScrollText,
    Undo2,
    Wallet,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounting', href: '/accounting' },
    { title: 'Posting Rules', href: '/posting-rules' },
];

export default function Index({
    rules,
    accounts,
}: {
    rules: Record<string, PostingRuleType[]>;
    accounts: AccountType[];
}) {
    const [editingTab, setEditingTab] = useState<string | null>(null);

    const { data, setData, put, processing, reset } = useForm({
        rules: [] as (Partial<PostingRuleType> & { id: number })[],
    });

    const docTypes = [
        { id: 'App\\Models\\Sale', label: 'Sale', icon: ScrollText },
        {
            id: 'App\\Models\\Purchase',
            label: 'Purchase',
            icon: Receipt,
        },
        {
            id: 'App\\Models\\ReceiptVoucher',
            label: 'Receipt Voucher',
            icon: CreditCard,
        },
        {
            id: 'App\\Models\\PaymentVoucher',
            label: 'Payment Voucher',
            icon: Wallet,
        },
        {
            id: 'App\\Models\\JournalVoucher',
            label: 'Journal Voucher',
            icon: ArrowLeftRight,
        },
        {
            id: 'App\\Models\\ContraVoucher',
            label: 'Contra Voucher',
            icon: Banknote,
        },
        {
            id: 'App\\Models\\ExpenseVoucher',
            label: 'Expense Voucher',
            icon: Landmark,
        },
        {
            id: 'App\\Models\\AdvanceVoucher',
            label: 'Advance Voucher',
            icon: HandCoins,
        },
        {
            id: 'App\\Models\\RefundVoucher',
            label: 'Refund Voucher',
            icon: RefreshCcw,
        },
        // {
        //     id: 'App\\Models\\SalaryVoucher',
        //     label: 'Salary Voucher',
        //     icon: GraduationCap,
        // },
        { id: 'App\\Models\\SaleReturn', label: 'Sale Return', icon: Undo2 },
        // {
        //     id: 'App\\Models\\PurchaseReturn',
        //     label: 'Purchase Return',
        //     icon: Repeat2,
        // },
        // {
        //     id: 'App\\Models\\StockAdjustment',
        //     label: 'Stock Adjustment',
        //     icon: Settings2,
        // },
    ];

    const startEditing = (type: string) => {
        setEditingTab(type);
        setData(
            'rules',
            (rules[type] || []).map((r: PostingRuleType) => ({
                id: r.id,
                account_id: r.account_id,
                account_ids: r.account_ids || [], // This is now synced from the pivot table by the controller
                is_active: r.is_active,
            })),
        );
    };

    const cancelEditing = () => {
        setEditingTab(null);
        reset();
    };

    const updateRule = (
        id: number,
        field: keyof PostingRuleType,
        value: string | number | boolean | (string | number)[] | null,
    ) => {
        setData(
            'rules',
            data.rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
        );
    };

    const saveChanges = () => {
        put(update.url(), {
            onSuccess: () => {
                toast.success('Posting rules updated successfully.');
                setEditingTab(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <main className="space-y-4 p-4">
                <div className="flex items-end justify-between">
                    <Heading
                        title="Posting Rules"
                        description="Configure posting rules for business transactions."
                    />

                    {editingTab && (
                        <div className="flex animate-in items-center gap-3 rounded-lg border bg-background p-2">
                            <div className="flex items-center gap-2 px-2">
                                <div className="rounded-full border border-amber-200 bg-amber-50 p-1.5">
                                    <Lock className="h-4 w-4 text-amber-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-amber-800">
                                        Locked for Editing
                                    </span>
                                    <span className="text-[11px] text-amber-600">
                                        {
                                            docTypes.find(
                                                (t) => t.id === editingTab,
                                            )?.label
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={cancelEditing}
                                >
                                    <X className="h-4 w-4" /> Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={saveChanges}
                                    disabled={processing}
                                >
                                    <Save className="h-4 w-4" />{' '}
                                    {processing ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Tabs defaultValue={docTypes[0].id} className="w-full">
                    <div className="relative">
                        <ScrollArea className="w-full whitespace-nowrap">
                            <TabsList>
                                {docTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <TabsTrigger
                                            key={type.id}
                                            value={type.id}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {type.label}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                            <ScrollBar
                                orientation="horizontal"
                                className="hidden"
                            />
                        </ScrollArea>
                    </div>

                    {docTypes.map((type) => (
                        <TabsContent key={type.id} value={type.id}>
                            <Card className="gap-0 p-0">
                                <CardHeader className="flex flex-row items-center justify-between p-4">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-3">
                                            <type.icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <CardTitle className="font-bold">
                                                {type.label} Configuration
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                Define accounting distribution
                                                and ledger mappings for{' '}
                                                {type.label.toLowerCase()}{' '}
                                                documents.
                                            </CardDescription>
                                        </div>
                                    </div>

                                    {!editingTab ? (
                                        <Button
                                            onClick={() =>
                                                startEditing(type.id)
                                            }
                                        >
                                            <Edit2 className="h-4 w-4" /> Edit
                                            Rules
                                        </Button>
                                    ) : (
                                        editingTab !== type.id && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="flex cursor-not-allowed items-center gap-2 rounded-full border border-dashed bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                                                            <Lock className="h-4 w-4" />{' '}
                                                            Session Locked
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="left">
                                                        <p>
                                                            Please close your
                                                            active editing
                                                            session first.
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )
                                    )}
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-secondary">
                                            <TableRow className="border-t">
                                                <TableHead className="text-xs font-bold text-muted-foreground uppercase">
                                                    Entry Type
                                                </TableHead>
                                                <TableHead className="text-xs font-bold text-muted-foreground uppercase">
                                                    Ledger Mapping (GL Accounts)
                                                </TableHead>
                                                <TableHead className="text-xs font-bold text-muted-foreground uppercase">
                                                    Description
                                                </TableHead>
                                                <TableHead className="text-right text-xs font-bold text-muted-foreground uppercase">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!rules[type.id] ||
                                            rules[type.id].length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="h-64 text-center"
                                                    >
                                                        <div className="flex flex-col items-center justify-center space-y-3">
                                                            <div className="rounded-full bg-muted/50 p-4">
                                                                <ScrollText className="h-8 w-8 text-muted-foreground/40" />
                                                            </div>
                                                            <p className="font-medium text-muted-foreground">
                                                                No rules
                                                                configured for
                                                                this blueprint.
                                                            </p>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="rounded-lg"
                                                            >
                                                                Initialize
                                                                Defaults
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                rules[type.id].map(
                                                    (rule: PostingRuleType) => {
                                                        const isEditing =
                                                            editingTab ===
                                                            type.id;
                                                        const editData =
                                                            data.rules.find(
                                                                (r) =>
                                                                    r.id ===
                                                                    rule.id,
                                                            );
                                                        const isVoucher =
                                                            rule.document_type.includes(
                                                                'Voucher',
                                                            ) ||
                                                            rule.document_type.includes(
                                                                'Refund',
                                                            );

                                                        return (
                                                            <TableRow
                                                                key={rule.id}
                                                                className="group border-b-border transition-colors hover:bg-muted"
                                                            >
                                                                <TableCell>
                                                                    <Badge
                                                                        variant={
                                                                            rule.type ===
                                                                            'debit'
                                                                                ? 'default'
                                                                                : 'secondary'
                                                                        }
                                                                        className={cn(
                                                                            'px-2 py-0.5 font-bold capitalize',
                                                                            rule.type ===
                                                                                'debit'
                                                                                ? 'bg-emerald-500 hover:bg-emerald-600'
                                                                                : 'bg-rose-500 text-white hover:bg-rose-600',
                                                                        )}
                                                                    >
                                                                        {
                                                                            rule.type
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {isEditing ? (
                                                                        <div className="space-y-2">
                                                                            {rule.is_dynamic ? (
                                                                                <div className="flex animate-in items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-sm text-blue-700 zoom-in-95">
                                                                                    <Info className="h-4 w-4 shrink-0" />
                                                                                    <span>
                                                                                        System
                                                                                        dynamic
                                                                                        logic:{' '}
                                                                                        <strong className="font-mono text-blue-900">
                                                                                            {
                                                                                                rule.dynamic_key
                                                                                            }
                                                                                        </strong>
                                                                                    </span>
                                                                                </div>
                                                                            ) : isVoucher ? (
                                                                                <AccountSelect
                                                                                    accounts={
                                                                                        accounts as AccountType[]
                                                                                    }
                                                                                    multiple={
                                                                                        true
                                                                                    }
                                                                                    value={
                                                                                        editData?.account_ids ||
                                                                                        []
                                                                                    }
                                                                                    onValueChange={(
                                                                                        val:
                                                                                            | string
                                                                                            | number
                                                                                            | boolean
                                                                                            | (
                                                                                                  | string
                                                                                                  | number
                                                                                              )[]
                                                                                            | null,
                                                                                    ) =>
                                                                                        updateRule(
                                                                                            rule.id,
                                                                                            'account_ids',
                                                                                            val,
                                                                                        )
                                                                                    }
                                                                                    placeholder={`Select authorized ${rule.type} accounts...`}
                                                                                />
                                                                            ) : (
                                                                                <AccountSelect
                                                                                    accounts={
                                                                                        accounts as AccountType[]
                                                                                    }
                                                                                    multiple={
                                                                                        false
                                                                                    }
                                                                                    value={
                                                                                        editData?.account_id ??
                                                                                        null
                                                                                    }
                                                                                    onValueChange={(
                                                                                        val:
                                                                                            | string
                                                                                            | number
                                                                                            | boolean
                                                                                            | (
                                                                                                  | string
                                                                                                  | number
                                                                                              )[]
                                                                                            | null,
                                                                                    ) =>
                                                                                        updateRule(
                                                                                            rule.id,
                                                                                            'account_id',
                                                                                            val
                                                                                                ? Number(
                                                                                                      val,
                                                                                                  )
                                                                                                : null,
                                                                                        )
                                                                                    }
                                                                                    placeholder="Select account..."
                                                                                />
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex min-h-10 items-center">
                                                                            {isVoucher ? (
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {(
                                                                                        rule.account_ids ||
                                                                                        []
                                                                                    )
                                                                                        .length >
                                                                                    0 ? (
                                                                                        rule.account_ids.map(
                                                                                            (
                                                                                                id: number,
                                                                                            ) => {
                                                                                                const acc =
                                                                                                    accounts.find(
                                                                                                        (
                                                                                                            a,
                                                                                                        ) =>
                                                                                                            a.id ===
                                                                                                            id,
                                                                                                    );
                                                                                                return acc ? (
                                                                                                    <Badge
                                                                                                        key={
                                                                                                            id
                                                                                                        }
                                                                                                        variant="outline"
                                                                                                        className="rounded-full text-secondary-foreground"
                                                                                                    >
                                                                                                        {
                                                                                                            acc.name
                                                                                                        }
                                                                                                    </Badge>
                                                                                                ) : null;
                                                                                            },
                                                                                        )
                                                                                    ) : (
                                                                                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
                                                                                            <Info className="h-3 w-3" />{' '}
                                                                                            All
                                                                                            system
                                                                                            accounts
                                                                                            authorized
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            ) : rule.accounts &&
                                                                              rule
                                                                                  .accounts
                                                                                  .length >
                                                                                  0 ? (
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {rule.accounts.map(
                                                                                        (
                                                                                            account: PostingRuleAccountType,
                                                                                        ) => (
                                                                                            <div
                                                                                                key={
                                                                                                    account.id
                                                                                                }
                                                                                                className="flex items-center gap-2"
                                                                                            >
                                                                                                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                                                                                                    {
                                                                                                        account.code
                                                                                                    }
                                                                                                </span>
                                                                                                <span className="text-sm font-medium text-foreground/80">
                                                                                                    {
                                                                                                        account.name
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        ),
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-sm text-muted-foreground italic">
                                                                                    {rule.is_dynamic ? (
                                                                                        <span className="flex items-center gap-2 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold tracking-wider text-blue-600 uppercase">
                                                                                            Dynamic:{' '}
                                                                                            {
                                                                                                rule.dynamic_key
                                                                                            }
                                                                                        </span>
                                                                                    ) : (
                                                                                        'Not assigned'
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <span className="font-semibold text-foreground/90">
                                                                            {rule.description ||
                                                                                rule.event.replace(
                                                                                    '_',
                                                                                    ' ',
                                                                                )}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Switch
                                                                        disabled={
                                                                            !isEditing
                                                                        }
                                                                        checked={
                                                                            isEditing
                                                                                ? editData?.is_active
                                                                                : rule.is_active
                                                                        }
                                                                        onCheckedChange={(
                                                                            val: boolean,
                                                                        ) =>
                                                                            updateRule(
                                                                                rule.id,
                                                                                'is_active',
                                                                                val,
                                                                            )
                                                                        }
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    },
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </Tabs>
            </main>
        </AppLayout>
    );
}
