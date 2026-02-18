'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-bold text-red-600">Что-то пошло не так!</h2>
            <div className="p-4 bg-gray-100 rounded text-sm font-mono text-left max-w-lg overflow-auto">
                <p className="font-bold">{error.name}</p>
                <p>{error.message}</p>
                {error.digest && <p className="text-xs text-gray-500 mt-2">Digest: {error.digest}</p>}
            </div>
            <button
                className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
                onClick={() => reset()}
            >
                Попробовать снова
            </button>
        </div>
    );
}
