import {
  CompanyProfile,
  SubsidiaryEntity,
  BankCoordinates,
  FiscalSettings,
  TaxRegistration,
} from "@/types/company";

export const DEFAULT_BANK_COORDINATES: BankCoordinates = {
  bankName: "Silicon Valley Bank",
  accountName: "Brightloop Software Inc. Operating Treasury",
  accountNumber: "948210492810",
  routingNumber: "121140399",
  swiftBic: "SVBKUS6S",
  iban: "US33SVBK1211403990001",
  branchAddress: "3003 Tasman Drive, Santa Clara, CA 95054, USA",
  currency: "USD",
  wireInstructions:
    "Please include the invoice reference ID (e.g., INV-2026-XXXX) on the wire transfer remittance note. Intermediary banking fees must be borne by the ordering party.",
};

export const DEFAULT_FISCAL_SETTINGS: FiscalSettings = {
  fiscalYearStart: "Jan 1",
  fiscalYearEnd: "Dec 31",
  defaultPaymentTerms: "Net 30",
  defaultTaxRate: 18,
  currency: "USD",
  currencySymbol: "$",
  multiCurrencyEnabled: true,
  taxRoundingRule: "round_globally",
  lockDate: "2026-09-30",
};

export const DEFAULT_TAX_REGISTRATIONS: TaxRegistration[] = [
  {
    id: "tax-us-fed",
    taxIdType: "EIN",
    taxNumber: "US-EIN-9482104",
    jurisdiction: "United States (Federal IRS)",
    isPrimary: true,
    defaultRate: 18,
    validUntil: "2030-12-31",
  },
  {
    id: "tax-tx-state",
    taxIdType: "State Tax ID",
    taxNumber: "TX-849201",
    jurisdiction: "Texas Comptroller of Public Accounts",
    isPrimary: false,
    defaultRate: 8.25,
    validUntil: "2028-12-31",
  },
  {
    id: "tax-eu-vat",
    taxIdType: "VAT",
    taxNumber: "IE9482014",
    jurisdiction: "Revenue Commissioners (Ireland / EU)",
    isPrimary: false,
    defaultRate: 23,
    validUntil: "2029-06-30",
  },
];

export const DEFAULT_SUBSIDIARIES: SubsidiaryEntity[] = [
  {
    id: "sub-odoo-layer",
    name: "Odoo Compatibility Layer LLC",
    legalName: "Odoo Compatibility Layer LLC",
    code: "OCL-TX",
    jurisdiction: "Austin, TX, USA",
    taxId: "TX-849201",
    currency: "USD",
    currencySymbol: "$",
    licenseShares: 35,
    primaryStack: "ERP Connectors",
    status: "Active",
    address: {
      street: "500 West 2nd St, Suite 1900",
      city: "Austin",
      state: "TX",
      country: "United States",
      postalCode: "78701",
    },
    bankCoordinates: {
      bankName: "Silicon Valley Bank (Texas Branch)",
      accountName: "Odoo Compatibility Layer LLC",
      accountNumber: "482019482012",
      routingNumber: "121140399",
      swiftBic: "SVBKUS6S",
      iban: "US44SVBK1211403990002",
      branchAddress: "Austin Financial Center, Austin, TX 78701",
      currency: "USD",
      wireInstructions: "Quote connector order reference ID on wire remittance.",
    },
    isConsolidated: true,
    contactEmail: "connectors@brightloop-layer.io",
    phone: "+1 (512) 555-0199",
    createdAt: "2024-03-15",
  },
  {
    id: "sub-emea-cloud",
    name: "Brightloop EMEA Cloud Ltd",
    legalName: "Brightloop EMEA Cloud Limited",
    code: "BL-EMEA",
    jurisdiction: "Dublin, Ireland",
    taxId: "IE9482014",
    currency: "EUR",
    currencySymbol: "€",
    licenseShares: 45,
    primaryStack: "Cloud Hosting & EU GDPR Gateway",
    status: "Active",
    address: {
      street: "1 Grants Row, Grand Canal Dock",
      city: "Dublin 2",
      state: "Leinster",
      country: "Ireland",
      postalCode: "D02 HX96",
    },
    bankCoordinates: {
      bankName: "Bank of Ireland (Corporate)",
      accountName: "Brightloop EMEA Cloud Ltd EUR Operating",
      accountNumber: "8849201948",
      routingNumber: "900017",
      swiftBic: "BOFIIE2D",
      iban: "IE29BOFI90001788492019",
      branchAddress: "College Green, Dublin 2, Ireland",
      currency: "EUR",
      wireInstructions: "SEPA transfers accepted. Include EMEA-INV-XXXX reference.",
    },
    isConsolidated: true,
    contactEmail: "emea-billing@brightloop.eu",
    phone: "+353 1 496 0192",
    createdAt: "2024-08-20",
  },
];

export const DEFAULT_PARENT_COMPANY: CompanyProfile = {
  id: "comp-brightloop-parent",
  name: "Brightloop Software Inc.",
  legalName: "Brightloop Software Incorporated",
  avatarInitials: "BL",
  logoUrl: "",
  jurisdiction: "Delaware, USA",
  taxId: "US-EIN-9482104",
  currency: "USD",
  currencySymbol: "$",
  headquartersAddress: {
    street: "1209 North Orange Street",
    city: "Wilmington",
    state: "DE",
    country: "United States",
    postalCode: "19801",
  },
  email: "finance@brightloop.io",
  phone: "+1 (415) 890-5200",
  website: "https://brightloop.io",
  taxRegistrations: DEFAULT_TAX_REGISTRATIONS,
  fiscalSettings: DEFAULT_FISCAL_SETTINGS,
  bankCoordinates: DEFAULT_BANK_COORDINATES,
  subsidiaries: DEFAULT_SUBSIDIARIES,
  updatedAt: "2026-10-31T00:00:00Z",
};

const COMPANY_STORAGE_KEY = "brightloop_company_profile_v1";

export function loadCompanyProfile(): CompanyProfile {
  if (typeof window === "undefined") {
    return DEFAULT_PARENT_COMPANY;
  }
  try {
    const raw = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (!raw) return DEFAULT_PARENT_COMPANY;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PARENT_COMPANY,
      ...parsed,
      subsidiaries: parsed.subsidiaries || DEFAULT_SUBSIDIARIES,
      fiscalSettings: {
        ...DEFAULT_FISCAL_SETTINGS,
        ...(parsed.fiscalSettings || {}),
      },
      bankCoordinates: {
        ...DEFAULT_BANK_COORDINATES,
        ...(parsed.bankCoordinates || {}),
      },
    };
  } catch {
    return DEFAULT_PARENT_COMPANY;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to persist company profile", err);
  }
}

export function resetCompanyProfile(): CompanyProfile {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COMPANY_STORAGE_KEY);
  }
  return DEFAULT_PARENT_COMPANY;
}
