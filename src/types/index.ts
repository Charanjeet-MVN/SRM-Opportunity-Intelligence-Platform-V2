export type UserRole = 'student' | 'club_rep' | 'super_admin';

export type ClubVerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected';

export type OpportunityType =
  | 'hackathon'
  | 'internship'
  | 'research'
  | 'competition'
  | 'workshop'
  | 'bootcamp'
  | 'scholarship'
  | 'club_recruitment'
  | 'placement_drive'
  | 'conference'
  | 'certification'
  | 'webinar'
  | 'guest_lecture'
  | 'other';

export type OpportunityStatus = 'draft' | 'published' | 'archived' | 'rejected';

export type LocationType = 'on_campus' | 'in_person' | 'remote' | 'virtual' | 'hybrid' | 'off_campus';

export type RegistrationStatus = 'registered' | 'attended' | 'withdrawn';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  registerNumber?: string;
  department?: string;
  yearOfStudy?: number;
  skills: string[];
  interests: string[];
  careerGoals?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  category?: string;
  verificationStatus: ClubVerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  officialEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  role: 'lead' | 'member';
  createdAt: string;
}

export interface Opportunity {
  id: string;
  clubId: string;
  createdBy?: string;
  title: string;
  slug: string;
  summary?: string;
  type: OpportunityType;
  description: string;
  requiredSkills: string[];
  eligibleDepartments: string[];
  eligibleYears: number[];
  locationType: LocationType;
  locationAddress?: string;
  locationDetails?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  applicationDeadline?: string;
  deadline?: string;
  maxParticipants?: number;
  currentParticipants?: number;
  externalUrl?: string;
  status: OpportunityStatus;
  isOfficial?: boolean;
  createdAt: string;
  updatedAt: string;
  club?: Club;
}

export interface SavedOpportunity {
  id: string;
  userId: string;
  opportunityId: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  opportunityId: string;
  status: RegistrationStatus;
  registeredAt: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'reminder' | 'verification' | 'alert';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ClubVerificationRequest {
  id: string;
  clubId: string;
  submittedBy: string;
  documentsUrl?: string;
  status: ClubVerificationStatus;
  reviewerNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}
