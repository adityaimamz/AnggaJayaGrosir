import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Masuk" />
            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#1a1c1e] px-4">
                {/* Decorative gradient orbs */}
                <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#c62828]/30 to-transparent blur-3xl" />
                <div className="absolute -right-40 -bottom-40 h-[500px] w-[500px] rounded-full bg-gradient-to-tl from-[#c62828]/20 to-transparent blur-3xl" />

                {/* Subtle grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />

                <div className="relative z-10 w-full max-w-md">
                    {/* Logo + branding */}
                    <div className="mb-8 text-center">
                        <Link href="/" className="mb-4 inline-block">
                            <img
                                src="/logo%20AJ.png"
                                alt="Angga Jaya"
                                className="mx-auto h-20 w-20 drop-shadow-lg"
                            />
                        </Link>
                        <h1 className="text-3xl font-black tracking-tight text-white">
                            Angga Jaya
                        </h1>
                        <p className="mt-1 text-sm font-medium text-white/50">
                            Panel Admin — Masuk untuk mengelola toko
                        </p>
                    </div>

                    {/* Card */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                        {status && (
                            <div className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-semibold text-white/70"
                                >
                                    Alamat Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        autoComplete="username"
                                        autoFocus
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        placeholder="Masukkan Email"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-white/25 outline-none transition-colors focus:border-[#c62828] focus:bg-white/[0.08]"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1.5 text-xs font-medium text-red-400">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-semibold text-white/70"
                                >
                                    Kata Sandi
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={data.password}
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        placeholder="••••••••"
                                        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-12 text-white placeholder-white/25 outline-none transition-colors focus:border-[#c62828] focus:bg-white/[0.08]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        tabIndex={-1}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1.5 text-xs font-medium text-red-400">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember + Forgot */}
                            {/* <div className="flex items-center justify-between">
                                <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData(
                                                'remember',
                                                (e.target.checked ||
                                                    false) as false,
                                            )
                                        }
                                        className="h-4 w-4 rounded border-white/20 bg-white/5 text-[#c62828] focus:ring-[#c62828]/50"
                                    />
                                    <span className="text-sm text-white/50">
                                        Ingat saya
                                    </span>
                                </label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm font-medium text-white/50 transition-colors hover:text-white"
                                    >
                                        Lupa sandi?
                                    </Link>
                                )}
                            </div> */}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c62828] py-3.5 text-base font-bold text-white shadow-lg shadow-[#c62828]/20 transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                ) : (
                                    'Masuk'
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            href="/"
                            className="text-sm font-medium text-white/50 transition-colors hover:text-white"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>

                    {/* Footer */}
                    <p className="mt-6 text-center text-xs text-white/25">
                        © {new Date().getFullYear()} Angga Jaya — Semua hak
                        dilindungi
                    </p>
                </div>
            </div>
        </>
    );
}
