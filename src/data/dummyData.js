import {
  CalendarDays,
  Building2,
  Briefcase,
  Landmark,
  ShieldCheck,
  Trees,
  HeartPulse,
  Sparkles,
  UserRound,
  HardHat,
  BadgeCheck,
} from "lucide-react";

export const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Events", href: "#events" },
  { label: "Projects", href: "#projects" },
  { label: "News", href: "#news" },
];

export const stackCarouselImages = [
  {
    id: "bridge-night",
    imageUrl: "/gallery/prayagraj-bridge-night.jpg",
    title: "New Yamuna Bridge at Night",
    description: "A dramatic illuminated cable-stayed bridge view highlighting Prayagraj's modern infrastructure.",
    tag: "Bridge Infrastructure",
  },
  {
    id: "bridge-angle",
    imageUrl: "/gallery/prayagraj-bridge-angle.jpg",
    title: "New Yamuna Bridge Panorama",
    description: "A wide-angle perspective capturing the scale and engineering profile of the city connector.",
    tag: "Mobility Corridor",
  },
  {
    id: "sangam",
    imageUrl: "/gallery/prayagraj-sangam-1.jpg",
    title: "Triveni Sangam",
    description: "The sacred confluence and riverfront landscape at the heart of Prayagraj's civic identity.",
    tag: "Riverfront",
  },
  {
    id: "high-court",
    imageUrl: "/gallery/prayagraj-high-court.jpg",
    title: "Allahabad High Court",
    description: "One of the city's most important institutional landmarks anchoring the civic core.",
    tag: "Judicial Landmark",
  },
  {
    id: "nagar-nigam",
    imageUrl: "/gallery/prayagraj-nagar-nigam.png",
    title: "Prayagraj Nagar Nigam",
    description: "Municipal identity representing city administration, digital governance, and public service operations.",
    tag: "Municipal Administration",
  },
  {
    id: "riverfront-aerial",
    imageUrl: "/gallery/prayagraj-sangam-2.jpg",
    title: "Sangam Riverfront Aerial",
    description: "A broader aerial perspective of the riverfront zone and public gathering infrastructure.",
    tag: "Urban Waterfront",
  },
];

export const stats = [
  { label: "Citizen Services", value: "120+" },
  { label: "Ongoing Projects", value: "48" },
  { label: "Ward Offices", value: "22" },
  { label: "Digital Requests Resolved", value: "18K+" },
];

export const municipalDirectory = {
  office:
    "Prayagraj Municipal Corporation, 1 Sarojini Naidu Marg, Civil Lines, Prayagraj - 211001",
  phone: "0532-2427221",
  email: "osnagarnigam@rediffmail.com",
  helplines: [
    "Water Department: 1800 180 5300",
    "Water Control Room: 9415125023",
    "SWM Control Room: 8303701317",
    "PSCL Helpline: 1920",
    "CM Helpline: 1076",
    "Women Helpline: 1090",
  ],
};

export const wardDirectory = [
  { ward: "Ward 1", name: "Mahewa", councilor: "Mrs. Rubi", contact: "8303701183", address: "Indalpur Dandi, Naini, Prayagraj" },
  { ward: "Ward 2", name: "Sulem Sarai", councilor: "Mrs. Reena", contact: "8303701324", address: "12A3 Ramman Ka Purva, Prayagraj" },
  { ward: "Ward 3", name: "Bamrauli Uphaar", councilor: "Mrs. Taravati Devi", contact: "8303701233", address: "Lahurapur Bamhrauli Uparhar, Prayagraj" },
  { ward: "Ward 4", name: "Nivi taluka Khurd", councilor: "Mrs. Geeta Devi", contact: "8303701238", address: "Neevi Taluka Khurd Purapur, Prayagraj" },
  { ward: "Ward 5", name: "Peepal Village", councilor: "Mrs. Deepika Jaiswal", contact: "8303701263", address: "Shah alias Peepal village, Prayagraj" },
  { ward: "Ward 6", name: "Kanihar", councilor: "Mrs. Sujata Saroj", contact: "9305715876", address: "Chak Churavan Hetapur, Jhunsi, Prayagraj" },
  { ward: "Ward 7", name: "Rajapur", councilor: "Mr. Bhaskar", contact: "8303701326", address: "Rajapur, Prayagraj" },
  { ward: "Ward 8", name: "Tenduawan", councilor: "Mrs. Maya Devi", contact: "9305715871", address: "Chak Chandupur Bharauha Po-Nivi Naini, Prayagraj" },
  { ward: "Ward 9", name: "Sonauti", councilor: "Mr. Kanhai Lal", contact: "9305715872", address: "Sonauti, Jhunsi, Prayagraj" },
  { ward: "Ward 10", name: "Gohari", councilor: "Mr. Subedar", contact: "8303701270", address: "Korsand, Gohri, Prayagraj" },
  { ward: "Ward 11", name: "Amarsapur", councilor: "Mrs. Anaara Devi", contact: "9305715873", address: "Amarsapur, Jhunsi, Prayagraj" },
  { ward: "Ward 12", name: "Ashok Nagar", councilor: "Mrs. Momina Siddhiqi", contact: "8303701327", address: "62E31 Rajpur Cantt, Prayagraj" },
  { ward: "Ward 13", name: "Malakraj", councilor: "Mr. Aakash Sonkar", contact: "8303701335", address: "7416 Lauder Road Georgetown, Prayagraj" },
  { ward: "Ward 14", name: "Bhadri", councilor: "Mr. Ram Kumar", contact: "8303701381", address: "Bhadri Post Malak Harhar, Soraon, Prayagraj" },
  { ward: "Ward 15", name: "Jayantipur", councilor: "Mr. Deepak Kumar Kushwaha", contact: "8303701328", address: "5519 Harwara Dhumanganj, Prayagraj" },
  { ward: "Ward 16", name: "Bahmalpur", councilor: "Mrs. Tara Devi", contact: "8303701378", address: "Rangpura, Prayagraj" },
  { ward: "Ward 17", name: "Chaka", councilor: "Mr. Anoop Kumar", contact: "8303701279", address: "96 Nayapura Naini, Prayagraj" },
  { ward: "Ward 18", name: "Harwara", councilor: "Mr. Shiv Kumar", contact: "8303701330", address: "84564B Mahilagram Subedarganj, Prayagraj" },
  { ward: "Ward 19", name: "Andava", councilor: "Mr. Ram Milan", contact: "9305715875", address: "Maheshpur, Andawa, Jhunsi, Prayagraj" },
  { ward: "Ward 20", name: "Chak Raghunath", councilor: "Mr. Rakesh Jaiswal", contact: "8303701331", address: "459251 Chak Raghunath Naini, Prayagraj" },
];

export const events = [
  {
    title: "Tree Plantation Drive",
    date: "Mar 18",
    description:
      "Community-wide plantation initiative across public parks and roadside green belts.",
    icon: Trees,
  },
  {
    title: "Public Health Camp",
    date: "Mar 22",
    description:
      "Free health screening, immunization support, and wellness consultation for residents.",
    icon: HeartPulse,
  },
  {
    title: "City Cleanliness Drive",
    date: "Mar 27",
    description:
      "Ward-level sanitation awareness program with volunteer participation and solid waste audits.",
    icon: Sparkles,
  },
  {
    title: "Civic Grievance Open House",
    date: "Apr 02",
    description:
      "Interactive session for citizens to discuss local concerns with municipal officers.",
    icon: CalendarDays,
  },
];

export const officials = [
  {
    name: "Shri Manish Kumar Verma, IAS",
    position: "District Magistrate",
    icon: Landmark,
    image: "/officials/manish-kumar-verma.jpg",
    office: "District Magistrate Office, Collectorate, Prayagraj",
    phone: "0532-2440515",
    email: "dmall@nic.in",
    contactNote: "Official district office contact",
  },
  {
    name: "Shri Jogendra Kumar, IPS",
    position: "Commissioner of Police",
    icon: ShieldCheck,
    image: "/officials/jogendra-kumar.jpg",
    office: "Commissioner of Police Office, Prayagraj",
    phone: "0532-2641902",
    email: "cp-pol.ah@up.gov.in",
    contactNote: "Official police office contact",
  },
  {
    name: "Shri Umesh Chandra Ganesh Kesarwani",
    position: "Municipal Mayor",
    icon: Building2,
    image: "/officials/umesh-chandra-ganesh-kesarwani.jpg",
    office: "Mayor Office, Prayagraj Municipal Corporation",
    phone: "0532-2427221",
    email: "osnagarnigam@rediffmail.com",
    contactNote: "Municipal corporation office contact",
  },
  {
    name: "Shri Seelam Sai Teja, IAS",
    position: "Municipal Commissioner",
    icon: Briefcase,
    image: "/officials/seelam-sai-teja.jpg",
    office: "Municipal Commissioner Office, Prayagraj Municipal Corporation",
    phone: "0532-2427221",
    email: "osnagarnigam@rediffmail.com",
    contactNote: "Municipal corporation office contact",
  },
];

export const loginCards = [
  {
    title: "Citizen Login",
    description:
      "Access property tax, utility services, certificates, and civic grievance tools.",
    icon: UserRound,
  },
  {
    title: "Contractor Login",
    description:
      "Track tenders, project status, billing milestones, and compliance submissions.",
    icon: HardHat,
  },
  {
    title: "Officer Login",
    description:
      "Manage department workflows, dashboards, approvals, and citizen requests.",
    icon: BadgeCheck,
  },
];

export const projects = [
  {
    title: "Integrated Road Construction",
    description:
      "Upgraded arterial corridors with safer lanes, signage, and improved drainage.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Smart Street Lights",
    description:
      "Energy-efficient LED lighting network with central monitoring and reduced outages.",
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Public Park Revitalization",
    description:
      "New walking tracks, seating, play zones, and water-efficient landscape design.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Drainage Modernization",
    description:
      "Flood-resilient drainage channels and stormwater handling for key urban pockets.",
    image:
      "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Metro Connectivity Support",
    description:
      "Transit-linked public realm improvements around stations and feeder routes.",
    image:
      "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
  },
];

export const newsItems = [
  {
    title: "Monsoon preparedness control room activated across all wards",
    category: "Public Safety",
    date: "March 10, 2026",
    description:
      "Emergency response teams, pump stations, and ward helplines have been placed on high alert to handle waterlogging and drainage complaints.",
  },
  {
    title: "Smart street light expansion completed in 14 priority corridors",
    category: "Infrastructure",
    date: "March 8, 2026",
    description:
      "The municipal corporation has completed a major LED upgrade to improve road visibility, safety, and energy efficiency in high-traffic zones.",
  },
  {
    title: "Citizen grievance portal now offers faster complaint tracking",
    category: "Digital Services",
    date: "March 6, 2026",
    description:
      "Residents can now receive real-time status updates, department assignments, and closure notifications directly from the civic platform.",
  },
];

export const footerSections = {
  quickLinks: ["Home", "Services", "Events", "News"],
  citizenServices: [
    "Water Bill",
    "Property Tax",
    "Complaint Portal",
    "Birth Certificate",
  ],
  contact: {
    address: "Civic Center Plaza, Sector 12, Central City",
    email: "support@citymunicipal.gov",
    phone: "+91 1800-123-4567",
  },
};

export const citizenPortalStats = [
  {
    label: "Active Complaints",
    value: "2",
    helper: "In progress",
    tone: "text-amber-600",
  },
  {
    label: "Resolved Complaints",
    value: "12",
    helper: "This year",
    tone: "text-emerald-600",
  },
  {
    label: "Pending Payments",
    value: "Rs 2,450",
    helper: "Due soon",
    tone: "text-blue-600",
  },
  {
    label: "Total Paid",
    value: "Rs 18,500",
    helper: "This year",
    tone: "text-slate-900",
  },
];

export const citizenRecentActivities = [
  {
    title: "Complaint CMP-2026-003 marked as resolved",
    time: "2 hours ago",
    tone: "bg-emerald-500",
  },
  {
    title: "Water bill payment processed successfully",
    time: "1 day ago",
    tone: "bg-blue-500",
  },
  {
    title: "New complaint CMP-2026-002 submitted",
    time: "2 days ago",
    tone: "bg-cyan-500",
  },
];

export const citizenComplaints = [
  {
    id: "CMP-2026-001",
    title: "Pothole on Main Street",
    status: "In Progress",
    priority: "High",
    date: "2026-03-02",
    location: "Main Street, Civil Lines",
    timeline: [
      { label: "Complaint Submitted", date: "2026-03-02" },
      { label: "Assigned to field team", date: "2026-03-03" },
    ],
  },
  {
    id: "CMP-2026-002",
    title: "Street light not working",
    status: "Pending",
    priority: "Medium",
    date: "2026-03-06",
    location: "Tagore Town, Ward 12",
    timeline: [{ label: "Complaint Submitted", date: "2026-03-06" }],
  },
  {
    id: "CMP-2026-003",
    title: "Garbage not collected",
    status: "Resolved",
    priority: "Low",
    date: "2026-02-27",
    location: "Jhunsi, Ward 8",
    timeline: [
      { label: "Complaint Submitted", date: "2026-02-27" },
      { label: "Assigned to sanitation team", date: "2026-02-28" },
      { label: "Work completed", date: "2026-03-01" },
    ],
  },
];

export const citizenBills = [
  {
    service: "Property Tax",
    amount: "Rs 12,500",
    dueDate: "March 31, 2026",
    accent: "bg-blue-600",
  },
  {
    service: "Water Bill",
    amount: "Rs 850",
    dueDate: "March 28, 2026",
    accent: "bg-emerald-600",
  },
  {
    service: "Electricity Bill",
    amount: "Rs 1,100",
    dueDate: "March 25, 2026",
    accent: "bg-amber-500",
  },
];

export const citizenPaymentHistory = [
  {
    id: "TXN-2026-123",
    service: "Water Bill",
    amount: "Rs 820",
    date: "2026-02-15",
    status: "Paid",
  },
  {
    id: "TXN-2026-122",
    service: "Property Tax",
    amount: "Rs 12,500",
    date: "2026-01-20",
    status: "Paid",
  },
  {
    id: "TXN-2026-121",
    service: "Electricity Bill",
    amount: "Rs 1,050",
    date: "2026-01-12",
    status: "Paid",
  },
];

export const complaintCategories = [
  "Roads & Infrastructure",
  "Water Supply",
  "Garbage Collection",
  "Street Lights",
  "Drainage",
  "Public Health",
  "Other",
];

export const complaintPriorityOptions = ["Low", "Medium", "High"];

export const citizenProfile = {
  citizenId: "CIT-2026-001",
  fullName: "Ujjwal Mishra",
  mobileNumber: "8303700000",
  email: "ujjwal@example.com",
  city: "Prayagraj",
  wardArea: "Civil Lines",
  wardNumber: "12",
  address: "Civil Lines, Prayagraj, Uttar Pradesh",
  pinCode: "211001",
};

export const adminMetrics = [
  {
    title: "Total Complaints",
    value: "168",
    delta: "+12% from last month",
    helper: "Overall volume",
    accent: "bg-blue-600",
    icon: "LayoutDashboard",
  },
  {
    title: "Pending",
    value: "26",
    delta: "Needs attention",
    helper: "Awaiting action",
    accent: "bg-orange-500",
    icon: "FileText",
  },
  {
    title: "In Progress",
    value: "18",
    delta: "Being worked on",
    helper: "Assigned to teams",
    accent: "bg-indigo-500",
    icon: "Users",
  },
  {
    title: "Resolved",
    value: "124",
    delta: "This month",
    helper: "Closed successfully",
    accent: "bg-emerald-500",
    icon: "CheckCircle2",
  },
];

export const adminComplaintRows = [
  {
    id: "CMP-1024",
    category: "Roads",
    location: "Civil Lines",
    status: "Pending",
    priority: "High",
    department: "Public Works",
    description:
      "Multiple potholes reported near the Civil Lines flyover causing traffic slowdowns.",
    contractor: "Sharma Infra",
    date: "Mar 08, 2026",
  },
  {
    id: "CMP-1027",
    category: "Water",
    location: "Naini",
    status: "In Progress",
    priority: "Medium",
    department: "Water Supply",
    description:
      "Intermittent water supply in Naini Block C reported for the past three days.",
    contractor: "AquaWorks",
    date: "Mar 07, 2026",
  },
  {
    id: "CMP-1031",
    category: "Garbage",
    location: "Katra",
    status: "Resolved",
    priority: "Low",
    department: "Sanitation",
    description:
      "Garbage pickup delayed in Katra market area. Cleared by sanitation team.",
    contractor: "CleanCity",
    date: "Mar 06, 2026",
  },
  {
    id: "CMP-1038",
    category: "Street Lights",
    location: "Jhunsi",
    status: "Pending",
    priority: "High",
    department: "Electrical",
    description:
      "Street lights not working on Ward 12 main road, reported by residents.",
    contractor: "Lumina",
    date: "Mar 05, 2026",
  },
  {
    id: "CMP-1042",
    category: "Drainage",
    location: "Tagore Town",
    status: "In Progress",
    priority: "Medium",
    department: "Drainage",
    description:
      "Drainage overflow near Tagore Town Park after rain, needs urgent cleaning.",
    contractor: "FlowTech",
    date: "Mar 04, 2026",
  },
];

export const adminContractors = [
  {
    name: "Sharma Infra",
    assigned: 12,
    completed: 38,
    rating: "4.5",
  },
  {
    name: "AquaWorks",
    assigned: 8,
    completed: 26,
    rating: "4.2",
  },
  {
    name: "CleanCity",
    assigned: 10,
    completed: 44,
    rating: "4.8",
  },
  {
    name: "Lumina Services",
    assigned: 5,
    completed: 19,
    rating: "4.1",
  },
];

export const adminPerformanceMetrics = [
  { label: "Average Resolution Time", value: "4.2 days" },
  { label: "Citizen Satisfaction Rate", value: "89%" },
  { label: "Active Contractors", value: "24" },
  { label: "Monthly Budget Utilization", value: "₹12.4L" },
];

export const adminAreaDistribution = [
  { label: "Sector 1-5", value: 42 },
  { label: "Sector 6-10", value: 35 },
  { label: "Sector 11-15", value: 48 },
  { label: "Sector 16-20", value: 28 },
];

export const contractorMetrics = [
  {
    title: "Total Assigned",
    value: "3",
    helper: "Active tasks",
    accent: "bg-blue-600",
    icon: "ClipboardList",
  },
  {
    title: "In Progress",
    value: "1",
    helper: "Working on",
    accent: "bg-amber-500",
    icon: "Wrench",
  },
  {
    title: "Completed This Month",
    value: "8",
    helper: "Tasks done",
    accent: "bg-emerald-500",
    icon: "CheckCircle2",
  },
  {
    title: "Average Rating",
    value: "4.8",
    helper: "Excellent",
    accent: "bg-indigo-500",
    icon: "Star",
  },
];

export const contractorTasks = [
  {
    id: "TASK-2024-001",
    title: "Repair Pothole on Main Street",
    location: "Main Street, Sector 12",
    priority: "High",
    deadline: "2026-02-18",
    status: "In Progress",
    assignedBy: "Admin: Suresh Mehta",
    department: "Public Works",
    ward: "Ward 12",
    workOrderId: "WO-5541",
    lastUpdated: "2026-02-12",
    adminNote: "Focus on lane 2 first. Traffic diversion approved.",
  },
  {
    id: "TASK-2024-002",
    title: "Fix Street Light Circuit",
    location: "Park Avenue, Sector 8",
    priority: "Medium",
    deadline: "2026-02-20",
    status: "Assigned",
    assignedBy: "Admin: Anjali Verma",
    department: "Electrical",
    ward: "Ward 8",
    workOrderId: "WO-5560",
    lastUpdated: "2026-02-10",
    adminNote: "Use LED replacement kit from central store.",
  },
  {
    id: "TASK-2024-003",
    title: "Clear Blocked Drainage",
    location: "Green Park, Sector 15",
    priority: "High",
    deadline: "2026-02-16",
    status: "Assigned",
    assignedBy: "Admin: Suresh Mehta",
    department: "Drainage",
    ward: "Ward 15",
    workOrderId: "WO-5572",
    lastUpdated: "2026-02-11",
    adminNote: "Ensure disposal at approved dump site.",
  },
];

export const contractorNotifications = [
  {
    id: "NT-1001",
    type: "Warning",
    title: "Delay flagged on TASK-2024-003",
    message:
      "Please submit a progress update within 24 hours or request deadline extension.",
    date: "2026-02-12",
    action: "Submit update",
  },
  {
    id: "NT-1002",
    type: "Status",
    title: "TASK-2024-001 moved to In Progress",
    message:
      "Admin approved start. Ensure photo evidence before and after completion.",
    date: "2026-02-11",
    action: "View task",
  },
  {
    id: "NT-1003",
    type: "Blocked",
    title: "Contractor compliance review initiated",
    message:
      "Temporary block applied pending document verification from admin.",
    date: "2026-02-10",
    action: "Contact admin",
  },
];
