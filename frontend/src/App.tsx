import { useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultsList from './components/ResultsList';
import { getAlternativeSuggestions, searchMedicines } from './lib/api';
import type { AlternativeSuggestion, MedicineSearchResult } from './types';

export default function App() {
	const [results, setResults] = useState<MedicineSearchResult[]>([]);
	const [alternatives, setAlternatives] = useState<AlternativeSuggestion[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSearch(query: string, location: string) {
		setLoading(true);
		setError(null);
		try {
			const [searchRes, altRes] = await Promise.all([
				searchMedicines(query, location),
				getAlternativeSuggestions(query),
			]);
			setResults(searchRes);
			setAlternatives(altRes);
		} catch (e: any) {
			setError(e?.message || 'Something went wrong');
			setResults([]);
			setAlternatives([]);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="mx-auto max-w-4xl p-6">
			<header className="mb-6">
				<h1 className="text-3xl font-bold">MediFind</h1>
				<p className="text-gray-600">Find nearby pharmacies and compare medicine prices.</p>
			</header>
			<SearchBar onSearch={handleSearch} />
			<ResultsList results={results} loading={loading} error={error} alternatives={alternatives} />
		</div>
	);
}


