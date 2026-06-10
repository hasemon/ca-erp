import { AccountSelect } from '@/components/account-select';
import { DatePicker } from '@/components/custom-inputs/date-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import journal from '@/routes/vouchers/journal';
import { AccountType } from '@/types/account-type';
import { VoucherType } from '@/types/voucher-type';
import { Form } from '@inertiajs/react';
import { Info, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface JournalItemFormType {
    account_id: string | number | null;
    business_partner_id: string | number | null;
    type: string;
    amount: string;
    remarks: string;
}

interface FormJournalVoucherProps {
    debitAccounts: AccountType[];
    creditAccounts: AccountType[];
    contacts: { id: number; name: string }[];
    voucher?: VoucherType;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function FormJournalVoucher({
    debitAccounts,
    creditAccounts,
    contacts,
    voucher,
    onSuccess,
    onCancel,
}: FormJournalVoucherProps) {
    const isEditing = !!voucher;

    const [voucherNo, setVoucherNo] = useState(() =>
        voucher
            ? voucher.voucher_no
            : `JV-${Math.floor(1000 + Math.random() * 9000)}`,
    );
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        voucher ? new Date(voucher.date_time) : new Date(),
    );

    const [items, setItems] = useState<JournalItemFormType[]>(() => {
        if (voucher && voucher.voucher_items) {
            return voucher.voucher_items.map((item) => ({
                account_id: item.account_id.toString(),
                business_partner_id: item.business_partner
                    ? item.business_partner.id.toString()
                    : '',
                type:
                    typeof item.type === 'object' ? item.type.value : item.type,
                amount: item.amount.toString(),
                remarks: item.remarks || '',
            }));
        }
        return [
            {
                account_id: '',
                business_partner_id: '',
                type: 'debit',
                amount: '',
                remarks: '',
            },
            {
                account_id: '',
                business_partner_id: '',
                type: 'credit',
                amount: '',
                remarks: '',
            },
        ];
    });

    const [status, setStatus] = useState(() => {
        if (voucher?.status) {
            return typeof voucher.status === 'object'
                ? voucher.status.value
                : voucher.status;
        }
        return 'approved';
    });

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                account_id: '',
                business_partner_id: '',
                type: 'debit',
                amount: '',
                remarks: '',
            },
        ]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = <K extends keyof JournalItemFormType>(
        index: number,
        field: K,
        value: JournalItemFormType[K],
    ) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const totalDebits = items
        .filter((item) => item.type === 'debit')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalCredits = items
        .filter((item) => item.type === 'credit')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const isBalanced =
        Math.abs(totalDebits - totalCredits) < 0.01 && totalDebits > 0;

    return (
        <Form
            action={
                isEditing
                    ? journal.update.url(voucher?.id)
                    : journal.store.url()
            }
            method={isEditing ? 'put' : 'post'}
            disableWhileProcessing
            onSuccess={() => {
                toast.success(
                    isEditing
                        ? 'Journal voucher updated successfully'
                        : 'Journal voucher created successfully',
                );
                if (!isEditing) {
                    setVoucherNo(
                        `JV-${Math.floor(1000 + Math.random() * 9000)}`,
                    );
                    setSelectedDate(new Date());
                    setItems([
                        {
                            account_id: '',
                            business_partner_id: '',
                            type: 'debit',
                            amount: '',
                            remarks: '',
                        },
                        {
                            account_id: '',
                            business_partner_id: '',
                            type: 'credit',
                            amount: '',
                            remarks: '',
                        },
                    ]);
                }
                if (onSuccess) onSuccess();
            }}
            onError={(err) => {
                Object.values(err).forEach((msg) => toast.error(msg as string));
            }}
        >
            {({ errors, processing }) => (
                <div className="space-y-6">
                    {/* Hidden inputs for status and date */}
                    <input type="hidden" name="status" value={status} />

                    {/* Hidden inputs for dynamic journal items */}
                    {items.map((item, index) => (
                        <div key={`hidden-${index}`}>
                            <input
                                type="hidden"
                                name={`items[${index}][type]`}
                                value={item.type}
                            />
                            <input
                                type="hidden"
                                name={`items[${index}][account_id]`}
                                value={item.account_id?.toString() ?? ''}
                            />
                            <input
                                type="hidden"
                                name={`items[${index}][business_partner_id]`}
                                value={
                                    item.business_partner_id === ''
                                        ? ''
                                        : (item.business_partner_id?.toString() ??
                                          '')
                                }
                            />
                            <input
                                type="hidden"
                                name={`items[${index}][amount]`}
                                value={item.amount}
                            />
                            <input
                                type="hidden"
                                name={`items[${index}][remarks]`}
                                value={item.remarks}
                            />
                        </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="voucher_no">Voucher No</Label>
                            <Input
                                id="voucher_no"
                                name="voucher_no"
                                value={voucherNo}
                                onChange={(e) => setVoucherNo(e.target.value)}
                                disabled={isEditing}
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
                        <div className="col-span-2 grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={voucher?.description || ''}
                                placeholder="Add description..."
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>

                    <Card className="p-0">
                        <CardContent className="p-0">
                            <div className="flex items-center justify-between border-b bg-muted/50 p-4">
                                <h3 className="text-sm font-semibold">
                                    Journal Entries
                                </h3>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={handleAddItem}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Row
                                </Button>
                            </div>
                            <div className="space-y-4 p-4">
                                {items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid grid-cols-12 items-start gap-2"
                                    >
                                        <div className="col-span-2">
                                            <Select
                                                value={item.type}
                                                onValueChange={(val) =>
                                                    handleItemChange(
                                                        index,
                                                        'type',
                                                        val,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="debit">
                                                        Debit
                                                    </SelectItem>
                                                    <SelectItem value="credit">
                                                        Credit
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-3">
                                            <AccountSelect
                                                accounts={
                                                    item.type === 'debit'
                                                        ? debitAccounts
                                                        : creditAccounts
                                                }
                                                value={item.account_id}
                                                onValueChange={(val) =>
                                                    handleItemChange(
                                                        index,
                                                        'account_id',
                                                        val,
                                                    )
                                                }
                                                placeholder="Select account..."
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `items.${index}.account_id`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Select
                                                value={
                                                    item.business_partner_id?.toString() ??
                                                    ''
                                                }
                                                onValueChange={(val) =>
                                                    handleItemChange(
                                                        index,
                                                        'business_partner_id',
                                                        val,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Contact (Opt)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {contacts?.map(
                                                        (contact) => (
                                                            <SelectItem
                                                                key={contact.id}
                                                                value={contact.id.toString()}
                                                            >
                                                                {contact.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={item.amount}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        'amount',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="0.00"
                                            />
                                            <InputError
                                                message={
                                                    errors[
                                                        `items.${index}.amount`
                                                    ]
                                                }
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <Input
                                                value={item.remarks}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        'remarks',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Remarks..."
                                            />
                                        </div>
                                        <div className="col-span-1">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="w-full"
                                                onClick={() =>
                                                    handleRemoveItem(index)
                                                }
                                                disabled={items.length <= 2}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4 flex justify-end border-t pt-4 text-sm">
                                    <div className="flex space-x-8">
                                        <div className="flex flex-col items-end">
                                            <span className="text-muted-foreground">
                                                Total Debits
                                            </span>
                                            <span className="font-semibold text-blue-600 tabular-nums">
                                                {totalDebits.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-muted-foreground">
                                                Total Credits
                                            </span>
                                            <span className="font-semibold text-amber-600 tabular-nums">
                                                {totalCredits.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-muted-foreground">
                                                Difference
                                            </span>
                                            <span
                                                className={`font-bold tabular-nums ${totalDebits !== totalCredits ? 'text-red-500' : 'text-green-500'}`}
                                            >
                                                {Math.abs(
                                                    totalDebits - totalCredits,
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!isBalanced &&
                                    totalDebits > 0 &&
                                    totalCredits > 0 && (
                                        <div className="mt-4 flex gap-3 border border-rose-500/10 bg-rose-500/5 p-4">
                                            <div className="flex items-center justify-center">
                                                <Info className="h-5 w-5 shrink-0 text-rose-600" />
                                            </div>
                                            <p className="text-[11px] leading-normal text-rose-800">
                                                Difference of{' '}
                                                <b>
                                                    {(
                                                        totalDebits -
                                                        totalCredits
                                                    ).toFixed(2)}
                                                </b>{' '}
                                                detected. Please adjust entries
                                                to balance.
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>

                    <section className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (onCancel) onCancel();
                                else window.history.back();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={processing}
                            type="submit"
                            variant="secondary"
                            onClick={() => setStatus('draft')}
                        >
                            {processing && status === 'draft' && <Spinner />}
                            Draft
                        </Button>
                        <Button
                            disabled={
                                processing ||
                                (status === 'approved' && !isBalanced)
                            }
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
