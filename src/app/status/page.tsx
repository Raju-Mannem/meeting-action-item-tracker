'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface HealthStatus {
    backend: string;
    database: string;
    llm: string;
}

export default function StatusPage() {
    const [status, setStatus] = useState<HealthStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch('/api/health');
                if (!res.ok) throw new Error('Failed to fetch health status');
                const data = await res.json();
                setStatus(data);
            } catch (err) {
                setError('Could not connect to health service');
            } finally {
                setLoading(false);
            }
        };

        fetchHealth();
    }, []);

    const StatusIndicator = ({ status, label }: { status: string; label: string }) => {
        const isHealthy = status === 'healthy' || status === 'ready';
        const isError = status === 'unhealthy' || status === 'error';

        return (
            <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-lg border border-red-200 dark:border-zinc-800">
                <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
                <div className="flex items-center gap-2">
                    {isHealthy ? (
                        <CheckCircle2 className="w-5 h-5 text-red-500" />
                    ) : isError ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                    )}
                    <span className={clsx(
                        "text-sm font-medium capitalize",
                        isHealthy ? "text-red-600" : isError ? "text-red-600" : "text-yellow-600"
                    )}>
                        {status}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-red-600 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Status</h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        Current operational status of all services
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-lg border border-red-200 dark:border-red-800 text-center">
                        {error}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <StatusIndicator status={status?.backend || 'unknown'} label="Backend API" />
                        <StatusIndicator status={status?.database || 'unknown'} label="Database Connection" />
                        <StatusIndicator status={status?.llm || 'unknown'} label="LLM Service (Groq)" />
                    </div>
                )}
            </div>
        </div>
    );
}
