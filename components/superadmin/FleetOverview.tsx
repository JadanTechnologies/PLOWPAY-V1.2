import React from 'react';
import Icon from '../icons';

const FleetOverview: React.FC = () => {
    return (
        <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700 text-center">
            <Icon name="truck" className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Fleet Overview</h2>
            <p className="text-slate-400 mt-2">This feature is currently under development and will be available soon.</p>
        </div>
    );
};

export default FleetOverview;
