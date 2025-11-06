export type MedicineSearchResult = {
	medicineId: string;
	medicineName: string;
	genericName: string;
	pharmacyId: string;
	pharmacyName: string;
	location: string;
	price: number;
	availability: 'in_stock' | 'low_stock' | 'out_of_stock';
};

export type Pharmacy = {
	id: string;
	name: string;
	location: string;
	address: string;
	distanceKm?: number;
};

export type AlternativeSuggestion = {
	name: string;
	reason: string;
	estimatedSavingsPercent?: number;
};


