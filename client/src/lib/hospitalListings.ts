export type FacilityGroup = "hospital" | "diagnostic";
export type FacilityFilter = "all" | FacilityGroup;

export type HospitalListing = {
  id: string;
  name: string;
  rating: number;
  reviewCount: string;
  type: string;
  group: FacilityGroup;
  location: string;
  hours: string;
  quote?: string;
  tags?: string[];
};

/** Details reproduced from the user-provided listing snapshot. */
export const hospitalListings: HospitalListing[] = [
  {
    id: "negen-vijayawada",
    name: "Negen - Best Diagnostics Center in Vijayawada [NABL Recognised] Best Full body check up & Scan Centre",
    rating: 5.0,
    reviewCount: "2.3K",
    type: "Diagnostic center",
    group: "diagnostic",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "The best diagnostic centre and very quick and fast home collection service",
    tags: ["Home collection"],
  },
  {
    id: "pramodini-diagnostics",
    name: "Pramodini Diagnostics",
    rating: 4.6,
    reviewCount: "2.4K",
    type: "Diagnostic center",
    group: "diagnostic",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "Good clean diagnostic centre, superb services",
  },
  {
    id: "manipal-hospital-vijayawada",
    name: "Manipal Hospital Vijayawada",
    rating: 4.9,
    reviewCount: "15.2K",
    type: "Hospital",
    group: "hospital",
    location: "Vijayawada, Tadepalle, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "Great support and clarity on diagnosis and procedure done by Mr Dilip kumar.",
  },
  {
    id: "ma-advanced-diagnostic-guntur",
    name: "MA Advanced Diagnostic & Research Centre",
    rating: 4.8,
    reviewCount: "1.6K",
    type: "Diagnostic center",
    group: "diagnostic",
    location: "Guntur, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "Nice ambience and facilities with fast diagnosis time.",
  },
  {
    id: "aster-ramesh-vijayawada-main",
    name: "Aster Ramesh Hospital - Best Multispeciality Hospital in Vijayawada Main Branch",
    rating: 4.8,
    reviewCount: "16.9K",
    type: "Hospital",
    group: "hospital",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "The doctors are very experienced and thorough in the diagnosis process.",
  },
  {
    id: "kamineni-diagnostics-kanuru",
    name: "Kamineni Diagnostics Centre (KDC)",
    rating: 5.0,
    reviewCount: "146",
    type: "Diagnostic center",
    group: "diagnostic",
    location: "Kanuru, Andhra Pradesh",
    hours: "Open · Closes 9 pm",
    quote: "Staff are very polite and the testing results are good",
  },
  {
    id: "mgm-healthcare-chennai",
    name: "MGM Healthcare",
    rating: 4.8,
    reviewCount: "20.7K",
    type: "Hospital",
    group: "hospital",
    location: "Chennai, Tamil Nadu",
    hours: "Open 24 hours",
    quote: "The diagnosis was accurate and the treatment was very effective.",
  },
  {
    id: "best-diagnostics-delhi",
    name: "BEST DIAGNOSTICS.",
    rating: 4.8,
    reviewCount: "1.5K",
    type: "Medical diagnostic imaging center",
    group: "diagnostic",
    location: "Delhi",
    hours: "Open · Closes 11:30 pm",
    quote: "Best diagnostics, best staff and doctors. Lab very hygienic.",
  },
  {
    id: "tenet-diagnostics-vijayawada",
    name: "Tenet Diagnostics Centre - Vijayawada",
    rating: 4.5,
    reviewCount: "532",
    type: "Medical diagnostic imaging center",
    group: "diagnostic",
    location: "Mogalrajapuram",
    hours: "Open · Closes 10 pm",
    quote: "Best diagnostics with most peaceful ambience and best hospitality",
  },
  {
    id: "accura-imaging-vijayawada",
    name: "ACCURA IMAGING & DIAGNOSTICS, ఐక్యూ రా ఇమేజింగ్ అండ్ డయాగ్నసిస్",
    rating: 4.8,
    reviewCount: "235",
    type: "Diagnostic center",
    group: "diagnostic",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "Accurate diagnosis here... a good diagnosis and economy",
    tags: ["Book online"],
  },
  {
    id: "health-diagnostics-ramavarappadu",
    name: "Health Diagnostics (Lab On Call) | Free Home sample collection | Best Diagnostic center in Vijayawada",
    rating: 5.0,
    reviewCount: "27",
    type: "Diagnostic center",
    group: "diagnostic",
    location: "Ramavarappadu, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "Excellent reports and excellent technicians",
  },
  {
    id: "apollo-diagnostics-ayodhya-nagar",
    name: "Apollo Diagnostics - Blood Tests - Home Collection & Full Body Checkups in Ayodhya Nagar",
    rating: 5.0,
    reviewCount: "14",
    type: "Diagnostic center",
    group: "diagnostic",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open · Closes 8 pm",
    tags: ["On-site services"],
  },
  {
    id: "kokilaben-hospital-andheri",
    name: "Kokilaben Dhirubhai Ambani Hospital and Medical Research Institute",
    rating: 3.9,
    reviewCount: "5.3K",
    type: "Hospital",
    group: "hospital",
    location: "Andheri West",
    hours: "Open 24 hours",
    tags: ["On-site services"],
  },
  {
    id: "latha-super-speciality-vijayawada",
    name: "Latha Super Speciality Hospital",
    rating: 4.8,
    reviewCount: "2.9K",
    type: "Hospital",
    group: "hospital",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open 24 hours",
    tags: ["On-site services"],
  },
  {
    id: "liv-hospital-vijayawada",
    name: "Liv Hospital",
    rating: 4.9,
    reviewCount: "237",
    type: "Hospital",
    group: "hospital",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open · Closes 9:30 pm",
    quote: "Nice service, best treatment and doctors and staff response about patient",
  },
  {
    id: "primus-super-speciality",
    name: "Primus Super Speciality Hospital",
    rating: 4.7,
    reviewCount: "11.8K",
    type: "Private hospital",
    group: "hospital",
    location: "Chanakyapuri",
    hours: "Open 24 hours",
    quote: "Dr Yadav was very good and the diagnosis was very accurate and great.",
  },
  {
    id: "aster-ramesh-guntur",
    name: "Aster Ramesh Hospital - Best Multispeciality Hospital in Guntur",
    rating: 4.8,
    reviewCount: "26.2K",
    type: "General hospital",
    group: "hospital",
    location: "Guntur, Andhra Pradesh",
    hours: "Open 24 hours",
    tags: ["On-site services"],
  },
  {
    id: "aster-ramesh-vijayawada",
    name: "Aster Ramesh Hospital",
    rating: 4.8,
    reviewCount: "5.8K",
    type: "Hospital",
    group: "hospital",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "Good service and punctual in attending lab and diagnostic tests.",
    tags: ["Book online"],
  },
  {
    id: "andhra-hospital-heart-brain",
    name: "Andhra Hospital Heart And Brain Institute",
    rating: 4.6,
    reviewCount: "2.4K",
    type: "Hospital",
    group: "hospital",
    location: "Vijayawada, Andhra Pradesh",
    hours: "Open 24 hours",
    quote: "Good hospital with competent team of doctors and staff.",
  },
  {
    id: "aayush-hospitals",
    name: "Aayush Hospitals",
    rating: 4.4,
    reviewCount: "3.6K",
    type: "Private hospital",
    group: "hospital",
    location: "Nagarjuna Nagar",
    hours: "Open 24 hours",
    tags: ["On-site services"],
  },
];

export function filterHospitalListings(
  query: string,
  group: FacilityFilter,
): HospitalListing[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  return hospitalListings.filter((listing) => {
    const matchesGroup = group === "all" || listing.group === group;
    const searchableText = [listing.name, listing.type, listing.location, listing.hours, ...(listing.tags ?? [])]
      .join(" ")
      .toLocaleLowerCase();
    return matchesGroup && (!normalizedQuery || searchableText.includes(normalizedQuery));
  });
}
