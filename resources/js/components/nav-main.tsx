import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCan } from '@/hooks/use-can';
import { cn, resolveUrl } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

interface NavMainProps {
    items: NavItem[];
    onActiveItemChange?: (isSubView: boolean) => void;
}

const normalizePath = (url: string) => {
    try {
        const base =
            typeof window !== 'undefined'
                ? window.location.origin
                : 'http://localhost';
        const path = new URL(url, base).pathname.replace(/\/+$/, '');

        return path || '/';
    } catch {
        const path = url.split('?')[0]?.split('#')[0]?.replace(/\/+$/, '');

        return path || '/';
    }
};

const matchScore = (currentPath: string, href: NavItem['href']) => {
    if (!href) {
        return -1;
    }

    const targetPath = normalizePath(resolveUrl(href));

    if (currentPath === targetPath) {
        return targetPath.length + 1000;
    }

    if (targetPath !== '/' && currentPath.startsWith(`${targetPath}/`)) {
        return targetPath.length;
    }

    return -1;
};

const bestMatchingItem = (
    navItems: NavItem[] | undefined,
    currentPath: string,
): NavItem | null => {
    if (!navItems) {
        return null;
    }

    return navItems.reduce<{
        item: NavItem | null;
        score: number;
    }>(
        (best, item) => {
            const ownScore = matchScore(currentPath, item.href);
            const childMatch = bestMatchingItem(item.items, currentPath);
            const childScore = childMatch
                ? matchScore(currentPath, childMatch.href)
                : -1;
            const score = Math.max(ownScore, childScore);

            if (score > best.score) {
                return { item, score };
            }

            return best;
        },
        { item: null, score: -1 },
    ).item;
};

export function NavMain({ items = [], onActiveItemChange }: NavMainProps) {
    const page = usePage();
    const { can } = useCan();
    const currentPath = normalizePath(page.url);

    // Get filtered items based on permissions
    const visibleItems = useMemo(() => {
        const filterByPermission = (navItems: NavItem[]): NavItem[] => {
            return navItems.reduce<NavItem[]>((filtered, item) => {
                const isAllowed = !item.permission || can(item.permission);

                // If item has sub-items, filter them recursively
                if (item.items && item.items.length > 0) {
                    const visibleChildren = filterByPermission(item.items);

                    // Only include parent if it has visible children
                    if (isAllowed && visibleChildren.length > 0) {
                        filtered.push({
                            ...item,
                            items: visibleChildren,
                        });
                    }
                    return filtered;
                }

                // For leaf items, include if allowed
                if (isAllowed) {
                    filtered.push(item);
                }

                return filtered;
            }, []);
        };

        return filterByPermission(items);
    }, [items, can]);

    const initialActiveItem = useMemo(() => {
        for (const item of visibleItems) {
            if (bestMatchingItem(item.items, currentPath)) {
                return item;
            }
        }
        return null;
    }, [visibleItems, currentPath]);

    const [activeItem, setActiveItem] = useState<NavItem | null>(
        initialActiveItem,
    );

    // Derive selected sub-item from URL
    const selectedSubItem = useMemo(() => {
        if (!activeItem?.items) return null;
        return bestMatchingItem(activeItem.items, currentPath)?.title ?? null;
    }, [activeItem, currentPath]);

    const handleItemClick = (item: NavItem) => {
        if (item.items && item.items.length > 0) {
            setActiveItem(item);
            onActiveItemChange?.(true);
        } else if (item.href) {
            router.visit(item.href);
        }
    };

    const handleSubItemClick = (subItem: NavItem) => {
        if (subItem.href) {
            router.visit(subItem.href);
        }
    };

    const handleBackToMain = () => {
        setActiveItem(null);
        onActiveItemChange?.(false);
    };

    // Sub-items view
    if (activeItem && activeItem.items) {
        return (
            <SidebarGroup className="px-2 py-0">
                <div className="mb-2 flex items-center gap-2 border-b p-2">
                    <button
                        onClick={handleBackToMain}
                        className="flex h-8 w-8 items-center justify-center p-0 hover:bg-sidebar-accent"
                    >
                        <IconArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="flex-1 text-center text-sm font-semibold group-data-[collapsible=icon]:hidden">
                        {activeItem.title}
                    </span>
                    <div className="w-8" />
                </div>
                <SidebarGroupContent>
                    <SidebarMenu>
                        {activeItem.items.map((subItem) => {
                            const hasLevel3 =
                                subItem.items && subItem.items.length > 0;
                            const isActive = Boolean(
                                selectedSubItem === subItem.title,
                            );

                            if (hasLevel3) {
                                return (
                                    <Collapsible
                                        key={subItem.title}
                                        asChild
                                        defaultOpen={isActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={{
                                                        children: subItem.title,
                                                    }}
                                                    size={'sm'}
                                                    isActive={isActive}
                                                >
                                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                                        {subItem.icon && (
                                                            <subItem.icon className="h-4 w-4 shrink-0" />
                                                        )}
                                                        <span className="truncate">
                                                            {subItem.title}
                                                        </span>
                                                    </div>
                                                    <IconChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {subItem.items?.map(
                                                        (level3Item) => {
                                                            const selectedLevel3Item =
                                                                bestMatchingItem(
                                                                    subItem.items,
                                                                    currentPath,
                                                                );
                                                            const isL3Active =
                                                                Boolean(
                                                                    selectedLevel3Item?.title ===
                                                                    level3Item.title,
                                                                );
                                                            return (
                                                                <SidebarMenuSubItem
                                                                    key={
                                                                        level3Item.title
                                                                    }
                                                                >
                                                                    <SidebarMenuSubButton
                                                                        asChild
                                                                        size={
                                                                            'sm'
                                                                        }
                                                                        isActive={
                                                                            isL3Active
                                                                        }
                                                                    >
                                                                        <Link
                                                                            href={
                                                                                level3Item.href ??
                                                                                '#'
                                                                            }
                                                                            prefetch
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    level3Item.title
                                                                                }
                                                                            </span>
                                                                        </Link>
                                                                    </SidebarMenuSubButton>
                                                                </SidebarMenuSubItem>
                                                            );
                                                        },
                                                    )}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                );
                            }

                            return (
                                <SidebarMenuItem key={subItem.title}>
                                    <SidebarMenuButton
                                        isActive={isActive}
                                        onClick={() =>
                                            handleSubItemClick(subItem)
                                        }
                                        tooltip={{ children: subItem.title }}
                                        size={'sm'}
                                    >
                                        <div className="flex min-w-0 flex-1 items-center gap-3">
                                            {subItem.icon && (
                                                <subItem.icon className="h-4 w-4 shrink-0" />
                                            )}
                                            <span className="truncate">
                                                {subItem.title}
                                            </span>
                                        </div>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            );
                        })}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        );
    }

    // Main menu view
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarMenu>
                {visibleItems.map((item) => {
                    const hasSubItems = item.items && item.items.length > 0;
                    const isActive = item.href
                        ? matchScore(currentPath, item.href) >= 0
                        : false;

                    const chevronIndicator = (
                        <IconChevronRight className="h-4 w-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden" />
                    );

                    if (hasSubItems) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    onClick={() => handleItemClick(item)}
                                    tooltip={{ children: item.title }}
                                    size="sm"
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-3">
                                        {item.icon && (
                                            <item.icon className="h-4 w-4 shrink-0" />
                                        )}
                                        <span className="truncate">
                                            {item.title}
                                        </span>
                                    </div>
                                    <div className="ml-auto flex min-w-fit shrink-0 items-center gap-1">
                                        {item.badge ? (
                                            <SidebarMenuBadge
                                                className={cn(
                                                    'min-w-fit gap-x-3',
                                                )}
                                            >
                                                {item.badge}
                                                {chevronIndicator}
                                            </SidebarMenuBadge>
                                        ) : (
                                            chevronIndicator
                                        )}
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                                size="sm"
                            >
                                <Link href={item.href ?? '#'} prefetch>
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {item.badge && (
                                        <SidebarMenuBadge>
                                            {item.badge}
                                        </SidebarMenuBadge>
                                    )}
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
