'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Package, ScanBarcode, LogOut } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    if (!session) return null;

    const links = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Scan/Sell', href: '/scan', icon: ScanBarcode },
    ];

    return (
        <nav className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between">
                    <div className="flex">
                        <div className="flex flex-shrink-0 items-center">
                            <span className="text-xl font-bold text-indigo-600">InvApp</span>
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
                    <div className="flex items-center">
                        <div className="flex flex-shrink-0">
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="relative inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
