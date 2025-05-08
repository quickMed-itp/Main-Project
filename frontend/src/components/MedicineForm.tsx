import React, { useState, useEffect } from 'react';
import { Medicine, MedicineFormData } from '../types/medicine';
import { X } from 'lucide-react';

interface MedicineFormProps {
    medicine: Medicine | null;
    onSubmit: (data: MedicineFormData) => void;
    onClose: () => void;
}

const MedicineForm: React.FC<MedicineFormProps> = ({ medicine, onSubmit, onClose }) => {
    const [formData, setFormData] = useState<MedicineFormData>({
        genericName: '',
        brandName: '',
        medicineType: 'Tablet',
        price: undefined,
        quantity: undefined
    });

    useEffect(() => {
        if (medicine) {
            setFormData({
                genericName: medicine.genericName,
                brandName: medicine.brandName,
                medicineType: medicine.medicineType,
                price: medicine.price,
                quantity: medicine.quantity
            });
        }
    }, [medicine]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'quantity' ? (value === '' ? undefined : Number(value)) : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full backdrop-blur-sm">
            <div className="relative top-20 mx-auto p-6 border w-96 shadow-2xl rounded-xl bg-gradient-to-br from-white to-blue-50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {medicine ? 'Edit Medicine' : 'Add New Medicine'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Generic Name
                        </label>
                        <input
                            type="text"
                            name="genericName"
                            value={formData.genericName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter generic name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Brand Name
                        </label>
                        <input
                            type="text"
                            name="brandName"
                            value={formData.brandName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter brand name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Medicine Type
                        </label>
                        <select
                            name="medicineType"
                            value={formData.medicineType}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        >
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Injection">Injection</option>
                            <option value="Cream">Cream</option>
                            <option value="Ointment">Ointment</option>
                            <option value="Drops">Drops</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Price
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price === undefined ? '' : formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            placeholder="Enter price"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Quantity
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity === undefined ? '' : formData.quantity}
                            onChange={handleChange}
                            required
                            min="0"
                            placeholder="Enter quantity"
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg transition-colors duration-200"
                        >
                            {medicine ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicineForm; 