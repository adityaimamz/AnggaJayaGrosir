import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface AppModalProps {
    open: boolean;
    title: string;
    description?: string;
    onClose: () => void;
    children: ReactNode;
    maxWidthClass?: string;
}

export default function AppModal({
    open,
    title,
    description,
    onClose,
    children,
    maxWidthClass = 'max-w-md',
}: AppModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 px-4 py-6">
            <div
                className={`bg-surface-container-lowest w-full ${maxWidthClass} rounded-2xl border border-black/5 p-5 shadow-xl`}
                onClick={(event) => event.stopPropagation()}
            >
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                        <h2 className="font-headline text-on-surface text-xl font-black">
                            {title}
                        </h2>
                        {description ? (
                            <p className="text-on-surface-variant mt-1 text-sm">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}
