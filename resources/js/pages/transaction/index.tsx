import { DatePicker } from '@/components/custom-inputs/date-picker';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { SimplePaginationData } from '@/types/simple-paginate-type';
import type { TransactionType } from '@/types/transaction-type';
import { router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowDownRight,
    ArrowUpRight,
    FileDown,
    Search,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounting', href: '#' },
    { title: 'Transactions', href: '#' },
];

export default function Index({
    transactions,
    filters,
    summary,
}: {
    transactions: SimplePaginationData<TransactionType>;
    filters: {
        date_start?: string;
        date_end?: string;
        search?: string;
        type?: string[];
        [key: string]: string | string[] | number | boolean | undefined;
    };
    summary: { total_debit: string; total_credit: string; net_balance: string };
}) {
    const [dateStart, setDateStart] = useState<Date | undefined>(
        filters?.date_start ? new Date(filters.date_start) : undefined,
    );
    const [dateEnd, setDateEnd] = useState<Date | undefined>(
        filters?.date_end ? new Date(filters.date_end) : undefined,
    );

    // Adjust state when filters prop changes (e.g. via navigation)
    const [prevFilters, setPrevFilters] = useState(filters);
    if (
        filters?.date_start !== prevFilters?.date_start ||
        filters?.date_end !== prevFilters?.date_end
    ) {
        setPrevFilters(filters);
        setDateStart(
            filters?.date_start ? new Date(filters.date_start) : undefined,
        );
        setDateEnd(filters?.date_end ? new Date(filters.date_end) : undefined);
    }

    const handleDateSearch = () => {
        router.get(
            window.location.pathname,
            {
                ...filters,
                date_start: dateStart ? format(dateStart, 'yyyy-MM-dd') : '',
                date_end: dateEnd ? format(dateEnd, 'yyyy-MM-dd') : '',
            },
            { preserveState: true },
        );
    };

    const handleClearDates = () => {
        setDateStart(undefined);
        setDateEnd(undefined);
        const newFilters = { ...filters };
        delete newFilters.date_start;
        delete newFilters.date_end;
        router.get(window.location.pathname, newFilters, {
            preserveState: true,
        });
    };

    const columns = useMemo<ColumnDef<TransactionType>[]>(
        () => [
            {
                accessorKey: 'transaction_group.date_time',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Date" />
                ),
                cell: ({ row }) => (
                    <div className="text-sm">
                        {format(
                            new Date(
                                row.original.transaction_group?.date_time ||
                                    row.original.created_at,
                            ),
                            'dd MMM, yyyy',
                        )}
                    </div>
                ),
            },
            {
                id: 'type',
                accessorFn: (row) => row.type.value,
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Type" />
                ),
                cell: ({ row }) => (
                    <Badge
                        variant={
                            row.original.type.value === 'debit'
                                ? 'default'
                                : 'destructive'
                        }
                    >
                        {row.original.type.label.toUpperCase()}
                    </Badge>
                ),
            },
            {
                accessorKey: 'amount',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Amount" />
                ),
                cell: ({ row }) => (
                    <div className="font-medium">
                        {parseFloat(row.original.amount.toString()).toFixed(2)}
                    </div>
                ),
            },
            {
                accessorKey: 'account.name',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Account" />
                ),
                cell: ({ row }) => (
                    <div className="text-sm">{row.original.account?.name}</div>
                ),
            },
            {
                accessorKey: 'transaction_group.source_type',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Document" />
                ),
                cell: ({ row }) => (
                    <div className="text-sm">
                        {row.original.transaction_group?.source_type
                            ?.split('\\')
                            .pop()}
                    </div>
                ),
            },
            {
                accessorKey: 'transaction_group.reference',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Reference" />
                ),
                cell: ({ row }) => (
                    <div className="text-sm">
                        {row.original.transaction_group?.reference || '-'}
                    </div>
                ),
            },
            {
                accessorKey: 'description',
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Description"
                    />
                ),
                cell: ({ row }) => (
                    <div className="text-xs">
                        {row.original.description ||
                            row.original.transaction_group?.description ||
                            '-'}
                    </div>
                ),
            },
        ],
        [],
    );

    const tableConfig = useMemo(
        () => ({
            searchPlaceholder: 'Search reference or description...',
            enableClientSideFiltering: false,
            enableClientSideSorting: false,
            filters: [
                {
                    column: 'type',
                    title: 'Type',
                    options: [
                        { label: 'Debit', value: 'debit' },
                        { label: 'Credit', value: 'credit' },
                    ],
                },
            ],
        }),
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <main className="space-y-4 p-4">
                <Heading
                    title="Transaction Records"
                    description="Full ledger of all financial transactions across accounts."
                />

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-emerald-500/20 bg-emerald-500/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Credit
                            </CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-500">
                                {parseFloat(
                                    summary.total_credit || '0',
                                ).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-rose-500/20 bg-rose-500/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Debit
                            </CardTitle>
                            <ArrowDownRight className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-500">
                                {parseFloat(summary.total_debit || '0').toFixed(
                                    2,
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">
                                Net Balance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {parseFloat(summary.net_balance || '0').toFixed(
                                    2,
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-4 rounded-lg border border-border/50 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center space-x-2">
                        <div className="grid gap-2">
                            <DatePicker
                                id="date_start"
                                name={'date_start'}
                                date={dateStart}
                                onDateChange={setDateStart}
                                placeholder="Start Date"
                            />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            to
                        </span>
                        <div className="grid gap-2">
                            <DatePicker
                                id="date_end"
                                name={'date_end'}
                                date={dateEnd}
                                onDateChange={setDateEnd}
                                placeholder="End Date"
                            />
                        </div>
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleDateSearch}
                        >
                            <Search className="mr-1 h-4 w-4" /> Filter
                        </Button>
                        {(dateStart || dateEnd) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleClearDates}
                            >
                                <X className="mr-1 h-4 w-4" /> Clear
                            </Button>
                        )}
                    </div>
                    <Button variant="outline" size="sm">
                        <FileDown className="mr-1 h-4 w-4" /> Export CSV
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={transactions.data}
                    pagination={transactions}
                    config={tableConfig}
                />
            </main>
        </AppLayout>
    );
}
