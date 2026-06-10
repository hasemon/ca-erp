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
import expense from '@/routes/vouchers/expense';
import { AccountType } from '@/types/account-type';
import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

import { VoucherType } from '@/types/voucher-type';

interface ExpenseVoucherProps {
    debitAccounts: AccountType[];
    creditAccounts: AccountType[];
    contacts: { id: number; name: string }[];
    voucher?: VoucherType;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function FormExpenseVoucher({
    debitAccounts,
    creditAccounts,
    contacts,
    voucher,
    onSuccess,
    onCancel,
}: ExpenseVoucherProps) {
    const isEditing = !!voucher;

    const [voucherNo, setVoucherNo] = useState(
        () =>
            voucher?.voucher_no ||
            `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        voucher ? new Date(voucher.date_time) : new Date(),
    );
    const [paidToId, setPaidToId] = useState(() => {
        const bpItem = voucher?.voucher_items.find(
            (i) => i.business_partner?.id,
        );
        return bpItem ? String(bpItem.business_partner?.id) : '';
    });
    const [expenseAccountId, setExpenseAccountId] = useState<
        string | number | null
    >(
        () =>
            voucher?.voucher_items.find((i) => {
                const itemType =
                    typeof i.type === 'object' ? i.type.value : i.type;
                return itemType === 'debit';
            })?.account_id || null,
    );
    const [sourceAccountId, setSourceAccountId] = useState<
        string | number | null
    >(
        () =>
            voucher?.voucher_items.find((i) => {
                const itemType =
                    typeof i.type === 'object' ? i.type.value : i.type;
                return itemType === 'credit';
            })?.account_id || null,
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
                isEditing
                    ? expense.update.url(voucher?.id)
                    : expense.store.url()
            }
            method={isEditing ? 'put' : 'post'}
            disableWhileProcessing
            onSuccess={() => {
                toast.success(
                    isEditing
                        ? 'Expense voucher updated successfully'
                        : 'Expense voucher created successfully',
                );
                if (!isEditing) {
                    setReference('');
                    setExpenseAccountId(null);
                    setSourceAccountId(null);
                    setVoucherNo(
                        `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
                    );
                    setSelectedDate(new Date());
                    setReference(`TXN-${new Date().getTime()}`);
                }
                if (onSuccess) onSuccess();
            }}
            resetOnSuccess={
                !isEditing
                    ? [
                          'voucher_no',
                          'date_time',
                          'reference',
                          'expense_account_id',
                          'source_account_id',
                          'paid_to_id',
                          'amount',
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
                    <div className="grid grid-cols-2 gap-4">
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
                                name={'date_time'}
                                date={selectedDate}
                                onDateChange={setSelectedDate}
                                placeholder="Choose a date"
                            />
                            <InputError message={errors.date_time} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="expense_account_id">
                                Expense Head (Debit)
                            </Label>
                            <AccountSelect
                                accounts={debitAccounts}
                                name="expense_account_id"
                                value={expenseAccountId}
                                onValueChange={setExpenseAccountId}
                                placeholder="Select expense category..."
                            />
                            <InputError message={errors.expense_account_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="paid_to_id">Paid To</Label>
                            <Select
                                name="paid_to_id"
                                value={paidToId}
                                onValueChange={setPaidToId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contact..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts?.map((contact) => (
                                        <SelectItem
                                            key={contact.id}
                                            value={contact.id.toString()}
                                        >
                                            {contact.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.paid_to_id} />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="amount">Amount</Label>
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
                            <Label htmlFor="source_account_id">
                                Pay From (Credit)
                            </Label>
                            <AccountSelect
                                accounts={creditAccounts}
                                name="source_account_id"
                                value={sourceAccountId}
                                onValueChange={setSourceAccountId}
                                placeholder="Select bank/cash account..."
                            />
                            <InputError message={errors.source_account_id} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reference">
                                Transaction Reference
                            </Label>
                            <Input
                                id="reference"
                                name="reference"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="TXN-..."
                            />
                            <InputError message={errors.reference} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={voucher?.description || ''}
                            placeholder="Add description..."
                        />
                        <InputError message={errors.description} />
                    </div>
                    <section className={'flex items-center justify-end gap-2'}>
                        <Button
                            tabIndex={5}
                            type="button"
                            variant={'secondary'}
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
