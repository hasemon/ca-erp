import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { router, usePage } from '@inertiajs/react';
import type { Column } from '@tanstack/react-table';
import { Check, PlusCircle } from 'lucide-react';
import type * as React from 'react';
import { useMemo } from 'react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

interface DataTableFacetedFilterProps<TData, TValue> {
    column?: Column<TData, TValue>;
    title?: string;
    options: {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
    urlKey?: string;
}

export function DataTableFacetedFilter<TData, TValue>({
    column,
    title,
    options,
    urlKey,
}: DataTableFacetedFilterProps<TData, TValue>) {
    const facets = column?.getFacetedUniqueValues();
    const { url: pageUrl } = usePage();

    // Get selected values from URL (reactive to Inertia navigation)
    const selectedValues = useMemo(() => {
        const urlParams = new URLSearchParams(pageUrl.split('?')[1] || '');
        const key = urlKey || column?.id || '';
        const urlFilterValue = urlParams.get(key);
        return new Set(urlFilterValue ? urlFilterValue.split(',') : []);
    }, [pageUrl, column?.id, urlKey]);

    const handleFilterChange = (value: string) => {
        const newSelectedValues = new Set(selectedValues);

        if (newSelectedValues.has(value)) {
            newSelectedValues.delete(value);
        } else {
            newSelectedValues.add(value);
        }

        const filterValues = Array.from(newSelectedValues);

        // Update local filter for immediate UI feedback
        column?.setFilterValue(filterValues.length ? filterValues : undefined);

        // Update URL
        const url = new URL(window.location.href);
        const key = urlKey || column?.id || '';
        if (filterValues.length > 0) {
            url.searchParams.set(key, filterValues.join(','));
        } else {
            url.searchParams.delete(key);
        }
        url.searchParams.set('page', '1'); // Reset to first page

        // Navigate with new filters
        router.get(
            url.toString(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onError: () => {
                    toast.error('Failed to apply filter. Please try again.');
                },
            },
        );
    };

    const handleClearFilters = () => {
        const url = new URL(window.location.href);
        const key = urlKey || column?.id || '';
        url.searchParams.delete(key);
        url.searchParams.set('page', '1');

        column?.setFilterValue(undefined);

        router.get(
            url.toString(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`${title} filter cleared!`);
                },
            },
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-dashed"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {title}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mx-2 h-4"
                            />
                            <Badge
                                variant="secondary"
                                className="px-1 font-normal lg:hidden"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden space-x-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="px-1 font-normal"
                                    >
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) =>
                                            selectedValues.has(option.value),
                                        )
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option.value}
                                                className="px-1 font-normal"
                                            >
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={`Search ${title?.toLowerCase()}...`}
                    />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selectedValues.has(
                                    option.value,
                                );
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() =>
                                            handleFilterChange(option.value)
                                        }
                                    >
                                        <div
                                            className={cn(
                                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'opacity-50 [&_svg]:invisible',
                                            )}
                                        >
                                            <Check className="h-3 w-3" />
                                        </div>
                                        {option.icon && (
                                            <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        )}
                                        <span>{option.label}</span>
                                        {facets?.get(option.value) && (
                                            <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                                {facets.get(option.value)}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={handleClearFilters}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
