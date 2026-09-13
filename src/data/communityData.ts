export interface Society {
  id: string;
  name: string;
  shortName: string;
  locality: string;
  city: string;
  totalFlats: number;
  managerName: string;
  managerPhone: string;
  securityGate: string;
  societyRegNo: string;
}

export interface CrewMember {
  id: string;
  name: string;
  trade: string;
  role: 'LEAD' | 'SPECIALIST' | 'ASSISTANT';
  phone: string;
  avatarInitials: string;
}

export interface CommunityPackage {
  id: string;
  title: string;
  tradeCategory: 'Cleaning' | 'Plumbing' | 'Electrician' | 'Appliance Repair' | 'Society AMC';
  crewSize: number;
  leadWorkerName: string;
  leadWorkerTrade: string;
  leadWorkerPhone: string;
  crewRoster: CrewMember[];
  durationHours: number;
  baseRateINR: number;
  discountedRateINR: number;
  residentSavingsPercent: number;
  includedEquipment: string[];
  scopePoints: string[];
  popular?: boolean;
}

export interface CommunityBooking {
  id: string;
  societyId: string;
  societyName: string;
  packageId: string;
  packageTitle: string;
  crewSize: number;
  leadWorkerName: string;
  crewRoster: CrewMember[];
  scheduledDate: string;
  scheduledTime: string;
  totalAmount: number;
  workerOtp: string;
  status: 'SCHEDULED' | 'CREW_EN_ROUTE' | 'IN_PROGRESS' | 'COMPLETED';
  orderedBy: string;
  ordererPhone: string;
  poolSharePerWorker: number;
  createdAt: string;
}

export const registeredSocieties: Society[] = [
  {
    id: 'soc-101',
    name: 'Shanti Heights Resident Society',
    shortName: 'Shanti Heights',
    locality: 'Sector 12, Navrangpura',
    city: 'Ahmedabad',
    totalFlats: 120,
    managerName: 'Kiritbhai Shah (Chairman)',
    managerPhone: '+91 98250 11223',
    securityGate: 'Main Gate 1 & 2 Security Cabin',
    societyRegNo: 'GUJ/AHM/2018/4891'
  },
  {
    id: 'soc-102',
    name: 'Gokuldham Co-op Housing Society',
    shortName: 'Gokuldham Society',
    locality: 'Near Vastrapur Lake, Vastrapur',
    city: 'Ahmedabad',
    totalFlats: 85,
    managerName: 'Pravin Solanki (Secretary)',
    managerPhone: '+91 98980 44556',
    securityGate: 'North Gate Tower Reception',
    societyRegNo: 'GUJ/AHM/2015/3104'
  },
  {
    id: 'soc-103',
    name: 'Surat Diamond Enclave',
    shortName: 'Diamond Enclave',
    locality: 'Mini Bazar, Varachha',
    city: 'Surat',
    totalFlats: 240,
    managerName: 'Hareshbhai Patel (Manager)',
    managerPhone: '+91 97270 99887',
    securityGate: 'Commercial & Residential Boom Barrier',
    societyRegNo: 'GUJ/SUR/2020/7812'
  },
  {
    id: 'soc-104',
    name: 'Sayaji Green Towers & Villas',
    shortName: 'Sayaji Green',
    locality: 'Old Padra Road, Akota',
    city: 'Vadodara',
    totalFlats: 160,
    managerName: 'Dipak Desai (Society Admin)',
    managerPhone: '+91 94260 33221',
    securityGate: 'Clubhouse Entrance & Visitors Desk',
    societyRegNo: 'GUJ/BRD/2019/6231'
  }
];

export const communityPackages: CommunityPackage[] = [
  {
    id: 'comm-pkg-1',
    title: 'Full Society Overhead & Underground Water Tank Disinfection',
    tradeCategory: 'Plumbing',
    crewSize: 4,
    leadWorkerName: 'Mahesh Barot',
    leadWorkerTrade: 'Master Sanitarian & Jetting Pro',
    leadWorkerPhone: '+91 98252 01004',
    crewRoster: [
      { id: 'cw-1', name: 'Mahesh Barot', trade: 'Drain & Jetting Specialist', role: 'LEAD', phone: '+91 98252 01004', avatarInitials: 'MB' },
      { id: 'cw-2', name: 'Vikram Makwana', trade: 'Seepage & Pressure Tester', role: 'SPECIALIST', phone: '+91 98252 01002', avatarInitials: 'VM' },
      { id: 'cw-3', name: 'Dinesh Solanki', trade: 'High-Pressure Pipe Fitter', role: 'SPECIALIST', phone: '+91 98252 01003', avatarInitials: 'DS' },
      { id: 'cw-4', name: 'Kanti Vaghela', trade: 'Sludge Pump & Tank Tech', role: 'ASSISTANT', phone: '+91 98252 01014', avatarInitials: 'KV' }
    ],
    durationHours: 4,
    baseRateINR: 6500,
    discountedRateINR: 4200,
    residentSavingsPercent: 35,
    includedEquipment: [
      'Industrial Rotary Jet Scrubber',
      'High-Volume Sludge Extraction Pump',
      'Antibacterial Chlorine Mist Sprayer',
      'Confined Space Safety Harness & Gas Detector'
    ],
    scopePoints: [
      'Complete de-watering of underground sump and overhead tanks (up to 4 tanks)',
      'High pressure water jetting to clear biofilm, silt and calcification',
      'Anti-bacterial food-grade potassium permanganate / chlorine treatment',
      'Final UV sterilization & water refill readiness certificate'
    ],
    popular: true
  },
  {
    id: 'comm-pkg-2',
    title: 'Apartment Common Area, Staircases & Parking Deep Sanitization',
    tradeCategory: 'Cleaning',
    crewSize: 6,
    leadWorkerName: 'Sunita Mehra',
    leadWorkerTrade: 'Master Environmental Sanitization',
    leadWorkerPhone: '+91 98251 01001',
    crewRoster: [
      { id: 'cw-5', name: 'Sunita Mehra', trade: 'Deep Cleaning Supervisor', role: 'LEAD', phone: '+91 98251 01001', avatarInitials: 'SM' },
      { id: 'cw-6', name: 'Rekha Parmar', trade: 'Floor Buffing Specialist', role: 'SPECIALIST', phone: '+91 98251 01002', avatarInitials: 'RP' },
      { id: 'cw-7', name: 'Manjula Solanki', trade: 'Glass & Railings Pro', role: 'SPECIALIST', phone: '+91 98251 01003', avatarInitials: 'MS' },
      { id: 'cw-8', name: 'Ramesh Vankar', trade: 'Heavy Machine Operator', role: 'SPECIALIST', phone: '+91 98251 01004', avatarInitials: 'RV' },
      { id: 'cw-9', name: 'Bhavna Dabhi', trade: 'Stairwell Sanitizer', role: 'ASSISTANT', phone: '+91 98251 01005', avatarInitials: 'BD' },
      { id: 'cw-10', name: 'Gita Rathod', trade: 'Basement Degreaser', role: 'ASSISTANT', phone: '+91 98251 01006', avatarInitials: 'GR' }
    ],
    durationHours: 5,
    baseRateINR: 8500,
    discountedRateINR: 5400,
    residentSavingsPercent: 36,
    includedEquipment: [
      'Twin-Motor Industrial Floor Scrubber & Polisher',
      'Electrostatic Chemical Fogger',
      '200-Bar Hot Water Pressure Washer',
      'Oil Stain Degreaser Applicator'
    ],
    scopePoints: [
      'Machine buffing of clubhouse, ground lobby & staircase landings across all wings',
      'Basement parking lot oil degreasing and tire mark cleaning',
      'Glass curtain wall, terrace railings & entrance arch pressure washing',
      'Society waste collection room disinfecting & deodorizing'
    ],
    popular: true
  },
  {
    id: 'comm-pkg-3',
    title: 'Monsoon Storm Drain Jetting & Sewerage Trunk Line Clearing',
    tradeCategory: 'Plumbing',
    crewSize: 4,
    leadWorkerName: 'Rajesh Kumar',
    leadWorkerTrade: 'Senior Sanitary Infrastructure Eng.',
    leadWorkerPhone: '+91 98252 01001',
    crewRoster: [
      { id: 'cw-11', name: 'Rajesh Kumar', trade: 'Trunk Line Specialist', role: 'LEAD', phone: '+91 98252 01001', avatarInitials: 'RK' },
      { id: 'cw-12', name: 'Mahesh Barot', trade: 'Drain Jetting Master', role: 'SPECIALIST', phone: '+91 98252 01004', avatarInitials: 'MB' },
      { id: 'cw-13', name: 'Pankaj Rathwa', trade: 'Camera Inspection Tech', role: 'SPECIALIST', phone: '+91 98252 01011', avatarInitials: 'PR' },
      { id: 'cw-14', name: 'Anil Chavda', trade: 'Chamber De-silt Assistant', role: 'ASSISTANT', phone: '+91 98252 01012', avatarInitials: 'AC' }
    ],
    durationHours: 4,
    baseRateINR: 7200,
    discountedRateINR: 4800,
    residentSavingsPercent: 33,
    includedEquipment: [
      'Rothenberger 60-Meter Power Snake Rig',
      'High-Pressure Forward/Backward Jetting Nozzles',
      'CCTV Pipeline Inspection Endoscope',
      'Heavy Chamber Hook & Air Blower'
    ],
    scopePoints: [
      'Full unblocking of perimeter stormwater drains before monsoon inundation',
      'High velocity water jetting of kitchen vertical waste stacks to municipal manhole',
      'Inspection of all 18 ground chambers for root intrusion or pipe collapse',
      'Removal of construction silt & plastic debris from discharge culvert'
    ]
  },
  {
    id: 'comm-pkg-4',
    title: 'Society Main Electrical Distribution, DG Set & Streetlight AMC Overhaul',
    tradeCategory: 'Electrician',
    crewSize: 4,
    leadWorkerName: 'Karan Sharma',
    leadWorkerTrade: 'Master High-Voltage Specialist',
    leadWorkerPhone: '+91 98253 01001',
    crewRoster: [
      { id: 'cw-15', name: 'Karan Sharma', trade: 'LT Panel & DG Master', role: 'LEAD', phone: '+91 98253 01001', avatarInitials: 'KS' },
      { id: 'cw-16', name: 'Brijesh Prajapati', trade: 'Earth Resistance Specialist', role: 'SPECIALIST', phone: '+91 98253 01002', avatarInitials: 'BP' },
      { id: 'cw-17', name: 'Hitesh Panchal', trade: 'Streetlight & Pump Electrician', role: 'SPECIALIST', phone: '+91 98253 01003', avatarInitials: 'HP' },
      { id: 'cw-18', name: 'Sanjay Rawat', trade: 'Thermal Imaging Assistant', role: 'ASSISTANT', phone: '+91 98253 01004', avatarInitials: 'SR' }
    ],
    durationHours: 4,
    baseRateINR: 7500,
    discountedRateINR: 4900,
    residentSavingsPercent: 35,
    includedEquipment: [
      'Fluke Thermal Imaging Hot-Spot Camera',
      'Digital Earth Resistance Megger Tester (4 Pits)',
      '10-Meter Fiber Retractable Extension Ladder',
      'Arc Flash Safety Shield & Insulated Torquing Tools'
    ],
    scopePoints: [
      'Thermal scan of Main Substation Panels & Busbars to identify loose sparking lugs',
      'Testing of all campus earthing pits & chemical replenishment recommendation',
      'DG generator auto-mains failure (AMF) synchronization test under building load',
      'Repair & timer alignment for 24 perimeter LED streetlights & garden fixtures'
    ]
  }
];

export const defaultActiveCommunityBooking: CommunityBooking = {
  id: 'comm_bk_shanti_924',
  societyId: 'soc-101',
  societyName: 'Shanti Heights Resident Society',
  packageId: 'comm-pkg-1',
  packageTitle: 'Full Society Overhead & Underground Water Tank Disinfection',
  crewSize: 4,
  leadWorkerName: 'Mahesh Barot',
  crewRoster: communityPackages[0].crewRoster,
  scheduledDate: 'Today, 02:00 PM',
  scheduledTime: '02:00 PM - 06:00 PM',
  totalAmount: 4200,
  workerOtp: '9240',
  status: 'CREW_EN_ROUTE',
  orderedBy: 'Kiritbhai Shah (Chairman / Flat 402)',
  ordererPhone: '+91 98250 11223',
  poolSharePerWorker: 1050,
  createdAt: new Date().toISOString()
};
