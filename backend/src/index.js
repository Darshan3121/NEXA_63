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

	const matchedMedicineIds = medicines
		.filter((m) => normalize(m.name).includes(q) || normalize(m.genericName).includes(q))
		.map((m) => m.id);

	const pharmacyById = new Map(pharmacies.map((p) => [p.id, p]));

	const results = inventory
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


