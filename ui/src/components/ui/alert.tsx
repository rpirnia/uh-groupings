'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { useState } from 'react';

const alertVariants = cva(
    `relative w-full rounded border border-slate-200 p-3 transition-opacity duration-250 ease-out
    [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute
     [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950 dark:border-slate-800 dark:[&>svg]:text-slate-50`,
    {
        variants: {
            variant: {
                default: 'bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50',
                warning: 'bg-amber-100 border-amber-200 text-yellow-800',
                destructive: `border-red-100 text-red-500 bg-red-50 dark:border-red-500 [&>svg]:text-red-500 
                    dark:border-red-900/50 dark:text-red-900 dark:dark:border-red-900 dark:[&>svg]:text-red-900`,
                success: `border-green-300/50 text-green-700 bg-green-100 [&>svg]:text-green-700`
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
);

const Alert = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants> & { hasCloseButton?: boolean }
>(({ className, variant, hasCloseButton = false, children, ...props }, ref) => {
    const [isFading, setIsFading] = useState<boolean | null>(false);

    const handleClose = () => {
        setIsFading(true);
        setTimeout(() => {
            setIsFading(null);
        }, 250);
    };

    if (isFading === null) return null;

    return (
        <div
            ref={ref}
            role="alert"
            className={cn(alertVariants({ variant }), className, isFading ? 'opacity-0' : 'opacity-100')}
            {...props}
        >
            {hasCloseButton && (
                <button
                    onClick={handleClose}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
                    aria-label="Close"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
            {children}
        </div>
    );
});
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h5
            ref={ref}
            className={cn('mb-1 text-base font-semibold leading-none tracking-tight', className)}
            {...props}
        />
    )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('text-base [&_p]:leading-relaxed', className)} {...props} />
    )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
