import Heading from '@/components/heading';
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
import AppLayout from '@/layouts/app-layout';
import { store } from '@/routes/business-partners';
import { Form, Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    partnerableTypes: { value: string; label: string }[];
    items: { id: number; name: string }[];
    accounts: { id: number; name: string; code: string }[];
}

export default function Create({ partnerableTypes, items, accounts }: Props) {
    const [partnerableType, setPartnerableType] = useState('');
    const [partnerableId, setPartnerableId] = useState('');
    const [receivableAccountId, setReceivableAccountId] = useState('');
    const [payableAccountId, setPayableAccountId] = useState('');
    const [attachable, setAttachable] = useState<
        { id: number; name: string }[]
    >([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [lastPartnerableType, setLastPartnerableType] = useState('');

    useEffect(() => {
        if (!partnerableType || partnerableType === lastPartnerableType) {
            if (!partnerableType) setAttachable([]);
            return;
        }
        setLastPartnerableType(partnerableType);
        setPartnerableId('');
        setIsLoadingItems(true);
        router.reload({
            only: ['items'],
            data: { model: partnerableType },
            onSuccess: (page) => {
                setAttachable((page.props.items as any[]) || []);
                setIsLoadingItems(false);
            },
            onError: () => {
                setIsLoadingItems(false);
                toast.error('Failed to load items');
            },
        });
    }, [partnerableType]);

    useEffect(() => {
        if (items?.length) setAttachable(items);
    }, [items]);

    return (
        <AppLayout>
            <Head title="Create Business Partner" />
            <main className="p-4">
                <Heading
                    title="Create Business Partner"
                    description="Register a new legal entity and link it to a commercial role."
                />

                <Form
                    action={store()}
                    resetOnSuccess={['name', 'email', 'phone']}
                    disableWhileProcessing
                    onSuccess={() => {
                        toast.success('Business Partner created successfully');
                        setPartnerableType('');
                        setPartnerableId('');
                        setReceivableAccountId('');
                        setPayableAccountId('');
                        setAttachable([]);
                        setLastPartnerableType('');
                    }}
                    onError={(errors) => {
                        Object.values(errors).forEach((message) =>
                            toast.error(message),
                        );
                    }}
                    className="flex flex-col gap-6"
                >
                    {({ processing, errors }) => (
                        <>
                            {/* Hidden inputs for Select values */}
                            <input
                                type="hidden"
                                name="partnerable_type"
                                value={partnerableType}
                            />
                            <input
                                type="hidden"
                                name="partnerable_id"
                                value={partnerableId}
                            />
                            <input
                                type="hidden"
                                name="default_receivable_account_id"
                                value={receivableAccountId}
                            />
                            <input
                                type="hidden"
                                name="default_payable_account_id"
                                value={payableAccountId}
                            />

                            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">
                                        Full Name / Company Name
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        placeholder="e.g. Acme Corporation"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        tabIndex={2}
                                        placeholder="contact@acme.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        tabIndex={3}
                                        placeholder="+1 234 567 890"
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </section>

                            <section className="grid gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Attach To</Label>
                                    <Select
                                        value={partnerableType}
                                        onValueChange={setPartnerableType}
                                    >
                                        <SelectTrigger tabIndex={4}>
                                            <SelectValue placeholder="Select type..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {partnerableTypes.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.partnerable_type}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Select Entity</Label>
                                    <Select
                                        value={partnerableId}
                                        onValueChange={setPartnerableId}
                                        disabled={
                                            !partnerableType || isLoadingItems
                                        }
                                    >
                                        <SelectTrigger tabIndex={5}>
                                            <SelectValue
                                                placeholder={
                                                    isLoadingItems
                                                        ? 'Loading...'
                                                        : !partnerableType
                                                          ? 'Select type first'
                                                          : 'Select entity'
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {attachable.map((item) => (
                                                <SelectItem
                                                    key={item.id}
                                                    value={item.id.toString()}
                                                >
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={errors.partnerable_id}
                                    />
                                </div>
                            </section>

                            <section className="grid gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Default Receivable Account</Label>
                                    <Select
                                        value={receivableAccountId}
                                        onValueChange={setReceivableAccountId}
                                    >
                                        <SelectTrigger tabIndex={6}>
                                            <SelectValue placeholder="Select account..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem
                                                    key={acc.id}
                                                    value={acc.id.toString()}
                                                >
                                                    {acc.code} - {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            errors.default_receivable_account_id
                                        }
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Default Payable Account</Label>
                                    <Select
                                        value={payableAccountId}
                                        onValueChange={setPayableAccountId}
                                    >
                                        <SelectTrigger tabIndex={7}>
                                            <SelectValue placeholder="Select account..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem
                                                    key={acc.id}
                                                    value={acc.id.toString()}
                                                >
                                                    {acc.code} - {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={
                                            errors.default_payable_account_id
                                        }
                                    />
                                </div>
                            </section>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={8}
                                disabled={processing}
                            >
                                {processing && <Spinner />}
                                Create Business Partner
                            </Button>
                        </>
                    )}
                </Form>
            </main>
        </AppLayout>
    );
}
