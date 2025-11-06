
import React from 'react';
import Icon from './icons';
import { useAppContext } from '../hooks/useAppContext';

interface MaintenancePageProps {
    message: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ message }) => {
    const { brandConfig } = useAppContext();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white p-4">
            <div className="text-center max-w-2xl">
                <div className="inline-block mb-6">
                    {brandConfig.logoUrl ? (
                        <img src={brandConfig.logoUrl} alt={`${brandConfig.name} Logo`} className="h-12 w-auto" />
                    ) : (
                        <svg className="w-12 h-12 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.825-1.106-2.156 0-2.981.54-.403 1.25-.624 1.968-.624a4.58 4.58 0 0 1 .844.119" />
                        </svg>
                    )}
                </div>
                <Icon name="settings" className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin-slow" />
                <h1 className="text-4xl font-extrabold mb-4">Under Maintenance</h1>
                <p className="text-lg text-gray-400 whitespace-pre-wrap">{message}</p>
            </div>
            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 10s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default MaintenancePage;
