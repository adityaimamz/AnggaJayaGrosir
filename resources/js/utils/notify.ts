import { toast } from 'sonner';

export function notifySuccess(message: string, duration = 2800): void {
    toast.success(message, { duration });
}

export function notifyError(message: string, duration = 4200): void {
    toast.error(message, { duration });
}

export function notifyInfo(message: string, duration = 3000): void {
    toast(message, { duration });
}

export function notifyCreated(entity: string): void {
    notifySuccess(`${entity} berhasil ditambahkan.`, 2600);
}

export function notifyUpdated(entity: string): void {
    notifySuccess(`${entity} berhasil diperbarui.`, 2600);
}

export function notifyDeleted(entity: string): void {
    notifySuccess(`${entity} berhasil dihapus.`, 3200);
}

export function notifyActionError(action: string, entity: string): void {
    notifyError(`Gagal ${action} ${entity}.`, 4200);
}

export function notifyStatusChanged(entity: string, isActive: boolean): void {
    const statusVerb = isActive ? 'diaktifkan' : 'dinonaktifkan';
    notifySuccess(`${entity} berhasil ${statusVerb}.`, 2400);
}

export function notifyProductSearchNotFound(): void {
    notifyInfo('Produk yang dicari tidak ditemukan.', 2600);
}
