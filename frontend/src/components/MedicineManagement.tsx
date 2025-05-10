import React, { useState, useEffect } from 'react';
import { Medicine, MedicineFormData } from '../types/medicine';
import { medicineService } from '../services/medicineService';
import MedicineForm from './MedicineForm';
import MedicineList from './MedicineList';

const MedicineManagement: React.FC = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMedicines = async () => {
        try {
            setIsLoading(true);
            const data = await medicineService.getAllMedicines();
            setMedicines(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch medicines');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    const handleAddMedicine = () => {
        setSelectedMedicine(null);
        setIsFormOpen(true);
    };

    const handleEditMedicine = (medicine: Medicine) => {
        setSelectedMedicine(medicine);
        setIsFormOpen(true);
    };

    const handleDeleteMedicine = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await medicineService.deleteMedicine(id);
                await fetchMedicines();
                setError(null);
            } catch (err) {
                setError('Failed to delete medicine');
                console.error(err);
            }
        }
    };

    const handleSubmit = async (formData: MedicineFormData) => {
        try {
            if (selectedMedicine) {
                await medicineService.updateMedicine(selectedMedicine._id, formData);
            } else {
                await medicineService.createMedicine(formData);
            }
            await fetchMedicines();
            setIsFormOpen(false);
            setError(null);
        } catch (err) {
            setError('Failed to save medicine');
            console.error(err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Medicine Management</h1>
                <button
                    onClick={handleAddMedicine}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Add New Medicine
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="text-center py-4">Loading...</div>
            ) : (
                <MedicineList
                    medicines={medicines}
                    onEdit={handleEditMedicine}
                    onDelete={handleDeleteMedicine}
                />
            )}

            {isFormOpen && (
                <MedicineForm
                    medicine={selectedMedicine}
                    onSubmit={handleSubmit}
                    onClose={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
};

export default MedicineManagement; 