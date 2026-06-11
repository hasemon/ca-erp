import VoucherController from '@/actions/App/Http/Controllers/VoucherController';
import { AdvanceVoucherPDF } from '@/components/pages/voucher/advance/advance-voucher-pdf';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCan } from '@/hooks/use-can';
import { handlePrint } from '@/lib/utils';
import advance from '@/routes/vouchers/advance';
import { VoucherType } from '@/types/voucher-type';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { Lock, LockOpen, Pencil, Printer, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShowAdvanceVoucherProps {
    voucher: VoucherType;
    onEdit: () => void;
    onDeleted?: () => void;
}

export function ShowAdvanceVoucher({
    voucher,
    onEdit,
    onDeleted,
}: ShowAdvanceVoucherProps) {
    const [isPrinting, setIsPrinting] = useState(false);
    const { can } = useCan();

    const advanceType = voucher.data?.advance_type || 'given';
    const isEditable =
        voucher.status.value === 'draft' ||
        (voucher.status.value === 'approved' && !voucher.is_locked);
    const canUnlock = can('voucher-secure.access');
    const person = voucher.voucher_items.find(
        (i) => i.business_partner,
    )?.business_partner;
    const advanceItem = voucher.voucher_items.find((i) =>
        advanceType === 'given'
            ? i.type.value === 'debit'
            : i.type.value === 'credit',
    );
    const cashItem = voucher.voucher_items.find((i) =>
        advanceType === 'given'
            ? i.type.value === 'credit'
            : i.type.value === 'debit',
    );

    const printVoucher = async () => {
        await handlePrint({
            pdfDocument: <AdvanceVoucherPDF voucher={voucher} />,
            documentTitle: `Advance_Voucher_${voucher.voucher_no}`,
            onBeforePrint: () => setIsPrinting(true),
            onAfterPrint: () => setIsPrinting(false),
            onError: () =>
                toast.error('Printing unavailable. Please try again.'),
        });
    };

    const handleDelete = () => {
        router.delete(advance.destroy.url(voucher.id), {
            preserveScroll: true,
            onSuccess: () => {
                if (onDeleted) onDeleted();
                toast.success('Voucher deleted successfully.');
            },
            onError: () => {
                toast.error('Failed to delete voucher.');
            },
        });
    };

    const handleLock = () => {
        router.post(
            VoucherController.lock.url(voucher.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                    toast.success('Voucher locked successfully.');
                },
                onError: () => {
                    toast.error('Failed to lock voucher.');
                },
            },
        );
    };

    const handleUnlock = () => {
        router.post(
            VoucherController.unlock.url(voucher.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    router.reload();
                    toast.success('Voucher unlocked successfully.');
                },
                onError: () => {
                    toast.error('Failed to unlock voucher.');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">
                        Advance voucher ({voucher.voucher_no})
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {voucher.status.value === 'approved' &&
                        (voucher.is_locked ? (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        title={
                                            canUnlock
                                                ? 'Unlock voucher for editing'
                                                : 'You need voucher-secure.access permission'
                                        }
                                    >
                                        <Lock className="size-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Unlock Voucher?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Unlocking allows editing this
                                            approved voucher. When saved, the
                                            original journal will be reversed
                                            and a corrected entry will be
                                            posted.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleUnlock}
                                        >
                                            Unlock
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : (
                            <Button
                                size="icon"
                                variant="outline"
                                title="Lock voucher"
                                onClick={handleLock}
                            >
                                <LockOpen className="size-4" />
                            </Button>
                        ))}

                    <Button
                        size="icon"
                        onClick={printVoucher}
                        disabled={isPrinting}
                    >
                        <Printer />
                    </Button>

                    {(voucher.status.value === 'draft' ||
                        (voucher.status.value === 'approved' &&
                            !voucher.is_locked)) && (
                        <>
                            <Button
                                variant="outline"
                                size="icon"
                                disabled={!isEditable}
                                onClick={onEdit}
                            >
                                <Pencil />
                            </Button>

                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="destructive">
                                        <Trash />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {voucher.status.value === 'draft'
                                                ? 'This will permanently delete this draft voucher.'
                                                : 'This will void the voucher and create a reversal journal entry to maintain proper accounting records.'}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                        >
                                            {voucher.status.value === 'draft'
                                                ? 'Delete'
                                                : 'Void Voucher'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="relative mx-4 bg-muted p-2">
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                        <Badge
                            variant={
                                voucher.status.value === 'approved'
                                    ? 'default'
                                    : voucher.status.value === 'draft'
                                      ? 'destructive'
                                      : 'outline'
                            }
                        >
                            {voucher.status.label}
                        </Badge>
                    </div>
                    <div className="mb-6 text-sm font-medium text-muted-foreground">
                        #{voucher.voucher_no}
                    </div>
                    <div className="mb-2 space-y-2 text-center">
                        <div className="text-4xl font-bold tracking-tight">
                            {Number(voucher.total_amount).toLocaleString(
                                'en-IN',
                                {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                },
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {format(new Date(voucher.date_time), 'PPP')}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t bg-card p-8">
                    <div>
                        <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            {advanceType === 'given'
                                ? 'Given To'
                                : 'Received From'}
                        </div>
                        <div className="text-base font-semibold">
                            {person?.name || '-'}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Advance Type
                        </div>
                        <div className="text-base font-semibold capitalize">
                            Advance {advanceType}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Transaction Ref
                        </div>
                        <div className="text-base font-semibold">
                            {voucher.voucher_items.find((i) => i.remarks)
                                ?.remarks || '-'}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Account Head
                        </div>
                        <div className="text-base font-semibold">
                            {advanceItem?.account?.name}
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            {advanceType === 'given'
                                ? 'Pay From Account'
                                : 'Receive In Account'}
                        </div>
                        <div className="text-base font-semibold">
                            {cashItem?.account?.name}
                        </div>
                    </div>
                </div>

                {voucher.description && (
                    <div className="px-8 pb-8">
                        <div className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                            Reason
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {voucher.description}
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}
