import type { InertiaLinkProps } from '@inertiajs/react';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function toTitleCase(str: string): string {
    return str.replace(
        /\w\S*/g,
        (text) =>
            text.charAt(0).toUpperCase() + text.substring(1).toLowerCase(),
    );
}

export const handlePrint = async ({
    pdfDocument,
    documentTitle,
    onBeforePrint,
    onAfterPrint,
    onError,
}: {
    pdfDocument: React.ReactElement<DocumentProps>;
    documentTitle?: string;
    onBeforePrint?: () => void;
    onAfterPrint?: () => void;
    onError?: (error: unknown) => void;
}) => {
    try {
        onBeforePrint?.();

        const blob = await pdf(pdfDocument).toBlob();
        const url = URL.createObjectURL(blob);
        const iframe = window.document.createElement('iframe');

        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.src = url;

        window.document.body.appendChild(iframe);

        iframe.onload = () => {
            const originalTitle = window.document.title;
            const fallbackTitle = `Document_${new Date().toISOString().replace(/T/, '_').replace(/\..+/, '').replace(/:/g, '-')}`;
            const printTitle = documentTitle || fallbackTitle;
            window.document.title = printTitle;
            if (iframe.contentDocument) {
                iframe.contentDocument.title = printTitle;
            }

            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            window.document.title = originalTitle;

            setTimeout(() => {
                window.document.body.removeChild(iframe);
                URL.revokeObjectURL(url);
                onAfterPrint?.();
            }, 1000);
        };
    } catch (error) {
        console.error('Print failed:', error);
        onError?.(error);
    }
};

export function resolveUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export const dateStringToDate = (value?: string) => {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
};
