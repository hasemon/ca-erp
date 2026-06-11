import { router } from '@inertiajs/react';

export const useVoucherStatusFilter = (paramName = 'status') => {
    const urlParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );
    const currentStatus = urlParams.get(paramName) || '';

    const handleStatusChange = (value: string) => {
        const url = new URL(window.location.href);

        if (value) {
            url.searchParams.set(paramName, value);
        } else {
            url.searchParams.delete(paramName);
        }

        url.searchParams.set('page', '1');

        router.get(
            url.toString(),
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return {
        currentStatus,
        handleStatusChange,
    };
};
