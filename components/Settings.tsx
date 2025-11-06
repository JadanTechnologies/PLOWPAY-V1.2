import React from 'react';
import Icon from './icons';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 bg-gray-800 rounded-lg shadow-md text-center">
        <Icon name="settings" className="w-16 h-16 text-indigo-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-gray-400">This section is under construction. You will be able to manage your account, branches, and integrations here.</p>
      </div>
    </div>
  );
};

export default Settings;
