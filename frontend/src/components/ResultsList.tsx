import type { AlternativeSuggestion, MedicineSearchResult } from '../types';

type Props = {
	results: MedicineSearchResult[];
	loading?: boolean;
	error?: string | null;
	alternatives?: AlternativeSuggestion[];
};

export default function ResultsList({ results, loading, error, alternatives }: Props) {
	if (loading) return <div className="mt-4 text-gray-600">Loading...</div>;
	if (error) return <div className="mt-4 text-red-600">{error}</div>;

	return (
		<div className="mt-6 grid gap-4">
			{results.length === 0 ? (
				<div className="text-gray-600">No results yet. Try a search above.</div>
			) : (
				results.map((r) => (
					<div key={`${r.pharmacyId}-${r.medicineId}`} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-lg font-semibold">{r.medicineName} <span className="text-sm text-gray-500">({r.genericName})</span></div>
								<div className="text-sm text-gray-600">{r.pharmacyName} • {r.location}</div>
							</div>
							<div className="text-right">
								<div className="text-xl font-bold">${r.price.toFixed(2)}</div>
								<div className="text-sm capitalize text-gray-600">{r.availability.replace('_', ' ')}</div>
							</div>
						</div>
					</div>
				))
			)}
			{alternatives && alternatives.length > 0 && (
				<div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
					<div className="mb-2 font-semibold text-blue-900">AI Suggested Alternatives</div>
					<ul className="list-inside list-disc text-blue-900">
						{alternatives.map((a) => (
							<li key={a.name}>
								<span className="font-medium">{a.name}</span>
								{a.estimatedSavingsPercent ? (
									<span className="ml-2 text-sm">(~{a.estimatedSavingsPercent}% cheaper)</span>
								) : null}
								<div className="text-sm">{a.reason}</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}


