// ATS & Talent Acquisition Unified Types

export type PipelineStageId = 
  | 'applied'           // تم الاستلام
  | 'screening'         // فرز مبدئي
  | 'tech_assessment'   // تقييم فني
  | 'first_interview'   // مقابلة أولى
  | 'final_interview'   // مقابلة نهائية
  | 'job_offer'         // عرض عمل
  | 'hired'             // تم التعيين
  | 'rejected';         // مرفوض

export interface CandidateNote {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isPrivate: boolean;
}

export interface CandidateActivity {
  id: string;
  type: 'stage_change' | 'note_added' | 'scorecard_submitted' | 'interview_scheduled' | 'offer_created' | 'offer_signed' | 'document_uploaded' | 'synced_hr' | 'email_sent';
  title: string;
  titleEn: string;
  description: string;
  performedBy: string;
  timestamp: string;
  meta?: Record<string, any>;
}

export interface KnockoutResult {
  questionId: string;
  question: string;
  answer: string;
  passed: boolean;
}

export interface ParsedResumeData {
  summary: string;
  extractedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  education: string;
  experienceSummary: string;
  yearsOfExperience: number;
  languages: string[];
  certifications: string[];
}

export interface Candidate {
  id: string;
  name: string;
  nameEn?: string;
  email: string;
  phone: string;
  nationalId?: string;
  avatar?: string;
  location: string;
  currentTitle: string;
  currentCompany: string;
  experienceYears: number;
  education: string;
  currentSalary?: number;
  expectedSalary?: number;
  currency: string;
  noticePeriodDays: number;
  source: 'linkedin' | 'careers_page' | 'referral' | 'indeed' | 'bayt' | 'direct';
  utmSource?: string;
  utmCampaign?: string;
  referralEmployeeName?: string;
  jobId: string;
  jobTitle: string;
  jobDepartment: string;
  companyId?: string;
  companyName?: string;
  stage: PipelineStageId;
  status: 'active' | 'rejected' | 'hired' | 'withdrawn';
  matchScore: number; // 0 - 100%
  rating: number; // 1 - 5
  tags: string[];
  resumeUrl?: string;
  resumeName?: string;
  parsedResume?: ParsedResumeData;
  knockoutResults?: KnockoutResult[];
  notes: CandidateNote[];
  activities: CandidateActivity[];
  rejectionReason?: string;
  appliedAt: string;
  updatedAt: string;
}

export interface PipelineStageConfig {
  id: PipelineStageId;
  title: string;
  titleEn: string;
  color: string;
  description: string;
  order: number;
}

export const DEFAULT_STAGES: PipelineStageConfig[] = [
  { id: 'applied', title: 'طلبات جديدة', titleEn: 'Applied', color: '#1B4938', description: 'طلبات التقديم الجديدة غير المفروزة', order: 1 },
  { id: 'screening', title: 'فرز وتصفية أولية', titleEn: 'Screening', color: '#38A37F', description: 'مطابقة المعايير والخبرات الأساسية', order: 2 },
  { id: 'tech_assessment', title: 'تقييم فني وإدارة', titleEn: 'Assessment', color: '#1E588F', description: 'اختبارات تقنية ولغوية وتخصصية', order: 3 },
  { id: 'first_interview', title: 'مقابلات الموارد البشرية', titleEn: 'HR Interview', color: '#8F5B1E', description: 'مقابلة استقطاب الكفاءات والمدير المباشر', order: 4 },
  { id: 'final_interview', title: 'مقابلة نهائية', titleEn: 'Final Interview', color: '#6A2A82', description: 'المقابلة مع الإدارة التنفيذية', order: 5 },
  { id: 'job_offer', title: 'عروض العمل', titleEn: 'Job Offer', color: '#D97706', description: 'إصدار وتوقيع العرض الوظيفي', order: 6 },
  { id: 'hired', title: 'تم التعيين', titleEn: 'Hired', color: '#10B981', description: 'إتمام مسوغات التعيين والتحويل للمنظومة', order: 7 },
  { id: 'rejected', title: 'قائمة الاحتياط / مرفوض', titleEn: 'Rejected', color: '#EF4444', description: 'استبعاد أو حفظ في قائمة المواهب', order: 8 },
];

export type RequisitionStatus = 
  | 'draft'
  | 'pending_hr'
  | 'pending_finance'
  | 'pending_executive'
  | 'approved'
  | 'published'
  | 'completed'
  | 'archived'
  | 'rejected'
  | 'closed';

export type RequisitionReason = 'replacement' | 'expansion' | 'new_project' | 'seasonal';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'remote' | 'hybrid';

export interface ApprovalStep {
  tier: number;
  tierName: string;
  tierNameEn: string;
  role: 'hr_manager' | 'finance_director' | 'executive';
  approverId: string;
  approverName: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  actionDate?: string;
}

export interface KnockoutRule {
  id: string;
  question: string;
  questionEn: string;
  expectedAnswer: 'yes' | 'no' | string;
  isMandatory: boolean;
}

export interface JobRequisition {
  id: string;
  code: string;
  title: string;
  titleEn?: string;
  companyId?: string;
  companyName?: string;
  department: string;
  departmentEn?: string;
  reason?: RequisitionReason;
  headcount: number;
  filledCount: number;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  employmentType: EmploymentType;
  location: string;
  locationEn?: string;
  experienceYearsMin: number;
  experienceYearsMax: number;
  educationLevel?: string;
  educationLevelEn?: string;
  skills: string[];
  description: string;
  descriptionEn?: string;
  responsibilities: string[];
  requirements: string[];
  knockoutRules?: KnockoutRule[];
  status: RequisitionStatus;
  currentTier: number;
  approvalChain: ApprovalStep[];
  hiringManagerId?: string;
  hiringManagerName?: string;
  recruiterId?: string;
  recruiterName?: string;
  recruiterAvatar?: string;
  publishedAt?: string;
  targetHireDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobTemplate {
  id: string;
  title: string;
  titleEn: string;
  department: string;
  defaultSkills: string[];
  defaultResponsibilities: string[];
  defaultRequirements: string[];
  experienceLevel: string;
}

export type InterviewType = 'hr_screening' | 'technical' | 'cultural_fit' | 'executive_final';
export type InterviewPlatform = 'google_meet' | 'ms_teams' | 'zoom' | 'in_person' | 'phone';
export type InterviewStatus = 'scheduled' | 'completed' | 'cancelled' | 'pending_candidate_booking';
export type HiringRecommendation = 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no';

export interface CompetencyScoreItem {
  id: string;
  category: string;
  categoryEn: string;
  criterion: string;
  criterionEn: string;
  weightPercent: number;
  score: number;
  notes?: string;
}

export interface Scorecard {
  id: string;
  interviewId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  interviewerId: string;
  interviewerName: string;
  interviewerRole: string;
  criteria: CompetencyScoreItem[];
  weightedAverageScore: number;
  recommendation: HiringRecommendation;
  summaryFeedback: string;
  keyStrengths: string[];
  growthAreas: string[];
  submittedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobId: string;
  jobTitle: string;
  companyId?: string;
  companyName?: string;
  type: InterviewType;
  platform: InterviewPlatform;
  meetingLink?: string;
  locationDetails?: string;
  date: string;
  startTime: string;
  endTime: string;
  interviewers: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  status: InterviewStatus;
  notes?: string;
  scorecardId?: string;
  scorecard?: Scorecard;
  createdAt: string;
}

export type OfferStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent_to_candidate'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'synced_to_core_hr';

export interface OfferCompensation {
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  otherAllowance: number;
  totalMonthly: number;
  totalAnnual: number;
  currency: string;
  bonusScheme?: string;
  probationMonths: number;
  annualLeaveDays: number;
  medicalInsuranceTier: 'VIP' | 'Class A' | 'Class B' | 'Standard';
  flightTicketAllowance?: string;
}

export type DocumentType = 
  | 'national_id'
  | 'passport'
  | 'degree_certificate'
  | 'experience_certificate'
  | 'bank_iban_letter'
  | 'medical_check'
  | 'criminal_clearance';

export interface PreboardingDocument {
  id: string;
  type: DocumentType;
  title: string;
  titleEn: string;
  isRequired: boolean;
  isUploaded: boolean;
  fileName?: string;
  fileUrl?: string;
  fileSize?: string;
  uploadedAt?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
}

export interface JobOffer {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobId: string;
  jobTitle: string;
  department: string;
  companyId?: string;
  companyName?: string;
  reportingTo: string;
  joiningDate: string;
  expiryDate: string;
  compensation: OfferCompensation;
  termsAndConditions: string;
  status: OfferStatus;
  hrSignerName: string;
  hrSignedAt?: string;
  candidateSignature?: {
    signatureDataUrl: string;
    signedAt: string;
    ipAddress?: string;
  };
  declineReason?: string;
  preboardingDocuments: PreboardingDocument[];
  isSyncedToCoreHR: boolean;
  coreHREmployeeId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TriggerType = 
  | 'stage_changed'
  | 'scorecard_submitted'
  | 'offer_accepted'
  | 'candidate_applied'
  | 'knockout_failed'
  | 'requisition_approved'
  | 'candidate_hired'
  | 'commercial_license_expiring'
  | 'insurance_form_submitted';

export type ActionType = 
  | 'send_email_template'
  | 'send_whatsapp_sms'
  | 'move_candidate_stage'
  | 'notify_hiring_manager'
  | 'send_candidate_booking_link'
  | 'create_calendar_invite'
  | 'sync_to_core_hr'
  | 'notify_manager'
  | 'log_audit_trail';

export interface AutomationCondition {
  field: 'stage' | 'match_score' | 'department' | 'rating' | 'recommendation' | 'knockout_passed' | 'salary';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number | boolean;
}

export interface AutomationAction {
  type: ActionType;
  params: {
    templateId?: string;
    targetStage?: string;
    recipient?: string;
    delayHours?: number;
    customMessage?: string;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  module?: string;
  trigger: TriggerType;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  timesExecuted: number;
  lastExecutedAt?: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  actionEn: string;
  category: 'auth' | 'candidate' | 'requisition' | 'offer' | 'interview' | 'automation' | 'rbac';
  targetId?: string;
  targetTitle?: string;
  details: string;
  timestamp: string;
}

export interface RecruitmentKPIs {
  timeToHireDays: number;
  timeToFillDays: number;
  costPerHire: number;
  totalOpenRequisitions: number;
  activeCandidatesInPipeline: number;
  totalHiresThisQuarter: number;
  offerAcceptanceRate: number;
  candidateSatisfactionScore: number;
  timeToHireChange: number;
  costPerHireSavings: number;
  offersSignedCount: number;
  offersSentTotal: number;
}

