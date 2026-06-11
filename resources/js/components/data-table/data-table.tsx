import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { SimplePaginationData } from '@/types/simple-paginate-type';
import { usePage } from '@inertiajs/react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
    type VisibilityState,
    type Row,
} from '@tanstack/react-table';
import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

export interface FilterOption {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
}

export interface DataTableFilter {
    column: string;
    title: string;
    options: FilterOption[];
    urlKey?: string;
}

export interface DataTableConfig {
    searchPlaceholder?: string;
    filters?: DataTableFilter[];
    enableRowSelection?: boolean;
    enableColumnVisibility?: boolean;
    enableGlobalSearch?: boolean;
    enableClientSideSorting?: boolean;
    enableClientSideFiltering?: boolean;
    filterPrefix?: string;
    globalFilterParam?: string;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: SimplePaginationData<TData>;
    loading?: boolean;
    config?: DataTableConfig;
    onRowAction?: (action: string, row: TData) => void;
    onSortingChange?: (sorting: SortingState) => void;
    onFiltersChange?: (filters: ColumnFiltersState) => void;
    onGlobalFilterChange?: (globalFilter: string) => void;
    renderSubRow?: (row: Row<TData>) => React.ReactNode;
    renderFooter?: (rows: Row<TData>[]) => React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pagination,
    loading = false,
    config = {},
    renderSubRow,
    renderFooter,
    // Removed onSortingChange, onFiltersChange, onGlobalFilterChange as they are not used for client-side operations
}: DataTableProps<TData, TValue>) {
    const {
        searchPlaceholder = 'Search all columns...',
        filters = [],
        enableRowSelection = true,
        enableColumnVisibility = true,
        enableGlobalSearch = true,
        enableClientSideSorting = true,
        enableClientSideFiltering = true,
        filterPrefix,
        globalFilterParam = 'search',
    } = config;

    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');

    const { url: pageUrl } = usePage();

    // Handle URL synchronization
    React.useEffect(() => {
        const urlParams = new URLSearchParams(pageUrl.split('?')[1] || '');
        const newSearchParam = urlParams.get(globalFilterParam) || '';
        if (enableGlobalSearch && newSearchParam !== globalFilter) {
            setGlobalFilter(newSearchParam);
        }

        const newColumnFilters: ColumnFiltersState = [];
        filters.forEach((filter) => {
            const urlKey =
                filter.urlKey ||
                (filterPrefix
                    ? `${filterPrefix}[${filter.column}]`
                    : filter.column);
            const filterValue = urlParams.get(urlKey);
            if (filterValue) {
                newColumnFilters.push({
                    id: filter.column,
                    value: filterValue.split(','),
                });
            }
        });
        const areFiltersEqual = (
            a: ColumnFiltersState,
            b: ColumnFiltersState,
        ) => {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (
                    a[i].id !== b[i].id ||
                    JSON.stringify(a[i].value) !== JSON.stringify(b[i].value)
                ) {
                    return false;
                }
            }
            return true;
        };
        if (!areFiltersEqual(newColumnFilters, columnFilters)) {
            setColumnFilters(newColumnFilters);
        }

        const newSortColumn = urlParams.get('sort');
        const newSortDirection = urlParams.get('direction');
        const newSorting: SortingState = [];
        if (newSortColumn && newSortDirection) {
            newSorting.push({
                id: newSortColumn,
                desc: newSortDirection === 'desc',
            });
        }
        const areSortingEqual = (a: SortingState, b: SortingState) => {
            if (a.length !== b.length) return false;
            if (a.length === 0 && b.length === 0) return true;
            return a[0]?.id === b[0]?.id && a[0]?.desc === b[0]?.desc;
        };
        if (!areSortingEqual(newSorting, sorting)) {
            setSorting(newSorting);
        }
    }, [
        pageUrl,
        filters,
        enableGlobalSearch,
        columnFilters,
        filterPrefix,
        globalFilter,
        globalFilterParam,
        sorting,
    ]);

    // Handle sorting changes
    const handleSortingChange = React.useCallback(
        (
            updaterOrValue:
                | SortingState
                | ((old: SortingState) => SortingState),
        ) => {
            const newSorting =
                typeof updaterOrValue === 'function'
                    ? updaterOrValue(sorting)
                    : updaterOrValue;
            setSorting(newSorting);
            // Update URL parameters for client-side sorting
            const urlParams = new URLSearchParams(window.location.search);
            if (newSorting.length > 0) {
                urlParams.set('sort', newSorting[0].id);
                urlParams.set('direction', newSorting[0].desc ? 'desc' : 'asc');
            } else {
                urlParams.delete('sort');
                urlParams.delete('direction');
            }
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
        },
        [sorting],
    );

    // Handle filter changes
    const handleColumnFiltersChange = React.useCallback(
        (
            updaterOrValue:
                | ColumnFiltersState
                | ((old: ColumnFiltersState) => ColumnFiltersState),
        ) => {
            const newFilters =
                typeof updaterOrValue === 'function'
                    ? updaterOrValue(columnFilters)
                    : updaterOrValue;
            setColumnFilters(newFilters);
            // No URL update here, as filters are typically applied via the toolbar's filter component
        },
        [columnFilters],
    );

    // Handle global filter changes
    const handleGlobalFilterChange = React.useCallback(
        (updaterOrValue: string | ((old: string) => string)) => {
            const newGlobalFilter =
                typeof updaterOrValue === 'function'
                    ? updaterOrValue(globalFilter)
                    : updaterOrValue;
            setGlobalFilter(newGlobalFilter);
            // Update URL parameters for client-side global search
            const urlParams = new URLSearchParams(window.location.search);
            if (newGlobalFilter) {
                urlParams.set(globalFilterParam, newGlobalFilter);
            } else {
                urlParams.delete(globalFilterParam);
            }
            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.replaceState({}, '', newUrl);
        },
        [globalFilter],
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            globalFilter,
        },
        enableRowSelection,
        enableGlobalFilter: enableGlobalSearch,
        onRowSelectionChange: setRowSelection,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: handleColumnFiltersChange,
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: handleGlobalFilterChange,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(), // Always use client-side filtering
        getSortedRowModel: getSortedRowModel(), // Always use client-side sorting
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        globalFilterFn: 'includesString',
        manualPagination: !!pagination, // Pagination is still manual (server-side)
        manualSorting: !enableClientSideSorting, // Controlled by config
        manualFiltering: !enableClientSideFiltering, // Controlled by config
    });

    return (
        <div className="space-y-6">
            <DataTableToolbar
                table={table}
                searchPlaceholder={searchPlaceholder}
                filters={filters}
                enableColumnVisibility={enableColumnVisibility}
                enableGlobalSearch={enableGlobalSearch}
                filterPrefix={filterPrefix}
                globalFilterParam={globalFilterParam}
            />
            <div className="bg-card border">
                <ScrollArea className="w-full border whitespace-nowrap">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow
                                    key={headerGroup.id}
                                    className="border-border/50 hover:bg-muted/50"
                                >
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                className="h-10 px-4 text-left align-middle font-medium text-muted-foreground"
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <TableRow key={`loading-${index}`}>
                                        {columns.map((_, cellIndex) => (
                                            <TableCell
                                                key={`loading-cell-${cellIndex}`}
                                                className="h-16 px-4"
                                            >
                                                <div className="h-4 animate-pulse bg-muted" />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.flatMap((row) => {
                                    const mainRow = (
                                        <TableRow
                                            key={row.id}
                                            data-state={
                                                row.getIsSelected() && 'selected'
                                            }
                                            className="border-border/50 transition-colors hover:bg-muted/50"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className="px-4 py-4"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );

                                    if (renderSubRow) {
                                        const subRowContent = renderSubRow(row);
                                        if (subRowContent) {
                                            return [
                                                mainRow,
                                                <TableRow key={`${row.id}-sub`} className="border-border/50 bg-muted/5">
                                                    <TableCell colSpan={columns.length} className="p-0">
                                                        {subRowContent}
                                                    </TableCell>
                                                </TableRow>
                                            ];
                                        }
                                    }

                                    return [mainRow];
                                })
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-32 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="text-muted-foreground">
                                                No results found.
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Try adjusting your search or
                                                filter criteria.
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        {renderFooter &&
                            !loading &&
                            table.getRowModel().rows.length > 0 && (
                                <TableFooter>
                                    {renderFooter(table.getRowModel().rows)}
                                </TableFooter>
                            )}
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            {pagination && (
                <DataTablePagination
                    pagination={pagination}
                    selectedCount={
                        table.getFilteredSelectedRowModel().rows.length
                    }
                />
            )}
        </div>
    );
}
