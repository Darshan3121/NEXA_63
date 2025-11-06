import { useState } from 'react';

type Props = {
	onSearch: (query: string, location: string) => void;
  defaultQuery?: string;
  defaultLocation?: string;
};

export default function SearchBar({ onSearch, defaultQuery = '', defaultLocation = '' }: Props) {
	const [query, setQuery] = useState<string>(defaultQuery);
	const [location, setLocation] = useState<string>(defaultLocation);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!query.trim()) return;
		onSearch(query.trim(), location.trim());
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
			<input
				type="text"
				placeholder="Search medicines (e.g., Paracetamol)"
				className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
			<input
				type="text"
				placeholder="Enter your location (e.g., Boston)"
				className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none sm:max-w-xs"
				value={location}
				onChange={(e) => setLocation(e.target.value)}
			/>
			<button
				type="submit"
				className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700"
			>
				Search
			</button>
		</form>
	);
}


