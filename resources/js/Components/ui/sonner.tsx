import { Toaster as SonnerToaster } from 'sonner';

export default function AppToaster() {
    return (
        <SonnerToaster
            richColors
            closeButton
            position="bottom-right"
            toastOptions={{
                classNames: {
                    toast: 'font-sans',
                    title: 'font-semibold',
                    description: 'text-xs',
                },
            }}
        />
    );
}
