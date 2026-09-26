// Local fallback seed so the Netlify demo works even without backend.
// Same values as backend/seed.js (from protoPlan.md).
export const stations = [
  { id: 'maitri', name: 'Maitri', year: 1989, berths: 25, note: '1989, past 10-yr design life' },
  { id: 'bharati', name: 'Bharati', year: 2012, berths: 47, note: '2012, 3000 km east of Maitri, 134 containers' },
  { id: 'himadri', name: 'Himadri', year: 2008, berths: 8, note: 'Arctic, 1200 km from North Pole' }
];

export const skus = [
  { id: 'jeta1', name: 'Jet-A1 barrel', category: 'fuel', unit: 'barrel', weightKg: 170, volumeM3: 0.22, hazmat: true, perDay: 2.5 },
  { id: 'rice', name: 'Rice 25kg', category: 'food', unit: 'bag', weightKg: 25, volumeM3: 0.04, hazmat: false, perDay: 3 },
  { id: 'dal', name: 'Dal 10kg', category: 'food', unit: 'bag', weightKg: 10, volumeM3: 0.02, hazmat: false, perDay: 2 },
  { id: 'milk', name: 'Milk powder', category: 'food', unit: 'box', weightKg: 5, volumeM3: 0.02, hazmat: false, perDay: 2 },
  { id: 'para', name: 'Paracetamol', category: 'medical', unit: 'strip', weightKg: 0.1, volumeM3: 0.001, hazmat: false, perDay: 8 },
  { id: 'amox', name: 'Amoxicillin', category: 'medical', unit: 'box', weightKg: 0.5, volumeM3: 0.005, hazmat: false, perDay: 3 },
  { id: 'dfilter', name: 'Diesel filter', category: 'spare', unit: 'pc', weightKg: 2, volumeM3: 0.01, hazmat: false, perDay: 0.4 },
  { id: 'drill', name: 'Drill bit set', category: 'spare', unit: 'set', weightKg: 4, volumeM3: 0.02, hazmat: false, perDay: 0.3 },
  { id: 'tent', name: 'Tent fabric', category: 'spare', unit: 'roll', weightKg: 15, volumeM3: 0.15, hazmat: false, perDay: 0.2 },
  { id: 'baa', name: 'Battery AA', category: 'spare', unit: 'pack', weightKg: 1, volumeM3: 0.005, hazmat: false, perDay: 2 },
  { id: 'cryo', name: 'Cryo vial box', category: 'science', unit: 'box', weightKg: 3, volumeM3: 0.02, hazmat: false, perDay: 0.5 },
  { id: 'modem', name: 'Sat modem spare', category: 'science', unit: 'pc', weightKg: 6, volumeM3: 0.05, hazmat: false, perDay: 0.1 }
];

export const crates = [
  { id: 'CR-101', skuId: 'jeta1', skuName: 'Jet-A1 barrel', qty: 50, leg: 'Mumbai', status: 'in-transit', lane: 'ship' },
  { id: 'CR-102', skuId: 'jeta1', skuName: 'Jet-A1 barrel', qty: 60, leg: 'Goa', status: 'packed', lane: 'ship' },
  { id: 'CR-103', skuId: 'rice', skuName: 'Rice 25kg', qty: 40, leg: 'Cape Town', status: 'in-transit', lane: 'ship' },
  { id: 'CR-104', skuId: 'para', skuName: 'Paracetamol', qty: 200, leg: 'Goa', status: 'packed', lane: 'air' },
  { id: 'CR-105', skuId: 'amox', skuName: 'Amoxicillin', qty: 100, leg: 'Mumbai', status: 'in-transit', lane: 'air' },
  { id: 'CR-106', skuId: 'cryo', skuName: 'Cryo vial box', qty: 10, leg: 'Cape Town', status: 'in-transit', lane: 'air' },
  { id: 'CR-107', skuId: 'baa', skuName: 'Battery AA', qty: 50, leg: 'Vessel', status: 'in-transit', lane: 'ship' },
  { id: 'CR-108', skuId: 'tent', skuName: 'Tent fabric', qty: 10, leg: 'Goa', status: 'packed', lane: 'ship' },
  { id: 'CR-109', skuId: 'dfilter', skuName: 'Diesel filter', qty: 20, leg: 'Vessel', status: 'in-transit', lane: 'ship' },
  { id: 'CR-110', skuId: 'modem', skuName: 'Sat modem spare', qty: 2, leg: 'Mumbai', status: 'in-transit', lane: 'air' }
];

export const people = [
  { id: 'p01', name: 'A. Sharma', role: 'Logistics', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', stationId: 'maitri', stage: 'station', allowancePerDay: 2000 },
  { id: 'p02', name: 'R. Iyer', role: 'Doctor', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', stationId: 'maitri', stage: 'station', allowancePerDay: 2000 },
  { id: 'p03', name: 'S. Khan', role: 'Technician', nationality: 'Indian', medical: 'clear', medicalFlag: true, training: 'ITBP Auli done', stationId: 'bharati', stage: 'station', allowancePerDay: 2000 },
  { id: 'p05', name: 'T. Nguyen', role: 'Scientist', nationality: 'Bangladeshi', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', stationId: 'bharati', stage: 'transit', allowancePerDay: 1500 },
  { id: 'p07', name: 'K. Rao', role: 'Comms', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', stationId: 'himadri', stage: 'station', allowancePerDay: 1500 }
];

export const LEGS = ['Goa', 'Mumbai', 'Cape Town', 'Vessel', 'Offload', 'Station'];
export const DAYS_UNTIL_DEC = 240;
