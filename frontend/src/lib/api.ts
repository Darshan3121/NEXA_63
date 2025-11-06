import type { AlternativeSuggestion, MedicineSearchResult, Pharmacy } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function searchMedicines(query: string, location: string): Promise<MedicineSearchResult[]> {
	const url = new URL(`${API_BASE_URL}/api/medicines/search`);
	url.searchParams.set('q', query);
	if (location) url.searchParams.set('location', location);
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error('Failed to fetch search results');
	return res.json();
}

export async function getPharmacies(location: string): Promise<Pharmacy[]> {
	const url = new URL(`${API_BASE_URL}/api/pharmacies`);
	if (location) url.searchParams.set('location', location);
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error('Failed to fetch pharmacies');
	return res.json();
}

export async function getAlternativeSuggestions(name: string): Promise<AlternativeSuggestion[]> {
	const url = new URL(`${API_BASE_URL}/api/ai/alternatives`);
	url.searchParams.set('name', name);
	const res = await fetch(url.toString());
	if (!res.ok) throw new Error('Failed to fetch AI suggestions');
	return res.json();
}


