// ====================================================================
// ECO ERP - Project Correspondence Management System (PCMS / CTS)
// Central Types & Schema Definitions
// ====================================================================

export type DocType = 
  | 'LTR'    // Official Correspondence Letter (خطاب رسمي)
  | 'SUB'    // Material / Technical Submittal (اعتماد فني / مواد)
  | 'RFI'    // Request for Information (استفسار فني)
  | 'IPC'    // Interim Payment Certificate (مستخلص جاري)
  | 'MOM'    // Minutes of Meeting (محضر اجتماع)
  | 'TRANS'  // Document Transmittal (مذكرة إرسال)
  | 'SITE'   // Site Instruction / Notice (ملاحظة موقعية)
  | 'NCR'    // Non-Conformance Report
  | 'VAR';   // Variation Order / Claim

export type Direction = 'Incoming' | 'Outgoing';

export type DocStatus = 
  | 'Draft'      // In progress draft, carries DRAFT-XXXX
  | 'Pending'    // Pending Review / Approval from PM
  | 'Approved'   // Officially approved with atomic serial generated
  | 'Replied'    // Inbound correspondence that received an official outbound reply
  | 'Closed'     // Completed contractual lifecycle
  | 'Rejected';  // Rejected / Needs revision

export type Priority = 'Normal' | 'Urgent' | 'Immediate' | 'Critical';

export interface Attachment {
  file_id: string;
  doc_ref: string;
  file_name: string;
  file_size_mb: number;
  storage_direct_url: string;
  file_category: string;
  upload_timestamp: string;
  mime_type?: string;
}

export interface WorkflowAction {
  action_id: string;
  doc_ref: string;
  from_user_id?: string;
  from_user_name?: string;
  to_user_id?: string;
  to_user_name?: string;
  action_required?: string;
  instructions?: string;
  due_date?: string;
  action_status?: 'Pending' | 'Completed' | 'Overdue';
  created_at?: string;
}

export interface Correspondence {
  doc_id: string;                      // Immutable UUID
  doc_type: Direction;                 // 'Incoming' (وارد) or 'Outgoing' (صادر)
  classification: DocType;             // LTR, SUB, RFI, IPC, etc.
  serial_number: string;               // e.g. 1233-CON-CTR-LTR-26-0045 or DRAFT-9182
  is_draft?: boolean;                  // True if unapproved draft
  external_ref_no?: string;            // Sender's external letter number (e.g. MOI/442/26)
  project_ref: string;                 // FK to Project (Project_Code or Project_ID)
  project_name?: string;
  subject: string;                     // Subject title & executive summary
  body_text?: string;                  // Formal letter text content
  sender_entity: string;               // e.g. "CON" / "استشارات العفيفي" / "وزارة الداخلية"
  receiver_entity: string;             // e.g. "CTR" / "شركة المقاولات" / "الاستشاري"
  originator_code?: string;            // e.g. "CON"
  recipient_code?: string;             // e.g. "CTR"
  priority: Priority;                  // Normal, Urgent, Immediate, Critical
  issue_date: string;                  // YYYY-MM-DD
  received_date?: string;              // Intake timestamp
  due_date?: string;                   // Contractual SLA deadline
  status: DocStatus;                   // Draft, Pending, Approved, Replied, Closed, Rejected
  parent_doc_id?: string | null;       // Link to parent inbound (for cross-referencing)
  parent_serial?: string | null;       // Serial of parent for quick dossier display
  created_by_user_id: string;
  created_by_name: string;
  approved_by_user_id?: string;
  approved_by_name?: string;
  approval_date?: string;
  attachments: Attachment[];
  workflow_history?: WorkflowAction[];
  review_remarks?: string;             // Revision remarks if returned by PM/Admin
  returned_by_name?: string;           // Name of manager who requested revisions
  returned_at?: string;                // Timestamp of return
  created_at?: string;
  updated_at?: string;
}

export type ProjectStatus = 'Active' | 'Suspended' | 'Handed_Over' | 'OnHold' | 'Completed' | 'Archived';
export type CurrencyCode = 'EGP' | 'SAR' | 'USD' | 'EUR' | 'AED';

export interface Project {
  project_id: string;          // e.g. "PRJ-1233" or "1233"
  project_code: string;        // Short code, e.g. "1233"
  project_name: string;        // Official name
  client_name: string;         // Owner
  consultant_name: string;     // Consultant entity
  contractor_name: string;     // Contractor entity
  project_status: ProjectStatus;
  start_date: string;
  end_date?: string;
  location?: string;
  total_budget?: number;
  total_budget_sar?: number;
  currency?: CurrencyCode;     // default: 'EGP'
  description?: string;
  scope_of_work?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type EntityRole = 
  | 'Consultant'       // مكتب استشاري
  | 'Owner'            // جهة مالكة / صاحب العمل
  | 'Main_Contractor'  // مقاول عام
  | 'Subcontractor'    // مقاول باطن
  | 'Supplier'         // مورد معتمد
  | 'Government'       // جهة حكومية / تنظيمية
  | 'Authority'
  | 'Other';

export type LegalEntityType = 
  | 'Company'          // شركة
  | 'Legal_Entity'     // شخص اعتباري / هيئة / وزارة
  | 'Individual';      // شخص فردي / مكتب فردي

export type EntityStatus = 'Active' | 'Inactive';

export interface Entity {
  id: string;                  // Unique UUID, e.g. "ent-01"
  code: string;                // Short code / Acronym e.g. "CON", "CTR", "MOI", "CLI"
  name: string;                // Official Trade Name e.g. "مركز استشارات العفيفي الهندسي"
  short_name?: string;         // e.g. "استشارات العفيفي"
  role: EntityRole;            // Stakeholder classification
  legal_type: LegalEntityType; // Legal constitution
  registration_no?: string;    // السجل التجاري / رخصة المزاولة
  tax_no?: string;             // الرقم الضريبي
  contact_person?: string;     // الشخص المفوض / ضابط الاتصال
  contact_title?: string;      // المسمى الوظيفي
  phone?: string;              // هاتف أرضي
  mobile?: string;             // جوال / واتساب
  email?: string;              // البريد الإلكتروني الرسمي
  address?: string;            // المقر / العنوان
  website?: string;            // الموقع الإلكتروني
  status: EntityStatus;        // الحالة (نشط / غير نشط)
  notes?: string;              // ملاحظات عامة
  created_at?: string;
  updated_at?: string;
}

export interface AuditLogItem {
  id?: string;
  log_id?: string;
  correspondence_id?: string;
  user_id?: string;
  user_name: string;
  action_type: string;
  target_doc: string;
  timestamp: string;
  details?: string;
  previous_value?: string;
  new_value?: string;
  changed_fields?: string[];
}

export interface SystemCounter {
  counter_key: string;                 // `${project_code}_${doc_type}_${year}` e.g. "1233_LTR_26"
  project_code: string;
  doc_type: DocType;
  year: string;                        // "26"
  last_serial: number;                 // Integer: 42 -> next is 43
  updated_at: string;
}

export interface CTSSummaryStats {
  totalLetters: number;
  inboundCount: number;
  outboundCount: number;
  draftsCount: number;
  replyRate: number;
  activeProjectsCount: number;
  total_correspondences: number;
  total_inbound: number;
  total_outbound: number;
  total_drafts: number;
  total_pending_approval: number;
  total_approved: number;
  total_replied: number;
  total_overdue: number;
  average_reply_time_days: number;
}
