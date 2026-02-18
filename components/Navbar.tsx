'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Package, ScanBarcode, User, LogOut, X, Search, Download } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    if (!session) return null;

    const links = [
        { name: 'Главная', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Склад', href: '/inventory', icon: Package },
        { name: 'Продажи', href: '/sales', icon: ScanBarcode },
        { name: 'Инвентаризация', href: '/scan', icon: ScanBarcode },
        { name: 'Заказы', href: '/orders', icon: Package },
        { name: 'Kaspi', href: '/kaspi', icon: Package },
        { name: 'Возвраты', href: '/returns', icon: Package },
    ];

    if (session.user.role === 'ADMIN') {
        links.push({ name: 'Пользователи', href: '/users', icon: User },);
        links.push({ name: 'CRM Импорт', href: '/admin/import', icon: Download });
    }

    return (
        <nav className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <span className="text-xl font-bold text-indigo-600">Dimmiani (v3.0)</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {links.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={clsx(
                                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium',
                                            pathname === link.href
                                                ? 'border-indigo-500 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                        )}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {link.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            {isSearchOpen ? (
                                <div className="flex items-center">
                                    <input
                                        type="text"
                                        placeholder="Поиск..."
                                        className="w-48 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const target = e.target as HTMLInputElement;
                                                window.location.href = `/inventory?search=${target.value}`;
                                            }
                                        }}
                                        autoFocus
                                        onBlur={() => setIsSearchOpen(false)}
                                    />
                                    <button onClick={() => setIsSearchOpen(false)} className="ml-2 text-gray-500 hover:text-gray-700">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setIsSearchOpen(true)} className="text-gray-500 hover:text-gray-900">
                                    <Search className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                        <div className="flex flex-shrink-0">
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
