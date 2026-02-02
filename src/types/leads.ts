export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "WON" | "LOST";

export interface Lead {
  id: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  language: "he" | "en";
  source?: string;
  status: LeadStatus;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  lastActivityAt?: any;
}
