'use client';

import { useState, useEffect } from 'react';
import { Loader2, Edit, Save, X } from 'lucide-react';

interface User {
    id: string;
    username: string;
    name: string | null;
    role: string;
    createdAt: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setNewName(user.name || '');
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setNewName('');
    };

    const saveUser = async () => {
        if (!editingUser) return;
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingUser.id,
                    name: newName
                })
            });
            if (res.ok) {
                fetchUsers();
                cancelEdit();
            } else {
                alert('Ошибка при сохранении');
            }
        } catch (error) {
            console.error('Failed to save', error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Логин (Email)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Имя</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
                                <th scope="col" className="relative px-6 py-3">
                                    <span className="sr-only">Действия</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.username}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {editingUser?.id === user.id ? (
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="border border-indigo-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                            />
                                        ) : (
                                            user.name || '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.role}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingUser?.id === user.id ? (
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={saveUser} className="text-green-600 hover:text-green-900">
                                                    <Save className="h-5 w-5" />
                                                </button>
                                                <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                                                    <X className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => startEdit(user)} className="text-indigo-600 hover:text-indigo-900">
                                                <Edit className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
