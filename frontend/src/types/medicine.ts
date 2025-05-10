export interface Medicine {
    _id: string;
    genericName: string;
    brandName: string;
    medicineType: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Cream' | 'Ointment' | 'Drops' | 'Other';
    price: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
}

export interface MedicineFormData {
    genericName: string;
    brandName: string;
    medicineType: string;
    price: number;
    quantity: number;
} 