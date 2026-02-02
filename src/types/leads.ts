export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "PROPOSAL_SENT" | "WON" | "LOST";

export interface LeadNote {
  id: string;
  text: string;
  createdAt: any;
  createdBy: string;
}

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
  notes?: LeadNote[];
  createdAt: any;
  updatedAt: any;
  lastActivityAt?: any;
}
