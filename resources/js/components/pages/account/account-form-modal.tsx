import {
    store,
    update,
} from '@/actions/App/Http/Controllers/Tenant/AccountController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AccountType, AccountTypeType } from '@/types/account-type';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface AccountFormModalProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    accountType: AccountTypeType | null;
    account: AccountType | null;
    flatAccounts: AccountType[];
}

export default function AccountFormModal({
    isOpen,
    setIsOpen,
    accountType,
    account,
    flatAccounts,
}: AccountFormModalProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            account_type_id: '',
            parent_id: '' as string | null,
            name: '',
            code: '',
            sub_type: 'general',
            activity_type: 'none',
            account_number: '',
            is_active: true,
            is_group: false,
            description: '',
        });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (account) {
                setData({
                    account_type_id: account.account_type_id.toString(),
                    parent_id: account.parent_id
                        ? account.parent_id.toString()
                        : null,
                    name: account.name,
                    code: account.code,
                    sub_type: account.sub_type || 'general',
                    activity_type: account.activity_type || 'none',
                    account_number: account.account_number || '',
                    is_active: account.is_active,
                    is_group: account.is_group,
                    description: account.description || '',
                });
            } else {
                reset();
                setData('account_type_id', accountType?.id?.toString() || '');
            }
        }
    }, [isOpen, account, accountType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (account) {
            put(update.url(account.id), {
                onSuccess: () => {
                    toast.success('Account updated successfully');
                    setIsOpen(false);
                },
                onError: () => {
                    toast.error('Failed to update account');
                },
            });
        } else {
            post(store.url(), {
                onSuccess: () => {
                    toast.success('Account created successfully');
                    setIsOpen(false);
                },
                onError: () => {
                    toast.error('Failed to create account');
                },
            });
        }
    };

    const parentOptions = flatAccounts.filter(
        (a) => a.account_type_id === accountType?.id,
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {account ? 'Edit Account' : 'New Account'}
                        </DialogTitle>
                        <DialogDescription>
                            {account
                                ? 'Update the details for this account.'
                                : `Create a new account in the ${accountType?.name} category.`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="parent_id">
                                    Parent Account
                                </Label>
                                <Select
                                    value={data.parent_id || 'none'}
                                    onValueChange={(val) =>
                                        setData(
                                            'parent_id',
                                            val === 'none' ? null : val,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="None" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        {parentOptions.map((opt) => (
                                            <SelectItem
                                                key={opt.id}
                                                value={opt.id.toString()}
                                            >
                                                {opt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.parent_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sub_type">Sub-Type</Label>
                                <Select
                                    value={data.sub_type}
                                    onValueChange={(val) =>
                                        setData('sub_type', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">
                                            General
                                        </SelectItem>
                                        <SelectItem value="cash">
                                            Cash
                                        </SelectItem>
                                        <SelectItem value="bank_account">
                                            Bank Account
                                        </SelectItem>
                                        <SelectItem value="mobile_banking">
                                            Mobile Banking
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Other
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.sub_type} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="activity_type">
                                    Activity Type
                                </Label>
                                <Select
                                    value={data.activity_type}
                                    onValueChange={(val) =>
                                        setData('activity_type', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select activity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            None
                                        </SelectItem>
                                        <SelectItem value="operating_activities">
                                            Operating Activities
                                        </SelectItem>
                                        <SelectItem value="investing_activities">
                                            Investing Activities
                                        </SelectItem>
                                        <SelectItem value="financing_activities">
                                            Financing Activities
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.activity_type} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="code">Code</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) =>
                                        setData('code', e.target.value)
                                    }
                                    placeholder="A0001"
                                />
                                <InputError message={errors.code} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                placeholder="Account Name"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="account_number">
                                Account Number
                            </Label>
                            <Input
                                id="account_number"
                                value={data.account_number}
                                onChange={(e) =>
                                    setData('account_number', e.target.value)
                                }
                                placeholder="Optional"
                            />
                            <InputError message={errors.account_number} />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_group"
                                checked={data.is_group}
                                onCheckedChange={(val) =>
                                    setData('is_group', val)
                                }
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="is_group">Group Account</Label>
                                <p className="text-sm text-muted-foreground">
                                    Can have sub-accounts but cannot have direct
                                    transactions.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={data.is_active}
                                onCheckedChange={(val) =>
                                    setData('is_active', val)
                                }
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor="is_active">Active</Label>
                                <p className="text-sm text-muted-foreground">
                                    Account is visible and can be used in
                                    transactions.
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                placeholder="Optional notes..."
                            />
                            <InputError message={errors.description} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner className="mr-2 h-4 w-4" />}
                            {account ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
