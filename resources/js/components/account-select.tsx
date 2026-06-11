'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn, toArray } from '@/lib/utils';
import {
    Check,
    ChevronDown,
    ChevronRight,
    ChevronsUpDown,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface Account {
    id: number;
    name: string;
    code: string;
    is_group: boolean;
    parent_id: number | null;
    account_type?: {
        name: string;
    };
}

type AccountSelectProps = {
    accounts: Account[];
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    name?: string;
} & (
    | {
          multiple?: false;
          value: string | number | null;
          onValueChange: (value: string | number | null) => void;
      }
    | {
          multiple: true;
          value: (string | number)[];
          onValueChange: (value: (string | number)[]) => void;
      }
);

interface TreeItem extends Account {
    children: TreeItem[];
    depth: number;
}

export function AccountSelect({
    accounts,
    value,
    onValueChange,
    multiple = false,
    placeholder = 'Select account...',
    className,
    disabled = false,
    name,
}: AccountSelectProps) {
    const [open, setOpen] = useState(false);
    const [manualExpanded, setManualExpanded] = useState<Set<number>>(
        new Set(),
    );
    const [search, setSearch] = useState('');

    // Build the tree structure globally first, then group by type
    const accountList = useMemo(() => toArray(accounts), [accounts]);

    const groupedData = useMemo(() => {
        const idMap: Record<string, TreeItem> = {};
        const roots: TreeItem[] = [];

        // 1. Initialize the map
        accountList.forEach((acc) => {
            idMap[acc.id.toString()] = { ...acc, children: [], depth: 0 };
        });

        // 2. Build relationships globally
        accountList.forEach((acc) => {
            const item = idMap[acc.id.toString()];
            const parentId = acc.parent_id?.toString();
            if (parentId && idMap[parentId]) {
                idMap[parentId].children.push(item);
            } else {
                roots.push(item);
            }
        });

        // 3. Set depths recursively
        const setDepth = (items: TreeItem[], depth: number) => {
            items.forEach((item) => {
                item.depth = depth;
                setDepth(item.children, depth + 1);
            });
        };
        setDepth(roots, 0);

        // 4. Group roots by their category for display headers
        const result: Record<string, TreeItem[]> = {};
        roots.forEach((root) => {
            const typeName = root.account_type?.name || 'Other';
            if (!result[typeName]) result[typeName] = [];
            result[typeName].push(root);
        });

        return result;
    }, [accountList]);

    // Calculate the total expanded set
    const expanded = useMemo(() => {
        const next = new Set<string>();
        manualExpanded.forEach((id) => next.add(id.toString()));

        const valuesToExpand = multiple
            ? (value as (string | number)[])
            : [value as string | number];

        valuesToExpand.forEach((v) => {
            if (
                v !== null &&
                v !== undefined &&
                v !== '' &&
                accountList.length > 0
            ) {
                const selected = accountList.find(
                    (a) => a.id.toString() === v.toString(),
                );
                if (selected) {
                    let current = selected;
                    while (current.parent_id) {
                        const parentId = current.parent_id.toString();
                        next.add(parentId);
                        const parent = accountList.find(
                            (a) => a.id.toString() === parentId,
                        );
                        if (!parent) break;
                        current = parent;
                    }
                }
            }
        });
        return next;
    }, [manualExpanded, value, accountList, multiple]);

    const flattenedList = useMemo(() => {
        const list: (TreeItem & { isVisible: boolean })[] = [];
        const traverse = (items: TreeItem[], isVisible: boolean) => {
            items.forEach((item) => {
                list.push({ ...item, isVisible });
                // A child is visible only if its parent is expanded AND visible
                traverse(
                    item.children,
                    isVisible && expanded.has(item.id.toString()),
                );
            });
        };
        Object.values(groupedData).forEach((roots) => {
            traverse(roots, true);
        });
        return list;
    }, [groupedData, expanded]);

    const selectedAccounts = useMemo(() => {
        if (multiple) {
            return accountList.filter((acc) =>
                (value as (string | number)[])
                    .map((v) => v.toString())
                    .includes(acc.id.toString()),
            );
        }
        const selected = accountList.find(
            (acc) => acc.id.toString() === value?.toString(),
        );
        return selected ? [selected] : [];
    }, [accountList, value, multiple]);

    const toggleAccount = (id: number) => {
        if (multiple) {
            const currentValues = value as (string | number)[];
            const isSelected = currentValues
                .map((v) => v.toString())
                .includes(id.toString());
            const nextValues = isSelected
                ? currentValues.filter((v) => v.toString() !== id.toString())
                : [...currentValues, id];

            // Type assertion via unknown to satisfy the strict union
            (onValueChange as unknown as (v: (string | number)[]) => void)(
                nextValues,
            );
        } else {
            // Type assertion via unknown to satisfy the strict union
            (onValueChange as unknown as (v: string | number | null) => void)(
                id,
            );
            setOpen(false);
        }
    };

    const isSelected = (id: number) => {
        if (multiple) {
            return (value as (string | number)[])
                .map((v) => v.toString())
                .includes(id.toString());
        }
        return value?.toString() === id.toString();
    };

    return (
        <>
            <Popover onOpenChange={setOpen} open={open}>
                <PopoverTrigger asChild>
                    <Button
                        aria-expanded={open}
                        className={cn('w-full justify-between p-2', className)}
                        role="combobox"
                        variant="outline"
                        disabled={disabled}
                    >
                        <div className="flex max-w-[90%] flex-wrap gap-1">
                            {selectedAccounts.length > 0 ? (
                                selectedAccounts.map((acc) => (
                                    <Badge
                                        key={acc.id}
                                        variant="secondary"
                                        className="flex items-center gap-1 py-0.5 pr-1"
                                    >
                                        <span className="max-w-37.5 truncate">
                                            {acc.name}
                                        </span>
                                        {multiple && !disabled && (
                                            <button
                                                className="ml-1 rounded-full ring-offset-background outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleAccount(acc.id);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.stopPropagation();
                                                        toggleAccount(acc.id);
                                                    }
                                                }}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                }}
                                            >
                                                <X className="size-3 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        )}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground">
                                    {placeholder}
                                </span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="p-0"
                    style={{ width: 'var(--radix-popover-trigger-width)' }}
                    align="start"
                >
                    <Command shouldFilter={true}>
                        <CommandInput
                            placeholder="Search account..."
                            onValueChange={setSearch}
                            className="h-9"
                        />
                        <CommandList className="max-h-112.5">
                            <CommandEmpty>No account found.</CommandEmpty>
                            {Object.entries(groupedData).map(([category]) => (
                                <CommandGroup
                                    heading={category.toUpperCase()}
                                    key={category}
                                >
                                    {flattenedList
                                        .filter(
                                            (item) =>
                                                item.account_type?.name ===
                                                    category ||
                                                (!item.account_type &&
                                                    category === 'Other'),
                                        )
                                        .map((item) => {
                                            if (
                                                search === '' &&
                                                !item.isVisible
                                            )
                                                return null;

                                            return (
                                                <CommandItem
                                                    key={item.id}
                                                    onSelect={() => {
                                                        if (!item.is_group) {
                                                            toggleAccount(
                                                                item.id,
                                                            );
                                                        } else {
                                                            setManualExpanded(
                                                                (prev) => {
                                                                    const next =
                                                                        new Set(
                                                                            prev,
                                                                        );
                                                                    const id =
                                                                        item.id;
                                                                    if (
                                                                        next.has(
                                                                            id,
                                                                        )
                                                                    ) {
                                                                        next.delete(
                                                                            id,
                                                                        );
                                                                    } else {
                                                                        next.add(
                                                                            id,
                                                                        );
                                                                    }
                                                                    return next;
                                                                },
                                                            );
                                                        }
                                                    }}
                                                    value={`${item.code} ${item.name} ${category}`}
                                                    className={cn(
                                                        'group flex cursor-pointer items-center gap-1',
                                                        item.is_group
                                                            ? 'font-semibold text-foreground/80'
                                                            : 'font-normal',
                                                    )}
                                                >
                                                    <div
                                                        className="flex w-full min-w-0 items-center"
                                                        style={{
                                                            paddingLeft:
                                                                search === ''
                                                                    ? `${item.depth * 1.25}rem`
                                                                    : '0',
                                                        }}
                                                    >
                                                        {item.is_group ? (
                                                            <>
                                                                {expanded.has(
                                                                    item.id.toString(),
                                                                ) ? (
                                                                    <ChevronDown className="mr-1 size-4 shrink-0 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronRight className="mr-1 size-4 shrink-0 text-muted-foreground" />
                                                                )}
                                                                <span className="truncate">
                                                                    {item.name}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <div className="flex w-full min-w-0 items-center gap-2">
                                                                <div className="flex w-4 shrink-0 justify-center">
                                                                    <Check
                                                                        className={cn(
                                                                            'size-3.5',
                                                                            isSelected(
                                                                                item.id,
                                                                            )
                                                                                ? 'text-primary opacity-100'
                                                                                : 'opacity-0',
                                                                        )}
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col truncate py-1">
                                                                    <span className="truncate">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </span>
                                                                    <span className="font-mono text-[10px] text-muted-foreground">
                                                                        (
                                                                        {
                                                                            item.code
                                                                        }
                                                                        )
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CommandItem>
                                            );
                                        })}
                                </CommandGroup>
                            ))}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {name &&
                (!multiple ? (
                    <input
                        type="hidden"
                        name={name}
                        value={value?.toString() ?? ''}
                    />
                ) : (
                    (value as (string | number)[]).map((val, idx) => (
                        <input
                            key={idx}
                            type="hidden"
                            name={`${name}[]`}
                            value={val}
                        />
                    ))
                ))}
        </>
    );
}
