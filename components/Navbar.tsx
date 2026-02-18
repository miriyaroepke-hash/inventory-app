'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { LayoutDashboard, Package, ScanBarcode, User, LogOut, Menu, X, ShoppingCart, Search, Database } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    return (
        <nav className="p-4 bg-white shadow">
            <div className="text-xl font-bold text-indigo-600">Dimmiani (Recovery Mode)</div>
            <div className="flex gap-4 mt-2">
                <a href="/dashboard">Dashboard</a>
                <a href="/inventory">Inventory</a>
                <a href="/orders">Orders</a>
            </div>
        </nav>
    );
}
