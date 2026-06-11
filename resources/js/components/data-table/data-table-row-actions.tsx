import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toTitleCase } from '@/lib/utils';
import { router } from '@inertiajs/react';
import type { Row } from '@tanstack/react-table';
import { Eye, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';

export interface RowAction<TData = Record<string, unknown>> {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: Row<TData>) => void;
    variant?: 'default' | 'destructive';
    separator?: boolean;
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>;
    actions?: RowAction<TData>[];
    resourceName: string;
    idField?: string;
    includeActions?: ('show' | 'edit' | 'delete')[];
    resourcePath?: string;
}

export function DataTableRowActions<TData>({
    row,
    actions = [],
    resourceName,
    idField = 'id',
    includeActions = ['show', 'edit', 'delete'],
    resourcePath,
}: DataTableRowActionsProps<TData>) {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [showDeleteAlertDialog, setShowDeleteAlertDialog] =
        React.useState(false);

    const handleDelete = () => {
        const data = row.original as Record<string, unknown>;
        const id = data[idField] || data.id;
        const basePath = resourcePath || `/${resourceName}`;
        router.delete(`${basePath}/${id}`, {
            onSuccess: () => {
                toast.warning(
                    `${toTitleCase(resourceName.slice(0, -1))} deleted successfully!`,
                );
            },
            onError: () => {
                toast.error(
                    `Failed to delete ${resourceName.slice(0, -1)}. Please try again.`,
                );
            },
            onFinish: () => {
                setShowDeleteAlertDialog(false);
                setIsDropdownOpen(false); // Also close the dropdown menu
            },
        });
    };

    const defaultActionsMap = {
        show: {
            label: 'View',
            icon: Eye,
            onClick: (row: Row<TData>) => {
                const data = row.original as Record<string, unknown>;
                const id = data[idField] || data.id;
                const basePath = resourcePath || `/${resourceName}`;
                router.get(`${basePath}/${id}`);
            },
            variant: 'default' as const,
            separator: false,
        },
        edit: {
            label: 'Edit',
            icon: Pencil,
            onClick: (row: Row<TData>) => {
                const data = row.original as Record<string, unknown>;
                const id = data[idField] || data.id;
                const basePath = resourcePath || `/${resourceName}`;
                router.get(`${basePath}/${id}/edit`);
            },
            variant: 'default' as const,
            separator: false,
        },
        delete: {
            label: 'Delete',
            icon: Trash,
            onClick: () => {
                // Close the dropdown and open the AlertDialog
                setIsDropdownOpen(false);
                setShowDeleteAlertDialog(true);
            },
            variant: 'destructive' as const,
            separator: true,
        },
    } satisfies Record<string, RowAction<TData>>;

    const filteredDefaultActions = includeActions
        .map((actionName) => defaultActionsMap[actionName])
        .filter(Boolean);
    const allActions = [...actions, ...filteredDefaultActions];

    const actionsWithSeparators = allActions.map((action, index) => {
        if (
            index === actions.length &&
            actions.length > 0 &&
            filteredDefaultActions.length > 0
        ) {
            return { ...action, separator: true };
        }
        return action;
    });

    return (
        <>
            <DropdownMenu
                open={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
            >
                <DropdownMenuTrigger asChild>
                    <Button variant="default" className="flex h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    {actionsWithSeparators.map((action, index) => (
                        <React.Fragment key={`${action.label}-${index}`}>
                            {action.separator && <DropdownMenuSeparator />}
                            <DropdownMenuItem
                                onClick={() => {
                                    action.onClick(row); // Execute the action's onClick
                                    // For non-delete actions, close the dropdown immediately
                                    if (action.label !== 'Delete') {
                                        setIsDropdownOpen(false);
                                    }
                                }}
                                className={
                                    action.variant === 'destructive'
                                        ? 'text-destructive focus:bg-destructive '
                                        : ''
                                }
                            >
                                {action.icon && (
                                    <action.icon className="mr-2 h-4 w-4" />
                                )}
                                {action.label}
                            </DropdownMenuItem>
                        </React.Fragment>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog
                open={showDeleteAlertDialog}
                onOpenChange={setShowDeleteAlertDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete this{' '}
                            <span
                                className={
                                    'mx-1 font-bold text-destructive uppercase'
                                }
                            >
                                {resourceName.slice(0, -1)}
                            </span>
                            and remove its data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-popover hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
