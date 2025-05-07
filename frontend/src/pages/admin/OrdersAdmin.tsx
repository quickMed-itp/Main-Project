import React from 'react';
import AdminOrdersTable from '../../components/AdminOrdersTable';

const OrdersAdmin: React.FC = () => {
    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Orders Management</h1>
            <AdminOrdersTable />
        </div>
    );
};

export default OrdersAdmin;