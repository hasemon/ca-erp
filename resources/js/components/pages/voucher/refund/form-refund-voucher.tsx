import { AccountSelect } from '@/components/account-select';
import { DatePicker } from '@/components/custom-inputs/date-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import refund from '@/routes/vouchers/refund';
import { AccountType } from '@/types/account-type';
import { VoucherType } from '@/types/voucher-type';
import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface RefundVoucherProps {
    debitAccounts: AccountType[];
    creditAccounts: AccountType[];
    contacts: { id: number; name: string }[];
    voucher?: VoucherType;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function itemTypeValue(item: VoucherType['voucher_items'][number]) {
    return typeof item.type === 'object' ? item.type.value : item.type;
}

export function FormRefundVoucher({
    debitAccounts,
    creditAccounts,
    contacts,
    voucher,
    onSuccess,
    onCancel,
}: RefundVoucherProps) {
    const isEditing = !!voucher;

    const [voucherNo, setVoucherNo] = useState(
        () =>
            voucher?.voucher_no ||
            `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        voucher ? new Date(voucher.date_time) : new Date(),
    );
    const [refundedToId, setRefundedToId] = useState(() => {
        const bpItem = voucher?.voucher_items.find(
            (i) => i.business_partner?.id,
        );
        return bpItem ? String(bpItem.business_partner?.id) : '';
    });
    const [debitAccountId, setDebitAccountId] = useState<
        string | number | null
    >(
        () =>
            voucher?.voucher_items.find((i) => itemTypeValue(i) === 'debit')
                ?.account_id || null,
    );
    const [payFromAccountId, setPayFromAccountId] = useState<
        string | number | null
    >(
        () =>
            voucher?.voucher_items.find((i) => itemTypeValue(i) === 'credit')
                ?.account_id || null,
    );
    const [reference, setReference] = useState(
        () =>
            voucher?.voucher_items.find((i) => i.remarks)?.remarks ||
            `TXN-${new Date().getTime()}`,
    );
    const [status, setStatus] = useState(() => {
        if (voucher?.status) {
            return typeof voucher.status === 'object'
                ? voucher.status.value
                : voucher.status;
        }

        return 'approved';
    });

    return (
        <Form
            action={
                isEditing ? refund.update.url(voucher?.id) : refund.store.url()
            }
            method={isEditing ? 'put' : 'post'}
            disableWhileProcessing
            onSuccess={() => {
                toast.success(
                    isEditing
                        ? 'Refund voucher updated successfully'
                        : 'Refund voucher created successfully',
                );
                if (!isEditing) {
                    setVoucherNo(
                        `REF-${Math.floor(1000 + Math.random() * 9000)}`,
                    );
                    setSelectedDate(new Date());
                    setRefundedToId('');
                    setDebitAccountId(null);
                    setPayFromAccountId(null);
                    setReference(`TXN-${new Date().getTime()}`);
                }
                if (onSuccess) onSuccess();
            }}
            resetOnSuccess={
                !isEditing
                    ? [
                          'voucher_no',
                          'date_time',
                          'refunded_to_id',
                          'debit_account_id',
                          'pay_from_account_id',
                          'amount',
                          'reference',
                          'description',
                          'status',
                      ]
                    : []
            }
            onError={(err) => {
                Object.values(err).forEach((msg) => toast.error(msg as string));
            }}
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    <input type="hidden" name="status" value={status} />
                    <input
                        type="hidden"
                        name="refunded_to_id"
                        value={refundedToId}
                    />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="voucher_no">Voucher No</Label>
                            <Input
                                id="voucher_no"
                                name="voucher_no"
                                value={voucherNo}
                                onChange={(e) => setVoucherNo(e.target.value)}
                            />
                            <InputError message={errors.voucher_no} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date_time">Date</Label>
                            <DatePicker
                                id="date_time"
                                name="date_time"
                                date={selectedDate}
                                onDateChange={setSelectedDate}
                                placeholder="Choose a date"
                            />
                            <InputError message={errors.date_time} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="refunded_to_id">Refunded To</Label>
                        <Select
                            value={refundedToId}
                            onValueChange={setRefundedToId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select customer..." />
                            </SelectTrigger>
                            <SelectContent>
                                {contacts.map((contact) => (
                                    <SelectItem
                                        key={contact.id}
                                        value={contact.id.toString()}
                                    >
                                        {contact.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.refunded_to_id} />
                    </div>

                    <section className="space-y-4 border bg-card p-4 shadow-xs">
                        <h3 className="text-sm font-semibold">
                            Payment Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Refund Amount</Label>
                                <Input
                                    id="amount"
                                    name="amount"
                                    type="number"
                                    step="0.01"
                                    defaultValue={voucher?.total_amount || ''}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.amount} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="debit_account_id">
                                    Account Head (Debit)
                                </Label>
                                <AccountSelect
                                    accounts={debitAccounts}
                                    name="debit_account_id"
                                    value={debitAccountId}
                                    onValueChange={setDebitAccountId}
                                    placeholder="Select Account..."
                                />
                                <InputError
                                    message={errors.debit_account_id}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pay_from_account_id">
                                    Pay From Account
                                </Label>
                                <AccountSelect
                                    accounts={creditAccounts}
                                    name="pay_from_account_id"
                                    value={payFromAccountId}
                                    onValueChange={setPayFromAccountId}
                                    placeholder="Select Account..."
                                />
                                <InputError
                                    message={errors.pay_from_account_id}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="reference">
                                    Transaction Reference
                                </Label>
                                <Input
                                    id="reference"
                                    name="reference"
                                    value={reference}
                                    onChange={(e) =>
                                        setReference(e.target.value)
                                    }
                                    placeholder="TXN-..."
                                />
                                <InputError message={errors.reference} />
                            </div>
                        </div>
                    </section>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Remark/Reason</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={voucher?.description || ''}
                            placeholder="Add any remarks or notes..."
                        />
                        <InputError message={errors.description} />
                    </div>

                    <section className="flex items-center justify-end gap-2">
                        <Button
                            tabIndex={5}
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                if (onCancel) onCancel();
                                else window.history.back();
                            }}
                        >
                            Cancel
                        </Button>
                        {!isEditing && (
                            <Button
                                disabled={processing}
                                type="submit"
                                variant="outline"
                                onClick={() => setStatus('draft')}
                                tabIndex={6}
                            >
                                {processing && status === 'draft' && (
                                    <Spinner />
                                )}
                                Draft
                            </Button>
                        )}
                        <Button
                            disabled={processing}
                            type="submit"
                            onClick={() => setStatus('approved')}
                            tabIndex={7}
                        >
                            {processing && status === 'approved' && <Spinner />}
                            Save
                        </Button>
                    </section>
                </div>
            )}
        </Form>
    );
}
