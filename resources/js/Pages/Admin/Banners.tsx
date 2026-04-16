import React, { FormEvent, useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import ConfirmDialog from '@/Components/ui/confirm-dialog';
import { Banner } from '@/types/domain';
import { Edit2, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import { PageProps } from '@/types';
import {
    notifyActionError,
    notifyCreated,
    notifyDeleted,
    notifyError,
    notifyStatusChanged,
    notifyUpdated,
} from '@/utils/notify';

interface BannersProps extends PageProps {
    banners: Banner[];
}

export default function Banners({ banners }: BannersProps) {
    const { flash } = usePage<PageProps>().props;
    const flashError = flash?.error;
    const nextSortOrder = React.useMemo(
        () =>
            banners.reduce(
                (maxOrder, banner) => Math.max(maxOrder, banner.sort_order),
                0,
            ) + 1,
        [banners],
    );

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Banner | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
    const [isDeletingBanner, setIsDeletingBanner] = useState(false);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    React.useEffect(() => {
        if (!flashError) {
            return;
        }

        notifyError(flashError);
    }, [flashError]);

    // Form states
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        image_file: null as File | null,
        sort_order: 0,
        is_active: true,
    });

    const openCreateModal = () => {
        setCreateData({
            image_file: null,
            sort_order: nextSortOrder,
            is_active: true,
        });
        setPreviewUrl(null);
        setIsCreateModalOpen(true);
    };

    const {
        data: editData,
        setData: setEditData,
        post: postEdit, // using post with _method=PUT to support multipart/form-data
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        _method: 'PUT',
        image_file: null as File | null,
        sort_order: 0,
        is_active: true,
    });

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        resetCreate();
        setPreviewUrl(null);
    };

    const openEditModal = (banner: Banner) => {
        setEditTarget(banner);
        setEditData({
            _method: 'PUT',
            image_file: null,
            sort_order: banner.sort_order,
            is_active: banner.is_active,
        });
        setPreviewUrl(banner.image_url);
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditTarget(null);
        resetEdit();
        setPreviewUrl(null);
    };

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        postCreate(route('admin.banners.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
                notifyCreated('Banner');
            },
            onError: () => notifyActionError('menambahkan', 'banner'),
        });
    };

    const submitEdit = (e: FormEvent) => {
        e.preventDefault();
        if (!editTarget) return;

        postEdit(route('admin.banners.update', editTarget.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                closeEditModal();
                notifyUpdated('Banner');
            },
            onError: () => notifyActionError('memperbarui', 'banner'),
        });
    };

    const requestDeleteBanner = (banner: Banner) => {
        setDeleteTarget(banner);
    };

    const confirmDeleteBanner = () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeletingBanner(true);
        router.delete(route('admin.banners.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                notifyDeleted('Banner');
            },
            onError: () => notifyActionError('menghapus', 'banner'),
            onFinish: () => setIsDeletingBanner(false),
        });
    };

    const toggleActive = (banner: Banner) => {
        router.post(route('admin.banners.update', banner.id), {
            _method: 'PUT',
            sort_order: banner.sort_order,
            is_active: !banner.is_active,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const willBeActive = banner.is_active === false;
                notifyStatusChanged('Banner', willBeActive);
            },
            onError: () => notifyActionError('mengubah status', 'banner'),
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isEdit) {
                setEditData('image_file', file);
            } else {
                setCreateData('image_file', file);
            }
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <AdminLayout>
            <Head title="Kelola Spanduk (Banner)" />

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-headline text-on-surface text-3xl font-black">
                        Spanduk (Banner)
                    </h1>
                    <p className="text-on-surface-variant mt-1 text-sm">
                        Total {banners.length} banner terdaftar
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="bg-primary text-on-primary flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-white text-sm font-bold shadow-md transition-all hover:brightness-110"
                >
                    <Plus className="h-4 w-4" /> Tambah Banner
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="bg-surface-container-lowest overflow-hidden rounded-2xl shadow-sm border border-black/5 relative group">
                        <div className="aspect-[16/6] bg-surface-container relative">
                            <img src={banner.image_url} alt={`Banner ${banner.sort_order}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 hidden sm:flex bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center gap-2">
                                <button
                                    onClick={() => openEditModal(banner)}
                                    className="bg-white text-black p-2 rounded-full hover:scale-110 transition-transform"
                                    title="Edit Banner"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => requestDeleteBanner(banner)}
                                    className="bg-red-600 text-white border-0 p-2 rounded-full hover:bg-red-700 hover:scale-110 transition-transform"
                                    title="Hapus Banner"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-bold text-on-surface">Urutan: {banner.sort_order}</div>
                                <button
                                    onClick={() => toggleActive(banner)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold text-white transition-colors ${banner.is_active ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}
                                >
                                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                                </button>
                            </div>

                            <div className="flex sm:hidden items-center gap-2">
                                <button
                                    onClick={() => openEditModal(banner)}
                                    className="flex-1 bg-surface-container text-on-surface rounded-xl px-3 py-2 text-xs font-bold transition-colors hover:bg-surface-container-high"
                                    title="Edit Banner"
                                >
                                    <span className="inline-flex items-center justify-center gap-1.5">
                                        <Edit2 className="h-3.5 w-3.5" />
                                        Edit
                                    </span>
                                </button>
                                <button
                                    onClick={() => requestDeleteBanner(banner)}
                                    className="flex-1 bg-primary text-white border-0 rounded-xl px-3 py-2 text-xs font-bold transition-colors hover:bg-red-700"
                                    title="Hapus Banner"
                                >
                                    <span className="inline-flex items-center justify-center gap-1.5">
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Hapus
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {banners.length === 0 && (
                    <div className="col-span-full py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-black/5">
                        <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="font-semibold">Oh no, belum ada banner.</p>
                        <p className="text-sm">Mulai tambahkan agar halaman beranda terlihat keren!</p>
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-on-surface font-headline text-xl font-bold">
                                Tambah Banner Baru
                            </h2>
                            <button onClick={closeCreateModal}>
                                <X className="text-on-surface-variant hover:text-on-surface h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitCreate} className="space-y-4">
                            <div>
                                <label className="text-on-surface mb-1.5 block text-sm font-semibold">Gambar Banner *</label>
                                {previewUrl && (
                                    <div className="mb-3 rounded-xl overflow-hidden aspect-[16/6] bg-surface-container">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, false)}
                                    className="bg-surface-container w-full rounded-xl px-4 py-3 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                    required
                                />
                                {createErrors.image_file && <span className="text-error mt-1 text-xs">{createErrors.image_file}</span>}
                                <p className="text-xs text-on-surface-variant mt-2">Format: JPG, PNG, WEBP. Rekomendasi rasio: memanjang melebar.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-on-surface mb-1.5 block text-sm font-semibold">Urutan</label>
                                    <input
                                        type="number"
                                        value={createData.sort_order}
                                        readOnly
                                        className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-4 py-2.5 text-sm transition-all focus:outline-none"
                                        placeholder="Auto"
                                    />
                                    {createErrors.sort_order && <span className="text-error mt-1 text-xs">{createErrors.sort_order}</span>}
                                    <p className="text-xs text-on-surface-variant mt-2">Urutan otomatis mengikuti urutan terakhir.</p>
                                </div>
                                <div className="flex flex-col justify-center">
                                    <label className="text-on-surface mb-2 block text-sm font-semibold">Status Muncul</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={createData.is_active}
                                            onChange={(e) => setCreateData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium">Bisa Dilihat</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={closeCreateModal} className="text-on-surface-variant hover:bg-surface-container rounded-xl px-4 py-2 text-sm font-bold transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={createProcessing} className="bg-primary text-white rounded-xl px-6 py-2 outline-none text-sm font-bold shadow-md transition-all hover:brightness-110 disabled:opacity-50">
                                    {createProcessing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Hapus Banner"
                description={
                    deleteTarget
                        ? `Banner urutan ${deleteTarget.sort_order} akan dihapus permanen.`
                        : undefined
                }
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
                processing={isDeletingBanner}
                danger
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDeleteBanner}
            />

            {/* EDIT MODAL */}
            {isEditModalOpen && editTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-on-surface font-headline text-xl font-bold">
                                Edit Banner
                            </h2>
                            <button onClick={closeEditModal}>
                                <X className="text-on-surface-variant hover:text-on-surface h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="space-y-4">
                            <div>
                                <label className="text-on-surface mb-1.5 block text-sm font-semibold">Gambar Banner</label>
                                {previewUrl && (
                                    <div className="mb-3 rounded-xl overflow-hidden aspect-[16/6] bg-surface-container relative">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, true)}
                                    className="bg-surface-container w-full rounded-xl px-4 py-3 text-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                                />
                                {editErrors.image_file && <span className="text-error mt-1 text-xs">{editErrors.image_file}</span>}
                                <p className="text-xs text-on-surface-variant mt-2">Biarkan kosong jika tidak ingin mengganti gambar.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-on-surface mb-1.5 block text-sm font-semibold">Urutan</label>
                                    <input
                                        type="number"
                                        value={editData.sort_order}
                                        onChange={(e) => setEditData('sort_order', Number(e.target.value))}
                                        className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-4 py-2.5 text-sm transition-all focus:outline-none"
                                    />
                                    {editErrors.sort_order && <span className="text-error mt-1 text-xs">{editErrors.sort_order}</span>}
                                </div>
                                <div className="flex flex-col justify-center">
                                    <label className="text-on-surface mb-2 block text-sm font-semibold">Status Muncul</label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editData.is_active}
                                            onChange={(e) => setEditData('is_active', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm font-medium">Bisa Dilihat</span>
                                    </label>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button type="button" onClick={closeEditModal} className="text-on-surface-variant hover:bg-surface-container rounded-xl px-4 py-2 text-sm font-bold transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={editProcessing} className="bg-primary text-white rounded-xl px-6 py-2 outline-none text-sm font-bold shadow-md transition-all hover:brightness-110 disabled:opacity-50">
                                    {editProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
