import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

// Load mock data
const pharmacies = JSON.parse(readFileSync(join(__dirname, 'mock', 'pharmacies.json'), 'utf-8'));
const medicines = JSON.parse(readFileSync(join(__dirname, 'mock', 'medicines.json'), 'utf-8'));
const inventory = JSON.parse(readFileSync(join(__dirname, 'mock', 'inventory.json'), 'utf-8'));

function normalize(str) {
    return (str || '').toString().trim().toLowerCase();
}
function tokenize(str) {
    return normalize(str)
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

// Health
app.get('/api/health', (_req, res) => {
	res.json({ ok: true, service: 'MediFind Backend' });
});

// Pharmacies listing
app.get('/api/pharmacies', (req, res) => {
	const qLocation = normalize(req.query.location);
	let results = pharmacies;
	if (qLocation) {
		results = pharmacies.filter((p) => normalize(p.location).includes(qLocation));
	}
	res.json(results);
});

// Medicine search combining inventory and medicines + pharmacies
app.get('/api/medicines/search', (req, res) => {
	const q = normalize(req.query.q);
	const qLocation = normalize(req.query.location);
	if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

    const qTokens = tokenize(q);
    const matchedMedicineIds = medicines
        .filter((m) => {
            const name = normalize(m.name);
            const generic = normalize(m.genericName);
            if (name.includes(q) || generic.includes(q)) return true;
            // All tokens must appear in either name or generic (order-insensitive)
            return qTokens.every((t) => name.includes(t) || generic.includes(t));
        })
        .map((m) => m.id);

	const pharmacyById = new Map(pharmacies.map((p) => [p.id, p]));

	let results = inventory
		.filter((item) => matchedMedicineIds.includes(item.medicineId))
		.map((item) => {
			const med = medicines.find((m) => m.id === item.medicineId);
			const ph = pharmacyById.get(item.pharmacyId);
			return {
				medicineId: med.id,
				medicineName: med.name,
				genericName: med.genericName,
				pharmacyId: ph.id,
				pharmacyName: ph.name,
				location: ph.location,
				price: item.price,
				availability: item.availability,
			};
		})
		.filter((row) => (qLocation ? normalize(row.location).includes(qLocation) : true))
		.sort((a, b) => a.price - b.price);

	// If no results for a city, synthesize reasonable mock prices for that city
	if (results.length === 0 && qLocation) {
		const cityPharmacies = pharmacies.filter((p) => normalize(p.location).includes(qLocation));
		if (cityPharmacies.length > 0 && matchedMedicineIds.length > 0) {
			// Build base price per medicine from existing inventory as median; fallback 25
			const priceByMed = new Map();
			for (const medId of matchedMedicineIds) {
				const prices = inventory.filter((i) => i.medicineId === medId).map((i) => i.price).sort((a,b)=>a-b);
				const median = prices.length ? prices[Math.floor(prices.length/2)] : 25;
				priceByMed.set(medId, median);
			}

			function pseudoVariance(seed) {
				let h = 0;
				for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
				return (h % 15) - 7; // -7..+7 percent
			}

			const synthetic = [];
			for (const ph of cityPharmacies) {
				for (const medId of matchedMedicineIds) {
					const med = medicines.find((m) => m.id === medId);
					const base = priceByMed.get(medId) ?? 25;
					const variancePct = pseudoVariance(`${ph.id}-${medId}`);
					const price = +(base * (1 + variancePct / 100)).toFixed(2);
					synthetic.push({
						medicineId: med.id,
						medicineName: med.name,
						genericName: med.genericName,
						pharmacyId: ph.id,
						pharmacyName: ph.name,
						location: ph.location,
						price,
						availability: Math.abs(variancePct) > 5 ? 'low_stock' : 'in_stock',
					});
				}
			}
			results = synthetic.sort((a, b) => a.price - b.price);
		}
	}

	res.json(results);
});

// AI alternatives (mocked)
app.get('/api/ai/alternatives', (req, res) => {
	const name = normalize(req.query.name);
	if (!name) return res.status(400).json({ error: 'Missing name parameter' });

	// Simple heuristic mock: find medicines sharing the same generic
	const direct = medicines.find((m) => normalize(m.name) === name);
	let suggestions = [];
	if (direct) {
		const sameGeneric = medicines.filter((m) => m.genericName === direct.genericName && m.id !== direct.id);
		suggestions = sameGeneric.slice(0, 3).map((m) => ({
			name: m.name,
			reason: `Shares generic ${m.genericName}.`,
			estimatedSavingsPercent: 10 + Math.floor(Math.random() * 25),
		}));
	}

	if (suggestions.length === 0) {
		// fallback generic suggestions by fuzzy includes
		const genericMatches = medicines
			.filter((m) => normalize(m.genericName).includes(name) || normalize(m.name).includes(name))
			.slice(0, 3)
			.map((m) => ({
				name: m.name,
				reason: `Potential substitute based on name similarity`,
				estimatedSavingsPercent: 5 + Math.floor(Math.random() * 20),
			}));
		suggestions = genericMatches;
	}

	res.json(suggestions);
});

app.listen(PORT, () => {
	console.log(`MediFind backend running on http://localhost:${PORT}`);
});


