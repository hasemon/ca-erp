import Heading from '@/components/heading';
import { FormExpenseVoucher } from '@/components/pages/voucher/expense/form-expense-voucher';
import { ShowExpenseVoucher } from '@/components/pages/voucher/expense/show-expense-voucher';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Empty,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from '@/components/ui/input-group';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSearchQuery } from '@/hooks/use-search-debounced';
import { useVoucherStatusFilter } from '@/hooks/use-voucher-status-filter';
import VoucherLayout from '@/layouts/voucher-layout';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';
import { AccountType } from '@/types/account-type';
import { SimplePaginationData } from '@/types/simple-paginate-type';
import { VoucherType } from '@/types/voucher-type';
import { InfiniteScroll } from '@inertiajs/react';
import { format } from 'date-fns';
import { Banknote, Plus, SearchIcon } from 'lucide-react';
import { useState } from 'react';

interface ExpenseVoucherProps {
    debitAccounts: AccountType[];
    creditAccounts: AccountType[];
    contacts: { id: number; name: string }[];
    vouchers: SimplePaginationData<VoucherType>;
    voucherStatuses: { value: string; label: string }[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vouchers', href: '#' },
    { title: 'Expense', href: '#' },
];

export default function ExpenseVoucher({
    debitAccounts,
    creditAccounts,
    contacts,
    vouchers,
    voucherStatuses,
}: ExpenseVoucherProps) {
    const { searchValue, handleChange } = useSearchQuery();
    const { currentStatus, handleStatusChange } = useVoucherStatusFilter();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<VoucherType | null>(
        null,
    );

    const currentVoucher = selectedVoucher
        ? vouchers.data.find((v) => v.id === selectedVoucher.id) ||
          selectedVoucher
        : null;

    return (
        <VoucherLayout
            breadcrumbs={breadcrumbs}
            header={
                <div className="grid gap-1.5">
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Search..."
                            value={searchValue}
                            onChange={handleChange}
                        />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                    </InputGroup>
                    <ToggleGroup
                        variant={'outline'}
                        type="single"
                        value={currentStatus}
                        onValueChange={handleStatusChange}
                        className="w-full"
                    >
                        {voucherStatuses.map((status) => (
                            <ToggleGroupItem
                                key={status.value}
                                value={status.value}
                                size="sm"
                                className="flex-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                            >
                                {status.label}
                            </ToggleGroupItem>
                        ))}
                    </ToggleGroup>
                </div>
            }
            footer={
                <SidebarMenuButton
                    variant={'primary'}
                    onClick={() => {
                        setSelectedVoucher(null);
                        setIsEditing(false);
                    }}
                >
                    <Plus />
                    <span>Expense voucher</span>
                </SidebarMenuButton>
            }
            sidebar={
                <div className="m-0">
                    <InfiniteScroll data="vouchers" className="space-y-2">
                        {vouchers.data.map((voucher: VoucherType) => (
                            <Card
                                key={voucher.id}
                                size="sm"
                                className={cn(
                                    'mx-auto w-full max-w-sm cursor-pointer transition-colors hover:bg-muted/50',
                                    selectedVoucher?.id === voucher.id &&
                                        'border-2 border-primary',
                                )}
                                onClick={() => {
                                    setSelectedVoucher(voucher);
                                    setIsEditing(false);
                                }}
                            >
                                <CardHeader>
                                    <CardTitle>{voucher.voucher_no}</CardTitle>
                                    <CardDescription className="font-semibold">
                                        {
                                            voucher.voucher_items?.find(
                                                (item) => item.business_partner,
                                            )?.business_partner?.name
                                        }
                                    </CardDescription>
                                    <CardAction>
                                        <div className="text-xs text-muted-foreground">
                                            {format(
                                                new Date(voucher.date_time),
                                                'dd/MM/yy',
                                            )}
                                        </div>
                                    </CardAction>
                                </CardHeader>
                                <CardContent>
                                    <p className="line-clamp-2 text-xs text-muted-foreground capitalize">
                                        {voucher.description}
                                    </p>
                                </CardContent>
                                <CardFooter className="flex items-center justify-between gap-2">
                                    <Badge
                                        variant={
                                            voucher.status.value === 'approved'
                                                ? 'default'
                                                : voucher.status.value ===
                                                    'draft'
                                                  ? 'outline'
                                                  : 'destructive'
                                        }
                                    >
                                        {voucher.status.label}
                                    </Badge>
                                    <p className="text-sm font-bold">
                                        {voucher.total_amount}
                                    </p>
                                </CardFooter>
                            </Card>
                        ))}
                        {vouchers.data.length === 0 && (
                            <Empty>
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Banknote />
                                    </EmptyMedia>
                                    <EmptyTitle>No Vouchers found!</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        )}
                    </InfiniteScroll>
                </div>
            }
        >
            <main className="space-y-4 p-4">
                {currentVoucher && !isEditing ? (
                    <ShowExpenseVoucher
                        voucher={currentVoucher}
                        onEdit={() => setIsEditing(true)}
                        onDeleted={() => setSelectedVoucher(null)}
                    />
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <Heading
                                title={
                                    isEditing
                                        ? 'Edit Expense Voucher'
                                        : 'Create Expense Voucher'
                                }
                            />
                        </div>
                        <FormExpenseVoucher
                            debitAccounts={debitAccounts}
                            creditAccounts={creditAccounts}
                            contacts={contacts}
                            voucher={
                                isEditing && currentVoucher
                                    ? currentVoucher
                                    : undefined
                            }
                            onSuccess={() => setIsEditing(false)}
                            onCancel={() => setIsEditing(false)}
                        />
                    </>
                )}
            </main>
        </VoucherLayout>
    );
}
