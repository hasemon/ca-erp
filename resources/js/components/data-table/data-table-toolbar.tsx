'use client';

import { DataTableViewOptions } from '@/components/data-table/data-table-view-options';
import { Input } from '@/components/ui/input';
import { router, usePage } from '@inertiajs/react';
import type { Table } from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { useDebouncedCallback } from 'use-debounce';
import { Button } from '../ui/button';
import type { DataTableFilter } from './data-table';
import { DataTableFacetedFilter } from './data-table-faceted-filter';

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    searchPlaceholder: string;
    filters: DataTableFilter[];
    enableColumnVisibility: boolean;
    enableGlobalSearch?: boolean;
    filterPrefix?: string;
    globalFilterParam?: string;
}

export function DataTableToolbar<TData>({
    table,
    searchPlaceholder = 'Search all columns...',
    filters,
    enableColumnVisibility,
    enableGlobalSearch = true,
    filterPrefix,
    globalFilterParam = 'search',
}: DataTableToolbarProps<TData>) {
    const [searchValue, setSearchValue] = React.useState('');

    const urlParams = new URLSearchParams(window.location.search);
    const hasActiveFilters =
        urlParams.has(globalFilterParam) ||
        filters.some((filter) => {
            const urlKey =
                filter.urlKey ||
                (filterPrefix
                    ? `${filterPrefix}[${filter.column}]`
                    : filter.column);
            return urlParams.has(urlKey);
        });

    const debouncedSearch = useDebouncedCallback((value: string) => {
        const url = new URL(window.location.href);
        if (value.trim()) {
            url.searchParams.set(globalFilterParam, value.trim());
        } else {
            url.searchParams.delete(globalFilterParam);
        }
        url.searchParams.set('page', '1');

        router.get(
            url.toString(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onStart: () => {
                    // Optional: Show loading state
                },
                onError: () => {
                    toast.error('Failed to search. Please try again.');
                },
            },
        );
    }, 500);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchValue(value);
        debouncedSearch(value);

        // Use global filter instead of column-specific filters
        if (enableGlobalSearch) {
            table.setGlobalFilter(value);
        }
    };

    const handleResetFilters = () => {
        setSearchValue('');
        table.resetColumnFilters();

        // Reset global filter as well
        if (enableGlobalSearch) {
            table.setGlobalFilter('');
        }

        const url = new URL(window.location.href);
        url.searchParams.delete(globalFilterParam);
        filters.forEach((filter) => {
            const urlKey =
                filter.urlKey ||
                (filterPrefix
                    ? `${filterPrefix}[${filter.column}]`
                    : filter.column);
            url.searchParams.delete(urlKey);
        });
        url.searchParams.set('page', '1');

        router.get(
            url.toString(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('All filters cleared!');
                },
                onError: () => {
                    toast.error('Failed to clear filters.');
                },
            },
        );
    };

    const { url: pageUrl } = usePage();
    const [prevPageUrl, setPrevPageUrl] = React.useState(pageUrl);

    if (pageUrl !== prevPageUrl) {
        setPrevPageUrl(pageUrl);
        const urlParams = new URLSearchParams(pageUrl.split('?')[1] || '');
        const searchParam = urlParams.get(globalFilterParam) || '';
        if (searchParam !== searchValue) {
            setSearchValue(searchParam);
            if (enableGlobalSearch) {
                table.setGlobalFilter(searchParam);
            }
        }
    }

    return (
        <div className="flex flex-col gap-4 px-2 py-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
                {enableGlobalSearch && (
                    <div className="relative">
                        <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={handleSearchChange}
                            className="h-9 w-full pl-8 sm:w-[200px] lg:w-[300px]"
                        />
                    </div>
                )}

                {filters.map((filter) => {
                    const column = table.getColumn(filter.column);
                    if (!column) return null;

                    const urlKey =
                        filter.urlKey ||
                        (filterPrefix
                            ? `${filterPrefix}[${filter.column}]`
                            : filter.column);

                    return (
                        <DataTableFacetedFilter
                            key={filter.column}
                            column={column}
                            title={filter.title}
                            options={filter.options}
                            urlKey={urlKey}
                        />
                    );
                })}

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={handleResetFilters}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            {enableColumnVisibility && <DataTableViewOptions table={table} />}
        </div>
    );
}
