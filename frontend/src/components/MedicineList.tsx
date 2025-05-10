import React, { useState } from 'react';
import { Medicine } from '../types/medicine';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface MedicineListProps {
    medicines: Medicine[];
    onEdit: (medicine: Medicine) => void;
    onDelete: (id: string) => void;
}

const MedicineList: React.FC<MedicineListProps> = ({ medicines, onEdit, onDelete }) => {
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string | null }>({
        show: false,
        id: null
    });

    const handleDeleteClick = (id: string) => {
        setDeleteConfirm({ show: true, id });
    };

    const handleConfirmDelete = () => {
        if (deleteConfirm.id) {
            onDelete(deleteConfirm.id);
            setDeleteConfirm({ show: false, id: null });
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm({ show: false, id: null });
    };

    return (
        <>
            <div className="bg-gradient-to-br from-white to-blue-50 shadow-xl rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-200">
                        <thead className="bg-gradient-to-r from-blue-500 to-indigo-600">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Generic Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Brand Name
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-blue-100">
                            {medicines.map((medicine) => (
                                <tr key={medicine._id} className="hover:bg-blue-50 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {medicine.genericName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {medicine.brandName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {medicine.medicineType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                        ${medicine.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                            medicine.quantity > 10 
                                                ? 'bg-green-100 text-green-800' 
                                                : medicine.quantity > 0 
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                        }`}>
                                            {medicine.quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => onEdit(medicine)}
                                                className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-full transition-colors duration-200"
                                                title="Edit"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(medicine._id)}
                                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-colors duration-200"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full backdrop-blur-sm z-50">
                    <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-xl bg-gradient-to-br from-white to-red-50">
                        <div className="flex flex-col items-center text-center">
                            <div className="p-3 bg-red-100 rounded-full mb-4">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Confirm Deletion
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this medicine? This action cannot be undone.
                            </p>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelDelete}
                                    className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MedicineList; 