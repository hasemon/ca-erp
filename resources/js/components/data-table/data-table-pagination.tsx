'use client';

import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { SimplePaginationData } from '@/types/simple-paginate-type';
import { router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';

interface DataTablePaginationProps<TData> {
    pagination: SimplePaginationData<TData>;
    selectedCount?: number;
}

export function DataTablePagination<TData>({
    pagination,
    selectedCount = 0,
}: DataTablePaginationProps<TData>) {
    const { meta, links } = pagination;

    const handlePageSizeChange = (pageSize: string) => {
        const url = new URL(window.location.href);
        url.searchParams.set('per_page', pageSize);
        url.searchParams.set('page', '1'); // Always reset to page 1 when changing per_page
        router.get(
            url.toString(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const navigateToPage = (url: string | null) => {
        if (url) {
            router.get(
                url,
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                },
            );
        }
    };

    const navigateToFirstPage = () => {
        navigateToPage(links.first);
    };

    const navigateToLastPage = () => {
        navigateToPage(links.last);
    };

    const navigateToPrevPage = () => {
        navigateToPage(links.prev);
    };

    const navigateToNextPage = () => {
        navigateToPage(links.next);
    };

    return (
        <div className="flex flex-col gap-4 px-2 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div className="text-sm text-muted-foreground">
                    {selectedCount > 0 && (
                        <span className="font-medium text-foreground">
                            {selectedCount} of {pagination.data.length} row(s)
                            selected.
                        </span>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    Showing {meta.from || 0} to {meta.to || 0}
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Per page</p>
                    <Select
                        value={String(meta.per_page)}
                        onValueChange={handlePageSizeChange}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue>{meta.per_page}</SelectValue>
                        </SelectTrigger>
                        <SelectContent side="bottom">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem
                                    key={pageSize}
                                    value={`${pageSize}`}
                                >
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {/* Removed "Page X of Y" as it's not reliable with simplePaginate */}
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 bg-transparent p-0 lg:flex"
                        onClick={navigateToFirstPage}
                        disabled={!links.prev}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 bg-transparent p-0"
                        onClick={navigateToPrevPage}
                        disabled={!links.prev}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 bg-transparent p-0"
                        onClick={navigateToNextPage}
                        disabled={!links.next}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 bg-transparent p-0 lg:flex"
                        onClick={navigateToLastPage}
                        disabled={!links.next}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
