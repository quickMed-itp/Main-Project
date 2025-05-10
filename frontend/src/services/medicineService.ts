import axios from 'axios';
import { Medicine, MedicineFormData } from '../types/medicine';

const API_URL = 'http://localhost:5000/api/v1/medicines';

export const medicineService = {
    getAllMedicines: async (): Promise<Medicine[]> => {
        const response = await axios.get(API_URL);
        return response.data;
    },

    getMedicine: async (id: string): Promise<Medicine> => {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    },

    createMedicine: async (medicineData: MedicineFormData): Promise<Medicine> => {
        const response = await axios.post(API_URL, medicineData);
        return response.data;
    },

    updateMedicine: async (id: string, medicineData: MedicineFormData): Promise<Medicine> => {
        const response = await axios.put(`${API_URL}/${id}`, medicineData);
        return response.data;
    },

    deleteMedicine: async (id: string): Promise<void> => {
        await axios.delete(`${API_URL}/${id}`);
    }
}; 