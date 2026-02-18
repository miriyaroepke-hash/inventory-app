'use client';

import { useState } from 'react';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ImportPage() {
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [logs, setLogs] = useState<string[]>([]);

    // Credentials input
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter();

    const addLog = (msg: string) => setLogs(prev => [msg, ...prev]);

    const startImport = async () => {
        setLoading(true);
        setStatus('Starting import...');
        setLogs([]);
        setProgress(0);

        let offset = 0;
        const limit = 20; // Small batch to ensure images download ok
        let hasMore = true;
        let totalItems = 0;

        try {
            while (hasMore) {
                addLog(`Requesting batch offset=${offset}...`);
                const res = await fetch('/api/admin/import-moysklad', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ offset, limit, login, password })
                });

                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.error || 'Request failed');
                }

                const data = await res.json();

                if (offset === 0) {
                    totalItems = data.total;
                    addLog(`Found ${totalItems} items in MoiSklad.`);
                }

                offset += limit;
                hasMore = data.hasMore;

                // Update Progress
                const current = Math.min(offset, totalItems);
                const percent = Math.round((current / totalItems) * 100);
                setProgress(percent);
                setStatus(`Processed ${current} / ${totalItems}`);
                addLog(`Batch done: ${data.processed} imported, ${data.errors} errors.`);

                if (!hasMore) {
                    setStatus('Import Complete!');
                    addLog('✅ All Done!');
                }
            }
        } catch (error: any) {
            addLog(`❌ Error: ${error.message}`);
            setStatus('Error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Импорт из МойСклад</h1>

            <div className="bg-white p-6 rounded-lg shadow space-y-6">
                <div className="text-sm text-gray-600">
                    <p>Этот инструмент загрузит:</p>
                    <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Товары, Цены, Остатки</li>
                        <li>Штрихкоды (будут записаны как SKU)</li>
                        <li>Фотографии (будут сохранены в базу)</li>
                    </ul>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">MoiSklad Login</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={login}
                            onChange={e => setLogin(e.target.value)}
                            placeholder="login"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">MoiSklad Password</label>
                        <input
                            type="password"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="password"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="bg-indigo-600 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-sm font-medium">
                            <span>{status}</span>
                            <span>{progress}%</span>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={startImport}
                        className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Начать Импорт
                    </button>
                )}

                <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded border font-mono text-xs">
                    {logs.length === 0 && <span className="text-gray-400">Журнал событий пуст...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
