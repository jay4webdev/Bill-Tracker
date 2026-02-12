
import { PaymentStatus, Category, User } from "./types";

export const DEFAULT_USERS: User[] = [
  {
    id: "usr_admin",
    username: "admin",
    password: "password123", // Default password
    fullName: "System Administrator",
    role: "ADMIN"
  }
];

export const DEFAULT_COMPANIES = [
  "Acme Corp",
  "Beta Ltd",
  "Gamma Inc",
  "Metalsigns",
  "Donad Group",
  "Unitrac MV"
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat_1",
    name: "Software Subscription",
    subcategories: ["Cloud Infrastructure", "SaaS", "Development Tools", "Design Tools"]
  },
  {
    id: "cat_2",
    name: "Utilities",
    subcategories: ["Electricity", "Water", "Internet", "Phone"]
  },
  {
    id: "cat_3",
    name: "Rent/Lease",
    subcategories: ["Office Space", "Equipment", "Vehicle"]
  },
  {
    id: "cat_4",
    name: "Contractors",
    subcategories: ["Development", "Design", "Consulting", "Cleaning"]
  },
  {
    id: "cat_5",
    name: "Marketing",
    subcategories: ["Ads", "Social Media", "Events", "Print"]
  },
  {
    id: "cat_6",
    name: "Legal",
    subcategories: ["Retainer", "Filing Fees", "Consultation"]
  },
  {
    id: "cat_7",
    name: "Hardware",
    subcategories: ["Laptops", "Peripherals", "Servers"]
  },
  {
    id: "cat_8",
    name: "Other",
    subcategories: ["Miscellaneous"]
  }
];

export const MOCK_BILLS = [
  {
    id: "1",
    companyName: "Acme Corp",
    staffName: "John Smith (AWS Admin)",
    description: "Monthly Cloud Infrastructure",
    amount: 1250.00,
    currency: "USD",
    billDate: "2024-05-01",
    dueDate: "2024-05-15",
    status: PaymentStatus.PENDING,
    category: "Software Subscription",
    subcategory: "Cloud Infrastructure"
  },
  {
    id: "2",
    companyName: "Beta Ltd",
    staffName: "Sarah Jones (WeWork)",
    description: "Office Space Rent",
    amount: 4500.00,
    currency: "USD",
    billDate: "2024-05-01",
    dueDate: "2024-05-05",
    status: PaymentStatus.PAID,
    category: "Rent/Lease",
    subcategory: "Office Space"
  },
  {
    id: "3",
    companyName: "Acme Corp",
    staffName: "Mike Chen (Slack)",
    description: "Enterprise License",
    amount: 800.00,
    currency: "USD",
    billDate: "2024-05-10",
    dueDate: "2024-05-24",
    status: PaymentStatus.PENDING,
    category: "Software Subscription",
    subcategory: "SaaS"
  },
  {
    id: "4",
    companyName: "Gamma Inc",
    staffName: "Emily Davis (Google Ads)",
    description: "Q2 Ad Campaign",
    amount: 3200.50,
    currency: "USD",
    billDate: "2024-04-20",
    dueDate: "2024-05-20",
    status: PaymentStatus.PENDING,
    category: "Marketing",
    subcategory: "Ads"
  }
];
