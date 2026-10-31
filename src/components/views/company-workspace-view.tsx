"use client";

import React, { useState } from "react";
import { CompanyProfile, SubsidiaryEntity } from "@/types/company";
import { DEFAULT_PARENT_COMPANY, DEFAULT_SUBSIDIARIES } from "@/lib/company-data";
import { CompanyProfileCard } from "../company/company-profile-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Plus, Landmark, DollarSign, ShieldCheck, Check } from "lucide-react";

export const CompanyWorkspaceView: React.FC = () => {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PARENT_COMPANY);
  const [subsidiaries, setSubsidiaries] = useState<SubsidiaryEntity[]>(DEFAULT_SUBSIDIARIES);
  const [selectedSubId, setSelectedSubId] = useState<string>("SUB-ENT-001");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCurrency, setNewSubCurrency] = useState("USD");

  const handleUpdateProfile = (updated: Partial<CompanyProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleAddSubsidiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: SubsidiaryEntity = {
      id: `SUB-ENT-${String(subsidiaries.length + 1).padStart(3, "0")}`,
      name: newSubName,
      legalName: `${newSubName} Inc.`,
      code: newSubName.substring(0, 4).toUpperCase(),
      jurisdiction: "United States",
      taxId: `US-EIN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      currency: newSubCurrency,
      currencySymbol: newSubCurrency === "EUR" ? "€" : "$",
      licenseShares: 15,
      status: "Active",
      address: {
        street: "100 Innovation Way",
        city: "San Francisco",
        state: "CA",
        country: "USA",
        postalCode: "94105",
      },
      isConsolidated: true,
      contactEmail: `billing@${newSubName.toLowerCase().replace(/\s+/g, "")}.io`,
    };

    setSubsidiaries((prev) => [...prev, newSub]);
    setNewSubName("");
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Multi-Company &amp; Organization Structure
          </h1>
          <p className="text-xs text-muted-foreground">
            Configure legal entities, banking coordinates for invoices, fiscal years, and subsidiary companies.
          </p>
        </div>

        <Button
          onClick={() => setAddModalOpen(true)}
          variant="blue"
          className="gap-1.5 shadow-sm text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subsidiary</span>
        </Button>
      </div>

      {/* Main Company Profile Card */}
      <CompanyProfileCard profile={profile} onUpdateProfile={handleUpdateProfile} />

      {/* Subsidiaries Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Subsidiary Entities &amp; Brand Divisions ({subsidiaries.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subsidiaries.map((sub) => {
            const isSelected = selectedSubId === sub.id;
            return (
              <div
                key={sub.id}
                onClick={() => setSelectedSubId(sub.id)}
                className={`p-4 rounded-xl border bg-card transition-all cursor-pointer shadow-xs ${
                  isSelected ? "border-blue-500 ring-1 ring-blue-500/20" : "hover:border-border"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span>{sub.name}</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{sub.code} &bull; {sub.taxId}</p>
                  </div>
                  <Badge variant="success" className="text-[10px] font-normal">
                    {sub.status}
                  </Badge>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span>Currency:</span>
                    <strong className="text-foreground">{sub.currency} ({sub.currencySymbol})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>License Allocation:</span>
                    <span className="font-semibold text-blue-600">{sub.licenseShares}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jurisdiction:</span>
                    <span>{sub.jurisdiction}</span>
                  </div>
                  {sub.primaryStack && (
                    <div className="flex justify-between">
                      <span>Primary Stack:</span>
                      <span className="text-foreground font-medium">{sub.primaryStack}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fiscal Settings & Wire Coordinates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              <span>Default Bank Wire Coordinates</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Bank Name:</span>
              <strong className="font-mono">{profile.bankCoordinates.bankName}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Account Holder:</span>
              <span>{profile.bankCoordinates.accountName}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Account Number:</span>
              <span className="font-mono">{profile.bankCoordinates.accountNumber}</span>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">SWIFT / BIC:</span>
              <span className="font-mono font-bold text-blue-600">{profile.bankCoordinates.swiftBic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IBAN:</span>
              <span className="font-mono">{profile.bankCoordinates.iban}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Fiscal &amp; Billing Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Fiscal Year Window:</span>
              <strong className="font-mono">{profile.fiscalSettings.fiscalYearStart} to {profile.fiscalSettings.fiscalYearEnd}</strong>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Default Payment Terms:</span>
              <Badge variant="outline">{profile.fiscalSettings.defaultPaymentTerms}</Badge>
            </div>
            <div className="flex justify-between border-b pb-1.5">
              <span className="text-muted-foreground">Standard Tax (VAT):</span>
              <strong className="text-foreground">{profile.fiscalSettings.defaultTaxRate}%</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Multi-Currency Mode:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Enabled (USD, EUR, GBP)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Subsidiary Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-background border rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-bold text-base text-foreground">Add Subsidiary Entity</h3>
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">Entity Name</label>
                <Input
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="e.g. Brightloop APAC Pte Ltd"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground uppercase text-[10px]">Operating Currency</label>
                <Input
                  value={newSubCurrency}
                  onChange={(e) => setNewSubCurrency(e.target.value)}
                  placeholder="USD, EUR, SGD"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="blue" size="sm" onClick={handleAddSubsidiary}>
                Create Subsidiary
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
