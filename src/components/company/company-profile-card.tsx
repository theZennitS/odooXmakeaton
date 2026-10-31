"use client";

import React, { useState } from "react";
import { CompanyProfile } from "@/types/company";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Edit2,
} from "lucide-react";

interface CompanyProfileCardProps {
  profile: CompanyProfile;
  onUpdateProfile?: (updated: Partial<CompanyProfile>) => void;
}

export const CompanyProfileCard: React.FC<CompanyProfileCardProps> = ({
  profile,
  onUpdateProfile,
}) => {
  const [copiedTax, setCopiedTax] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile.name,
    legalName: profile.legalName,
    taxId: profile.taxId,
    jurisdiction: profile.jurisdiction,
    email: profile.email,
    phone: profile.phone,
    website: profile.website,
    street: profile.headquartersAddress.street,
    city: profile.headquartersAddress.city,
    state: profile.headquartersAddress.state,
    postalCode: profile.headquartersAddress.postalCode,
    country: profile.headquartersAddress.country,
  });

  const handleCopyTax = () => {
    navigator.clipboard?.writeText(profile.taxId);
    setCopiedTax(true);
    setTimeout(() => setCopiedTax(false), 2000);
  };

  const handleSaveEdit = () => {
    if (onUpdateProfile) {
      onUpdateProfile({
        name: editForm.name,
        legalName: editForm.legalName,
        taxId: editForm.taxId,
        jurisdiction: editForm.jurisdiction,
        email: editForm.email,
        phone: editForm.phone,
        website: editForm.website,
        headquartersAddress: {
          street: editForm.street,
          city: editForm.city,
          state: editForm.state,
          postalCode: editForm.postalCode,
          country: editForm.country,
        },
      });
    }
    setIsEditing(false);
  };

  return (
    <Card className="border border-border/80 shadow-xs hover:shadow-md transition-shadow bg-card">
      <CardHeader className="pb-4 border-b bg-muted/15">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Logo Avatar */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 text-white font-bold text-xl shadow-md ring-2 ring-blue-500/20">
              {profile.avatarInitials || "BL"}
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-background flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                  {profile.name}
                </CardTitle>
                <Badge variant="info" className="text-[10px] uppercase font-bold tracking-wider">
                  Parent Holding HQ
                </Badge>
                <Badge variant="success" className="gap-1 text-[11px]">
                  <ShieldCheck className="w-3 h-3" /> Good Standing
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {profile.legalName} • Formed in {profile.jurisdiction}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isEditing ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (isEditing) {
                  handleSaveEdit();
                } else {
                  setIsEditing(true);
                }
              }}
              className="text-xs h-8 gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {isEditing ? "Apply Updates" : "Edit Profile"}
            </Button>
            {isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {isEditing ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-muted/20 p-4 rounded-lg border">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Company Name</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Legal Entity Name</label>
              <Input
                value={editForm.legalName}
                onChange={(e) => setEditForm({ ...editForm, legalName: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Primary Tax ID / EIN</label>
              <Input
                value={editForm.taxId}
                onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Jurisdiction</label>
              <Input
                value={editForm.jurisdiction}
                onChange={(e) => setEditForm({ ...editForm, jurisdiction: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Finance Email</label>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">Phone</label>
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] font-medium text-muted-foreground">Headquarters Street</label>
              <Input
                value={editForm.street}
                onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground">City, State, ZIP</label>
              <div className="flex gap-1">
                <Input
                  value={editForm.city}
                  placeholder="City"
                  onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                  className="h-8 text-xs flex-1"
                />
                <Input
                  value={editForm.state}
                  placeholder="State"
                  onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                  className="h-8 text-xs w-16"
                />
                <Input
                  value={editForm.postalCode}
                  placeholder="ZIP"
                  onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                  className="h-8 text-xs w-20"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Identifiers */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                Legal Registration & Tax
              </span>
              <div className="bg-muted/30 p-3 rounded-lg border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Federal Tax ID:</span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-xs font-mono font-bold bg-background px-2 py-0.5 rounded border text-foreground">
                      {profile.taxId}
                    </code>
                    <button
                      onClick={handleCopyTax}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy Tax ID"
                    >
                      {copiedTax ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Registration:</span>
                  <span className="font-semibold text-foreground">{profile.jurisdiction}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Base Currency:</span>
                  <span className="font-semibold text-foreground">
                    {profile.currency} ({profile.currencySymbol})
                  </span>
                </div>
              </div>
            </div>

            {/* Headquarters Address */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Headquarters Address
              </span>
              <div className="bg-muted/30 p-3 rounded-lg border text-xs space-y-1 leading-relaxed">
                <div className="font-semibold text-foreground">
                  {profile.headquartersAddress.street}
                </div>
                <div className="text-muted-foreground">
                  {profile.headquartersAddress.city}, {profile.headquartersAddress.state}{" "}
                  {profile.headquartersAddress.postalCode}
                </div>
                <div className="text-muted-foreground font-medium">
                  {profile.headquartersAddress.country}
                </div>
                <div className="pt-1 flex items-center gap-1 text-[11px] text-blue-600 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Registered Global HQ Office
                </div>
              </div>
            </div>

            {/* Corporate Contacts */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                Corporate Contacts
              </span>
              <div className="bg-muted/30 p-3 rounded-lg border text-xs space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <a
                    href={`mailto:${profile.email}`}
                    className="hover:text-blue-600 font-medium text-foreground truncate"
                  >
                    {profile.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-medium text-foreground">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue-600 font-medium text-foreground truncate"
                  >
                    {profile.website}
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Multi-Jurisdiction Tax Registrations */}
        <div className="pt-1 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              Multi-Jurisdiction Tax Registrations
            </span>
            <span className="text-[11px] text-muted-foreground">
              {profile.taxRegistrations.length} Verified Authorities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {profile.taxRegistrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-center justify-between p-2.5 rounded-lg border bg-background text-xs shadow-2xs hover:border-blue-400 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-foreground">{reg.taxIdType}</span>
                    {reg.isPrimary && (
                      <Badge variant="info" className="text-[9px] px-1 py-0 h-4">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-blue-700 font-semibold">
                    {reg.taxNumber}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                    {reg.jurisdiction}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">Std Rate</span>
                  <span className="font-bold text-foreground text-xs">{reg.defaultRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
