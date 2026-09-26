// Seed data - values taken directly from protoPlan.md / PS26062_research.md
// Do not invent tonnage. Sea tonnage unknown, only 18T air + 600 barrels + container counts are real.

export const stations = [
  { id: 'maitri', name: 'Maitri', year: 1989, berths: 25, lat: -70.76, lon: 11.73, note: '1989, past 10-yr design life' },
  { id: 'bharati', name: 'Bharati', year: 2012, berths: 47, berthsEmergency: 25, lat: -69.4, lon: 76.19, note: '2012, 3000 km east of Maitri, 134 containers' },
  { id: 'himadri', name: 'Himadri', year: 2008, berths: 8, lat: 78.92, lon: 11.95, note: 'Arctic, 1200 km from North Pole' }
];

export const skus = [
  { id: 'jeta1', name: 'Jet-A1 barrel', category: 'fuel', unit: 'barrel', weightKg: 170, volumeM3: 0.22, hazmat: true, cold: false, perDay: 2.5 },
  { id: 'rice', name: 'Rice 25kg', category: 'food', unit: 'bag', weightKg: 25, volumeM3: 0.04, hazmat: false, cold: false, perDay: 3 },
  { id: 'dal', name: 'Dal 10kg', category: 'food', unit: 'bag', weightKg: 10, volumeM3: 0.02, hazmat: false, cold: false, perDay: 2 },
  { id: 'milk', name: 'Milk powder', category: 'food', unit: 'box', weightKg: 5, volumeM3: 0.02, hazmat: false, cold: false, perDay: 2 },
  { id: 'para', name: 'Paracetamol', category: 'medical', unit: 'strip', weightKg: 0.1, volumeM3: 0.001, hazmat: false, cold: false, perDay: 8 },
  { id: 'amox', name: 'Amoxicillin', category: 'medical', unit: 'box', weightKg: 0.5, volumeM3: 0.005, hazmat: false, cold: true, perDay: 3 },
  { id: 'dfilter', name: 'Diesel filter', category: 'spare', unit: 'pc', weightKg: 2, volumeM3: 0.01, hazmat: false, cold: false, perDay: 0.4 },
  { id: 'drill', name: 'Drill bit set', category: 'spare', unit: 'set', weightKg: 4, volumeM3: 0.02, hazmat: false, cold: false, perDay: 0.3 },
  { id: 'tent', name: 'Tent fabric', category: 'spare', unit: 'roll', weightKg: 15, volumeM3: 0.15, hazmat: false, cold: false, perDay: 0.2 },
  { id: 'baa', name: 'Battery AA', category: 'spare', unit: 'pack', weightKg: 1, volumeM3: 0.005, hazmat: false, cold: false, perDay: 2 },
  { id: 'cryo', name: 'Cryo vial box', category: 'science', unit: 'box', weightKg: 3, volumeM3: 0.02, hazmat: false, cold: true, perDay: 0.5 },
  { id: 'modem', name: 'Sat modem spare', category: 'science', unit: 'pc', weightKg: 6, volumeM3: 0.05, hazmat: false, cold: false, perDay: 0.1 }
];

export const institutes = ['NCPOR', 'IMD', 'ISRO', 'AIIMS-logistics', 'IITM', 'NIO', 'WIHG', 'CMLRE'];

export const indents = [
  { id: 'ind1', institute: 'NCPOR', skuId: 'jeta1', qty: 600, priority: 1, hazmat: true, lane: 'ship', status: 'approved' },
  { id: 'ind2', institute: 'IMD', skuId: 'baa', qty: 200, priority: 2, hazmat: false, lane: 'ship', status: 'approved' },
  { id: 'ind3', institute: 'ISRO', skuId: 'modem', qty: 4, priority: 1, hazmat: false, lane: 'air', status: 'approved' },
  { id: 'ind4', institute: 'AIIMS-logistics', skuId: 'para', qty: 800, priority: 1, hazmat: false, lane: 'air', status: 'approved' },
  { id: 'ind5', institute: 'AIIMS-logistics', skuId: 'amox', qty: 300, priority: 1, hazmat: false, lane: 'air', status: 'pending' },
  { id: 'ind6', institute: 'NIO', skuId: 'cryo', qty: 40, priority: 2, hazmat: false, lane: 'air', status: 'approved' },
  { id: 'ind7', institute: 'IITM', skuId: 'drill', qty: 20, priority: 3, hazmat: false, lane: 'ship', status: 'pending' },
  { id: 'ind8', institute: 'WIHG', skuId: 'tent', qty: 30, priority: 2, hazmat: false, lane: 'ship', status: 'approved' },
  { id: 'ind9', institute: 'CMLRE', skuId: 'rice', qty: 300, priority: 2, hazmat: false, lane: 'ship', status: 'approved' },
  { id: 'ind10', institute: 'NCPOR', skuId: 'dfilter', qty: 60, priority: 2, hazmat: false, lane: 'ship', status: 'approved' }
];

export const cratesInitial = [
  { id: 'CR-101', qr: 'POL-101', skuId: 'jeta1', qty: 50, leg: 'Mumbai', status: 'in-transit', hazmat: true, lane: 'ship' },
  { id: 'CR-102', qr: 'POL-102', skuId: 'jeta1', qty: 60, leg: 'Goa', status: 'packed', hazmat: true, lane: 'ship' },
  { id: 'CR-103', qr: 'POL-103', skuId: 'rice', qty: 40, leg: 'Cape Town', status: 'in-transit', hazmat: false, lane: 'ship' },
  { id: 'CR-104', qr: 'POL-104', skuId: 'para', qty: 200, leg: 'Goa', status: 'packed', hazmat: false, lane: 'air' },
  { id: 'CR-105', qr: 'POL-105', skuId: 'amox', qty: 100, leg: 'Mumbai', status: 'in-transit', hazmat: false, lane: 'air', cold: true },
  { id: 'CR-106', qr: 'POL-106', skuId: 'cryo', qty: 10, leg: 'Cape Town', status: 'in-transit', hazmat: false, lane: 'air', cold: true },
  { id: 'CR-107', qr: 'POL-107', skuId: 'baa', qty: 50, leg: 'Vessel', status: 'in-transit', hazmat: false, lane: 'ship' },
  { id: 'CR-108', qr: 'POL-108', skuId: 'tent', qty: 10, leg: 'Goa', status: 'packed', hazmat: false, lane: 'ship' },
  { id: 'CR-109', qr: 'POL-109', skuId: 'dfilter', qty: 20, leg: 'Vessel', status: 'in-transit', hazmat: false, lane: 'ship' },
  { id: 'CR-110', qr: 'POL-110', skuId: 'modem', qty: 2, leg: 'Mumbai', status: 'in-transit', hazmat: false, lane: 'air' },
  { id: 'CR-111', qr: 'POL-111', skuId: 'milk', qty: 60, leg: 'Offload', status: 'in-transit', hazmat: false, lane: 'ship' },
  { id: 'CR-112', qr: 'POL-112', skuId: 'dal', qty: 50, leg: 'Station', status: 'delivered', hazmat: false, lane: 'ship' }
];

export const scanEventsInitial = [
  { id: 'se1', crateId: 'CR-101', leg: 'Goa', at: '2022-10-15T08:00:00Z', actor: 'NCPOR Goa', note: 'Lot 1 dispatched' },
  { id: 'se2', crateId: 'CR-101', leg: 'Mumbai', at: '2022-10-22T08:00:00Z', actor: 'Mumbai port', note: 'Lot 1 sailed' },
  { id: 'se3', crateId: 'CR-103', leg: 'Mumbai', at: '2022-11-14T08:00:00Z', actor: 'Mumbai port', note: 'Lot 2 mobilised' },
  { id: 'se4', crateId: 'CR-103', leg: 'Cape Town', at: '2022-11-25T08:00:00Z', actor: 'Cape Town', note: 'Lot 2 sailed' },
  { id: 'se5', crateId: 'CR-112', leg: 'Station', at: '2023-01-10T08:00:00Z', actor: 'Maitri', note: 'Delivered Maitri' }
];

export const peopleInitial = [
  { id: 'p01', name: 'A. Sharma', role: 'Logistics', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', skills: 'cargo, driving', stationId: 'maitri', stage: 'station', allowancePerDay: 2000 },
  { id: 'p02', name: 'R. Iyer', role: 'Doctor', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', skills: 'medical, triage', stationId: 'maitri', stage: 'station', allowancePerDay: 2000 },
  { id: 'p03', name: 'S. Khan', role: 'Technician', nationality: 'Indian', medical: 'clear', medicalFlag: true, training: 'ITBP Auli done', skills: 'power, comms', stationId: 'bharati', stage: 'station', allowancePerDay: 2000 },
  { id: 'p04', name: 'M. Das', role: 'Cook', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', skills: 'kitchen', stationId: 'bharati', stage: 'station', allowancePerDay: 2000 },
  { id: 'p05', name: 'T. Nguyen', role: 'Scientist', nationality: 'Bangladeshi', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', skills: 'ice-core', stationId: 'bharati', stage: 'transit', allowancePerDay: 1500 },
  { id: 'p06', name: 'J. Perera', role: 'Nurse', nationality: 'Mauritian', medical: 'pending', medicalFlag: true, training: 'pending', skills: 'medical', stationId: 'maitri', stage: 'medical', allowancePerDay: 0 },
  { id: 'p07', name: 'K. Rao', role: 'Comms', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', skills: 'iridium, radio', stationId: 'himadri', stage: 'station', allowancePerDay: 1500 },
  { id: 'p08', name: 'P. Verma', role: 'Scientist', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'pending', skills: 'atmosphere', stationId: null, stage: 'application', allowancePerDay: 0 },
  { id: 'p09', name: 'L. Dube', role: 'Logistics', nationality: 'Mauritian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', skills: 'cargo', stationId: null, stage: 'berth', allowancePerDay: 1500 },
  { id: 'p10', name: 'N. Singh', role: 'Technician', nationality: 'Indian', medical: 'clear', medicalFlag: false, training: 'ITBP Auli done', skills: 'vehicle', stationId: 'maitri', stage: 'station', allowancePerDay: 2000 }
];

export const stockInitial = [
  { stationId: 'maitri', skuId: 'jeta1', qty: 320 },
  { stationId: 'maitri', skuId: 'rice', qty: 400 },
  { stationId: 'maitri', skuId: 'para', qty: 500 },
  { stationId: 'maitri', skuId: 'amox', qty: 120 },
  { stationId: 'maitri', skuId: 'baa', qty: 150 },
  { stationId: 'bharati', skuId: 'jeta1', qty: 280 },
  { stationId: 'bharati', skuId: 'rice', qty: 500 },
  { stationId: 'bharati', skuId: 'cryo', qty: 20 },
  { stationId: 'bharati', skuId: 'dfilter', qty: 30 },
  { stationId: 'himadri', skuId: 'para', qty: 100 },
  { stationId: 'himadri', skuId: 'baa', qty: 60 },
  { stationId: 'himadri', skuId: 'tent', qty: 8 }
];

export const incidentsInitial = [
  { id: 'in1', stationId: 'bharati', type: 'fire', severity: 'high', status: 'open', step: 1, detail: 'Fuel store smoke alarm', at: '2026-01-12T06:00:00Z', sbdSent: false },
  { id: 'in2', stationId: 'maitri', type: 'medevac', severity: 'medium', status: 'monitoring', step: 2, detail: 'Ankle injury, needs triage call', at: '2026-02-02T10:00:00Z', sbdSent: true }
];

export const playbooks = {
  fire: ['Raise alarm and cut power', 'Muster at safe point with headcount', 'Attack fire if safe, else contain', 'Report fuel and wind to NCPOR'],
  crevasse: ['Stop movement, anchor team', 'Muster and check missing', 'Rescue with rope team only', 'Send GPS burst to NCPOR'],
  medevac: ['Triage and stabilise', 'Share medical flag and vitals', 'Check weather and IL-76 vs ship lane', 'Request evacuation with cost note'],
  fuel_spill: ['Stop source, contain spill', 'Log barrels lost', 'Photo and waste entry', 'File DG-Shipping note']
};

export const LEGS = ['Goa', 'Mumbai', 'Cape Town', 'Vessel', 'Offload', 'Station'];
