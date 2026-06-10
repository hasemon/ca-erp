import { DataTable } from '@/components/data-table/data-table';
import { DataTableColumnHeader } from '@/components/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/data-table/data-table-row-actions';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Mail, Phone, Plus, User } from 'lucide-react';
import { useMemo } from 'react';

interface Entity {
    id: number;
    name: string;
}

interface Partner {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    partnerable_type: string | null;
    partnerable_id: number | null;
    supplier: Entity | null;
    created_at: string;
}

interface Props {
    partners: {
        data: Partner[];
        meta: never;
    };
    filters?: {
        search?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Accounting', href: '/accounts' },
    { title: 'Business Partners', href: '/business-partners' },
];

export default function Index({ partners }: Props) {
    const columns = useMemo<ColumnDef<Partner>[]>(
        () => [
            {
                accessorKey: 'name',
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Partner Name"
                    />
                ),
                cell: ({ row }) => (
                    <div className="flex flex-col">
                        <span className="font-medium">{row.original.name}</span>
                        <span className="text-xs text-muted-foreground italic">
                            ID: {row.original.id}
                        </span>
                    </div>
                ),
            },
            {
                header: 'Contact Details',
                cell: ({ row }) => (
                    <div className="flex flex-col gap-1 text-xs">
                        {row.original.email && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="h-3.5 w-3.5" />
                                <span>{row.original.email}</span>
                            </div>
                        )}
                        {row.original.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{row.original.phone}</span>
                            </div>
                        )}
                        {!row.original.email && !row.original.phone && (
                            <span className="text-xs text-muted-foreground italic opacity-50">
                                No contact info
                            </span>
                        )}
                    </div>
                ),
            },
            {
                header: 'Linked Entity',
                cell: ({ row }) => (
                    <div className="flex flex-wrap gap-1.5">
                        {row.original.supplier && (
                            <Badge
                                key={`s-${row.original.supplier.id}`}
                                variant="secondary"
                                className="flex items-center gap-1 border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                                <User className="h-3 w-3" />
                                Supplier: {row.original.supplier.name}
                            </Badge>
                        )}
                        {row.original.partnerable_type &&
                            !row.original.supplier && (
                                <Badge
                                    variant="secondary"
                                    className="flex items-center gap-1 border-orange-100 bg-orange-50 text-orange-700"
                                >
                                    <User className="h-3 w-3" />
                                    {row.original.partnerable_type
                                        .split('\\')
                                        .pop()}
                                    : {row.original.partnerable_id}
                                </Badge>
                            )}
                        {!row.original.supplier &&
                            !row.original.partnerable_type && (
                                <span className="text-xs text-muted-foreground italic opacity-50">
                                    Standalone
                                </span>
                            )}
                    </div>
                ),
            },
            {
                accessorKey: 'created_at',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Joined" />
                ),
                cell: ({ row }) => (
                    <div className="text-sm">
                        {format(
                            row.original.created_at,
                            'dd MMM yyyy - h:mm a',
                        )}
                    </div>
                ),
            },
            {
                id: 'actions',
                cell: ({ row }) => (
                    <DataTableRowActions
                        row={row}
                        resourceName="business-partners"
                        includeActions={['edit', 'delete']}
                    />
                ),
            },
        ],
        [],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Business Partners"
                        description="Centralized identity management for all your suppliers and customers."
                    />
                    <Button asChild>
                        <Link href="/business-partners/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Partner
                        </Link>
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={partners.data}
                    pagination={partners as never}
                    config={{
                        searchPlaceholder: 'Search partners...',
                        enableGlobalSearch: true,
                        enableClientSideSorting: true,
                    }}
                />
            </div>
        </AppLayout>
    );
}
