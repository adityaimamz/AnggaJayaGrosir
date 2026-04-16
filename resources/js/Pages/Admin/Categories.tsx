import ConfirmDialog from '@/Components/ui/confirm-dialog';
import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { AdminCategoryRow } from '@/types/domain';
import {
    notifyActionError,
    notifyCreated,
    notifyDeleted,
    notifyError,
    notifyInfo,
    notifyUpdated,
} from '@/utils/notify';
import { useForm, usePage } from '@inertiajs/react';
import { Pencil, Plus, Shapes, Trash2, X } from 'lucide-react';
import { FormEvent, ReactNode, useEffect, useState } from 'react';

interface CategoryManagementProps {
    categories: AdminCategoryRow[];
}

interface CategoryFormData {
    name: string;
    slug: string;
}

const emptyForm: CategoryFormData = {
    name: '',
    slug: '',
};

function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export default function Categories({ categories }: CategoryManagementProps) {
    const page = usePage<PageProps>();
    const flashError = page.props.flash?.error;

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<AdminCategoryRow | null>(
        null,
    );
    const [isDeletingCategory, setIsDeletingCategory] = useState(false);
    const [editingCategory, setEditingCategory] =
        useState<AdminCategoryRow | null>(null);

    useEffect(() => {
        if (!flashError) {
            return;
        }

        notifyError(flashError);
    }, [flashError]);

    const createForm = useForm<CategoryFormData>(emptyForm);
    const editForm = useForm<CategoryFormData>(emptyForm);

    const openCreate = () => {
        createForm.reset();
        createForm.clearErrors();
        setShowCreateModal(true);
    };

    const closeCreate = () => {
        setShowCreateModal(false);
        createForm.reset();
        createForm.clearErrors();
    };

    const openEdit = (category: AdminCategoryRow) => {
        setEditingCategory(category);
        editForm.setData({
            name: category.name,
            slug: category.slug,
        });
    };

    const closeEdit = () => {
        setEditingCategory(null);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitCreate = (event: FormEvent) => {
        event.preventDefault();

        createForm.post('/admin/categories', {
            preserveScroll: true,
            onSuccess: () => {
                closeCreate();
                notifyCreated('Kategori');
            },
            onError: () => notifyActionError('menambahkan', 'kategori'),
        });
    };

    const submitEdit = (event: FormEvent) => {
        event.preventDefault();
        if (!editingCategory) {
            return;
        }

        editForm.transform((data) => ({
            ...data,
            _method: 'PUT',
        }));

        editForm.post(`/admin/categories/${editingCategory.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                closeEdit();
                notifyUpdated('Kategori');
            },
            onError: () => notifyActionError('memperbarui', 'kategori'),
        });
    };

    const deleteCategory = (category: AdminCategoryRow) => {
        if (category.productCount > 0) {
            notifyInfo(
                `Kategori "${category.name}" masih memiliki ${category.productCount} produk. Pindahkan produk terlebih dahulu sebelum menghapus kategori.`,
            );

            return;
        }

        setDeleteTarget(category);
    };

    const confirmDeleteCategory = () => {
        if (!deleteTarget) {
            return;
        }

        setIsDeletingCategory(true);
        editForm.delete(`/admin/categories/${deleteTarget.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteTarget(null);
                notifyDeleted('Kategori');
            },
            onError: () => notifyActionError('menghapus', 'kategori'),
            onFinish: () => setIsDeletingCategory(false),
        });
    };

    return (
        <AdminLayout>
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="font-headline text-on-surface text-3xl font-black">
                        Kategori
                    </h1>
                    <p className="text-on-surface-variant text-sm">
                        Daftar kategori produk dengan indikator jumlah produk
                        aktif.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={openCreate}
                    className="bg-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
                >
                    <Plus className="h-4 w-4" /> Tambah Kategori
                </button>
            </header>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                    <article
                        key={category.id}
                        className="bg-surface-container-lowest rounded-2xl border border-black/5 p-5"
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <div className="bg-surface-container inline-flex rounded-xl p-2.5">
                                <Shapes className="text-on-surface-variant h-5 w-5" />
                            </div>
                            <span className="bg-primary-fixed text-on-primary-fixed rounded-full px-2.5 py-1 text-xs font-bold">
                                {category.productCount} produk
                            </span>
                        </div>

                        <h2 className="text-on-surface text-lg font-bold">
                            {category.name}
                        </h2>
                        <p className="text-on-surface-variant mt-1 text-sm">
                            /{category.slug}
                        </p>

                        <div className="mt-5 flex items-center justify-end gap-1">
                            <button
                                type="button"
                                onClick={() => openEdit(category)}
                                className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteCategory(category)}
                                className="text-primary hover:bg-primary-fixed rounded-lg p-2"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </article>
                ))}
            </section>

            {showCreateModal ? (
                <CategoryFormModal
                    title="Tambah Kategori"
                    submitLabel="Simpan Kategori"
                    data={createForm.data}
                    errors={createForm.errors}
                    processing={createForm.processing}
                    onChange={createForm.setData}
                    onSubmit={submitCreate}
                    onClose={closeCreate}
                />
            ) : null}

            {editingCategory ? (
                <CategoryFormModal
                    title={`Edit ${editingCategory.name}`}
                    submitLabel="Perbarui Kategori"
                    data={editForm.data}
                    errors={editForm.errors}
                    processing={editForm.processing}
                    onChange={editForm.setData}
                    onSubmit={submitEdit}
                    onClose={closeEdit}
                />
            ) : null}

            <ConfirmDialog
                open={deleteTarget !== null}
                title="Hapus Kategori"
                description={
                    deleteTarget
                        ? `Kategori "${deleteTarget.name}" akan dihapus permanen.`
                        : undefined
                }
                confirmLabel="Ya, Hapus"
                cancelLabel="Batal"
                processing={isDeletingCategory}
                danger
                onCancel={() => setDeleteTarget(null)}
                onConfirm={confirmDeleteCategory}
            />
        </AdminLayout>
    );
}

interface CategoryFormModalProps {
    title: string;
    submitLabel: string;
    data: CategoryFormData;
    errors: Record<string, string>;
    processing: boolean;
    onChange: <K extends keyof CategoryFormData>(
        key: K,
        value: CategoryFormData[K],
    ) => void;
    onSubmit: (event: FormEvent) => void;
    onClose: () => void;
}

function CategoryFormModal({
    title,
    submitLabel,
    data,
    errors,
    processing,
    onChange,
    onSubmit,
    onClose,
}: CategoryFormModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6">
            <form
                onSubmit={onSubmit}
                className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl border border-black/5 p-6"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-headline text-on-surface text-xl font-black">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Nama" error={errors.name}>
                        <input
                            value={data.name}
                            onChange={(event) => {
                                const newName = event.target.value;
                                onChange('name', newName);

                                if (
                                    !data.slug.trim() ||
                                    data.slug === slugify(data.name)
                                ) {
                                    onChange('slug', slugify(newName));
                                }
                            }}
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                    </Field>
                    <Field label="Slug" error={errors.slug}>
                        <input
                            value={data.slug}
                            onChange={(event) =>
                                onChange('slug', event.target.value)
                            }
                            className="bg-surface-container focus:border-primary w-full rounded-xl border border-transparent px-3 py-2.5 text-sm focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => onChange('slug', slugify(data.name))}
                            className="text-primary mt-1 text-xs font-semibold hover:underline"
                        >
                            Generate dari nama
                        </button>
                    </Field>
                </div>

                <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="bg-surface-container rounded-xl px-4 py-2 text-sm font-semibold"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-primary rounded-xl px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label className="text-on-surface mb-1.5 block text-sm font-semibold">
                {label}
            </label>
            {children}
            <InputError className="mt-1" message={error} />
        </div>
    );
}
