"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

    const confirm = (opts: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setOptions(opts);
            setIsOpen(true);
            setResolveRef(() => resolve);
        });
    };

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        resolveRef?.(false);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Confirm Modal */}
            {isOpen && options && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="glass w-full max-w-sm rounded-2xl overflow-hidden animate-scale-in">
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${options.danger ? 'bg-red-500/20' : 'bg-amber-500/20'
                                    }`}>
                                    <AlertTriangle className={`w-6 h-6 ${options.danger ? 'text-red-400' : 'text-amber-400'}`} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">{options.title}</h3>
                                    <p className="text-muted text-sm">{options.message}</p>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted" />
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3 p-4 pt-0">
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-3 rounded-xl glass-light font-medium hover-scale"
                            >
                                {options.cancelText || 'Cancel'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 py-3 rounded-xl font-medium hover-scale text-white ${options.danger ? 'bg-red-500 hover:bg-red-600' : 'gradient-bg'
                                    }`}
                            >
                                {options.confirmText || 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        // Fallback to native confirm if used outside provider
        return {
            confirm: async (opts: ConfirmOptions) => window.confirm(opts.message)
        };
    }
    return context;
}
