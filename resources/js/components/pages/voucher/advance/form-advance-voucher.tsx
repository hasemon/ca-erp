import { AccountSelect } from '@/components/account-select';
import { DatePicker } from '@/components/custom-inputs/date-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import advance from '@/routes/vouchers/advance';
import { AccountType } from '@/types/account-type';
import { VoucherType } from '@/types/voucher-type';
import { Form } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

type AdvanceType = 'given' | 'received';

interface AdvanceVoucherProps {
    givenAdvanceAccounts: AccountType[];
    givenCashAccounts: AccountType[];
    receivedCashAccounts: AccountType[];
    receivedAdvanceAccounts: AccountType[];
    contacts: { id: number; name: string }[];
    voucher?: VoucherType;
    onSuccess?: () => void;
    onCancel?: () => void;
}

function itemTypeValue(item: VoucherType['voucher_items'][number]) {
    return typeof item.type === 'object' ? item.type.value : item.type;
}

export function FormAdvanceVoucher({
    givenAdvanceAccounts,
    givenCashAccounts,
    receivedCashAccounts,
    receivedAdvanceAccounts,
    contacts,
    voucher,
    onSuccess,
    onCancel,
}: AdvanceVoucherProps) {
    const isEditing = !!voucher;
    const initialAdvanceType = voucher?.data?.advance_type || 'given';

    const [voucherNo, setVoucherNo] = useState(
        () =>
            voucher?.voucher_no ||
            `ADV-${Math.floor(1000 + Math.random() * 9000)}`,
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        voucher ? new Date(voucher.date_time) : new Date(),
    );
    const [advanceType, setAdvanceType] =
        useState<AdvanceType>(initialAdvanceType);
    const [businessPartnerId, setBusinessPartnerId] = useState(() => {
        const bpItem = voucher?.voucher_items.find(
            (i) => i.business_partner?.id,
        );
        return bpItem ? String(bpItem.business_partner?.id) : '';
    });
    const [advanceAccountId, setAdvanceAccountId] = useState<
        string | number | null
    >(
        () =>
            voucher?.voucher_items.find((i) =>
                initialAdvanceType === 'given'
                    ? itemTypeValue(i) === 'debit'
                    : itemTypeValue(i) === 'credit',
            )?.account_id || null,
    );
    const [cashAccountId, setCashAccountId] = useState<string | number | null>(
        () =>
            voucher?.voucher_items.find((i) =>
                initialAdvanceType === 'given'
                    ? itemTypeValue(i) === 'credit'
                    : itemTypeValue(i) === 'debit',
            )?.account_id || null,
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

    const advanceAccounts =
        advanceType === 'given'
            ? givenAdvanceAccounts
            : receivedAdvanceAccounts;
    const cashAccounts =
        advanceType === 'given' ? givenCashAccounts : receivedCashAccounts;

    const resetAccountSelections = (nextType: AdvanceType) => {
        setAdvanceType(nextType);
        setAdvanceAccountId(null);
        setCashAccountId(null);
    };

    return (
        <Form
            action={
                isEditing
                    ? advance.update.url(voucher?.id)
                    : advance.store.url()
            }
            method={isEditing ? 'put' : 'post'}
            disableWhileProcessing
            onSuccess={() => {
                toast.success(
                    isEditing
                        ? 'Advance voucher updated successfully'
                        : 'Advance voucher created successfully',
                );
                if (!isEditing) {
                    setVoucherNo(
                        `ADV-${Math.floor(1000 + Math.random() * 9000)}`,
                    );
                    setSelectedDate(new Date());
                    setAdvanceType('given');
                    setBusinessPartnerId('none');
                    setAdvanceAccountId(null);
                    setCashAccountId(null);
                    setReference(`TXN-${new Date().getTime()}`);
                }
                if (onSuccess) onSuccess();
            }}
            resetOnSuccess={
                !isEditing
                    ? [
                          'voucher_no',
                          'date_time',
                          'advance_type',
                          'business_partner_id',
                          'advance_account_id',
                          'cash_account_id',
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
                        name="advance_type"
                        value={advanceType}
                    />
                    <input
                        type="hidden"
                        name="business_partner_id"
                        value={
                            businessPartnerId === 'none'
                                ? ''
                                : businessPartnerId
                        }
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

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="business_partner_id">
                                {advanceType === 'given'
                                    ? 'Given To'
                                    : 'Received From'}
                            </Label>
                            <Select
                                value={businessPartnerId}
                                onValueChange={setBusinessPartnerId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select person..." />
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
                            <InputError message={errors.business_partner_id} />
                        </div>
                        <div className="grid gap-3">
                            <Label>Advance Type</Label>
                            <RadioGroup
                                value={advanceType}
                                onValueChange={(value) =>
                                    resetAccountSelections(
                                        value as AdvanceType,
                                    )
                                }
                                className="flex min-h-10 items-center gap-5"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        id="advance_given"
                                        value="given"
                                    />
                                    <Label
                                        htmlFor="advance_given"
                                        className="font-normal"
                                    >
                                        Advance Given
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        id="advance_received"
                                        value="received"
                                    />
                                    <Label
                                        htmlFor="advance_received"
                                        className="font-normal"
                                    >
                                        Advance Received
                                    </Label>
                                </div>
                            </RadioGroup>
                            <InputError message={errors.advance_type} />
                        </div>
                    </div>

                    <section className="space-y-4 border bg-card p-4 shadow-xs">
                        <h3 className="text-sm font-semibold">
                            Payment Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                <Label htmlFor="advance_account_id">
                                    Account Head
                                </Label>
                                <AccountSelect
                                    accounts={advanceAccounts}
                                    name="advance_account_id"
                                    value={advanceAccountId}
                                    onValueChange={setAdvanceAccountId}
                                    placeholder="Select account..."
                                />
                                <InputError
                                    message={errors.advance_account_id}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cash_account_id">
                                    {advanceType === 'given'
                                        ? 'Pay From Account'
                                        : 'Receive In Account'}
                                </Label>
                                <AccountSelect
                                    accounts={cashAccounts}
                                    name="cash_account_id"
                                    value={cashAccountId}
                                    onValueChange={setCashAccountId}
                                    placeholder="Select account..."
                                />
                                <InputError message={errors.cash_account_id} />
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
                        <Label htmlFor="description">Reason</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={voucher?.description || ''}
                            placeholder="Enter reason or remarks..."
                        />
                        <InputError message={errors.description} />
                    </div>

                    <section className="flex items-center justify-end gap-2">
                        <Button
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
