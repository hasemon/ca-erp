export type PaginationLinks = {
    first: string;
    last: string | null;
    next: string;
    prev: string;
};

export type PaginationMeta = {
    current_page: number;
    from: number | null;
    path: string;
    per_page: number;
    to: number | null;
};

export type SimplePaginationData<T> = {
    data: T[];
    links: PaginationLinks;
    meta: PaginationMeta;
    current_page: number;
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
};
