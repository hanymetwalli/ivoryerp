import React from 'react';
import PermissionsForm from '@/components/PermissionsForm';

const Permissions = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">طلب استئذان</h2>
            </div>
            <PermissionsForm />
        </div>
    );
};

export default Permissions;
