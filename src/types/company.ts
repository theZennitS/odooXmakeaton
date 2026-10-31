export interface BankCoordinates {
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
  swiftBic: string;
  iban: string;
  branchAddress?: string;
  currency: string;
  wireInstructions?: string;
}

export interface TaxRegistration {
  id: string;
  taxIdType: "EIN" | "VAT" | "GST" | "Sales Tax" | "Corporate Tax" | string;
  taxNumber: string;
  jurisdiction: string;
  isPrimary: boolean;
  defaultRate: number;
  validUntil?: string;
}

export interface FiscalSettings {
  fiscalYearStart: string;
  fiscalYearEnd: string;
  defaultPaymentTerms: "Immediate" | "Net 15" | "Net 30" | "Net 60" | "Due on Receipt" | string;
  defaultTaxRate: number;
  currency: string;
  currencySymbol: string;
  multiCurrencyEnabled: boolean;
  taxRoundingRule?: "round_per_line" | "round_globally";
  lockDate?: string;
}

export interface SubsidiaryAddress {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface SubsidiaryEntity {
  id: string;
  name: string;
  legalName: string;
  code: string;
  jurisdiction: string;
  taxId: string;
  currency: string;
  currencySymbol: string;
  licenseShares: number;
  primaryStack?: string;
  status: "Active" | "Inactive" | "Under Review";
  address: SubsidiaryAddress;
  bankCoordinates?: BankCoordinates;
  isConsolidated: boolean;
  contactEmail: string;
  phone?: string;
  createdAt?: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  legalName: string;
  logoUrl?: string;
  avatarInitials: string;
  jurisdiction: string;
  taxId: string;
  currency: string;
  currencySymbol: string;
  headquartersAddress: SubsidiaryAddress;
  email: string;
  phone: string;
  website: string;
  taxRegistrations: TaxRegistration[];
  fiscalSettings: FiscalSettings;
  bankCoordinates: BankCoordinates;
  subsidiaries: SubsidiaryEntity[];
  updatedAt?: string;
}
