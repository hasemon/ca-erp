import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function useCan() {
    const { auth } = usePage<SharedData>().props;

    const can = (permission: string): boolean => {
        if (!auth.user || !auth.permissions) {
            return false;
        }
        if (auth.has_full_access) {
            return true;
        }
        return auth.permissions.includes(permission);
    };

    const canAny = (permissions: string[]): boolean => {
        if (!auth.user || !auth.permissions) {
            return false;
        }
        if (auth.has_full_access) {
            return true;
        }
        return permissions.some((permission) =>
            auth.permissions.includes(permission),
        );
    };

    const canAll = (permissions: string[]): boolean => {
        if (!auth.user || !auth.permissions) {
            return false;
        }
        if (auth.has_full_access) {
            return true;
        }
        return permissions.every((permission) =>
            auth.permissions.includes(permission),
        );
    };

    return { can, canAny, canAll };
}
