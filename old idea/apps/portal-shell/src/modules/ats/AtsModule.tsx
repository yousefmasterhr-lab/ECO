import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Briefcase, 
  Star, 
  FileText, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  DollarSign,
  Building2,
  Filter,
  BarChart3,
  BookOpen,
  Send,
  Calendar
} from 'lucide-react';
import { EmbeddedAppContainer } from '../../components/common/EmbeddedAppContainer';

export type PipelineStage = 
  | 'applied'           // تم الاستلام
  | 'screening'         // فرز مبدئي
  | 'tech_assessment'   // تقييم فني
  | 'first_interview'   // مقابلة أولى
  | 'final_interview'   // مقابلة نهائية
  | 'job_offer'         // عرض عمل
  | 'hired'             // تم التعيين
  | 'rejected';         // مرفوض

interface ATSCandidate {
  id: string;
  name: string;
  roleApplied: string;
  requisitionId: string;
  stage: PipelineStage;
  experienceYears: number;
  ratingScore: number;
  email: string;
  phone: string;
  appliedDate: string;
  driveResumeId: string;
  extractedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  currentCompany?: string;
  expectedSalary?: number;
}

interface JobRequisition {
  id: string;
  title: string;
  department: string;
  headcount: number;
  filled: number;
  salaryMin: number;
  salaryMax: number;
  experienceMin: number;
  status: 'published' | 'pending_approval' | 'draft' | 'closed';
  targetDate: string;
}

interface InterviewSchedule {
  id: string;
  candidateName: string;
  role: string;
  interviewer: string;
  dateTime: string;
  type: 'Technical' | 'HR' | 'Executive';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

const MOCK_REQUISITIONS: JobRequisition[] = [
  {
    id: 'req_01',
    title: 'مهندس مكتب فني أول (شوب دروينج وتنسيق مشاريع)',
    department: 'المكتب الفني الهندسي',
    headcount: 2,
    filled: 1,
    salaryMin: 35000,
    salaryMax: 48000,
    experienceMin: 6,
    status: 'published',
    targetDate: '2026-10-15'
  },
  {
    id: 'req_02',
    title: 'أخصائي شؤون قانونية وعقود مقاولات',
    department: 'الشؤون القانونية',
    headcount: 1,
    filled: 0,
    salaryMin: 28000,
    salaryMax: 38000,
    experienceMin: 4,
    status: 'published',
    targetDate: '2026-10-30'
  },
  {
    id: 'req_03',
    title: 'مهندس تنفيذ موقع أول (مدني خرسانات)',
    department: 'إدارة المشروعات والتنفيذ',
    headcount: 3,
    filled: 2,
    salaryMin: 32000,
    salaryMax: 44000,
    experienceMin: 7,
    status: 'published',
    targetDate: '2026-11-01'
  },
  {
    id: 'req_04',
    title: 'أخصائي تأمينات اجتماعية وموارد بشرية',
    department: 'الموارد البشرية والتأمينات',
    headcount: 1,
    filled: 0,
    salaryMin: 20000,
    salaryMax: 26000,
    experienceMin: 4,
    status: 'pending_approval',
    targetDate: '2026-10-20'
  }
];

const INITIAL_CANDIDATES: ATSCandidate[] = [
  {
    id: 'cand_01',
    name: 'م. حسام الدين غانم',
    roleApplied: 'مهندس مكتب فني أول (شوب دروينج وتنسيق مشاريع)',
    requisitionId: 'req_01',
    stage: 'first_interview',
    experienceYears: 7,
    ratingScore: 5,
    email: 'hossam.ghanem@gmail.com',
    phone: '+20 102 918 2741',
    appliedDate: '2026-09-14',
    driveResumeId: 'drive_cv_hossam_ghanem',
    extractedSkills: ['AutoCAD', 'Revit', 'Shop Drawings', 'BIM Coordination', 'Navisworks'],
    matchedSkills: ['AutoCAD', 'Revit', 'Shop Drawings', 'BIM Coordination'],
    missingSkills: ['Primavera P6'],
    currentCompany: 'أوراسكوم للإنشاءات',
    expectedSalary: 45000
  },
  {
    id: 'cand_02',
    name: 'أ/ نورهان عادل السعيد',
    roleApplied: 'أخصائي شؤون قانونية وعقود مقاولات',
    requisitionId: 'req_02',
    stage: 'job_offer',
    experienceYears: 5,
    ratingScore: 5,
    email: 'nourhan.adel@outlook.com',
    phone: '+20 114 829 1049',
    appliedDate: '2026-09-10',
    driveResumeId: 'drive_cv_nourhan_adel',
    extractedSkills: ['صياغة العقود', 'التحكيم الهندسي', 'قانون الشركات', 'تأسيس الكيانات'],
    matchedSkills: ['صياغة العقود', 'قانون الشركات', 'تأسيس الكيانات'],
    missingSkills: ['FIDIC Contracts'],
    currentCompany: 'مجموعة طلعت مصطفى',
    expectedSalary: 35000
  },
  {
    id: 'cand_03',
    name: 'م. يوسف فؤاد النجار',
    roleApplied: 'مهندس كهرباء وميكانيكا (MEP)',
    requisitionId: 'req_01',
    stage: 'tech_assessment',
    experienceYears: 4,
    ratingScore: 4,
    email: 'youssef.elngar@gmail.com',
    phone: '+20 128 301 9482',
    appliedDate: '2026-09-18',
    driveResumeId: 'drive_cv_youssef_elngar',
    extractedSkills: ['HVAC Design', 'Firefighting', 'Plumbing', 'HAP Software'],
    matchedSkills: ['HVAC Design', 'Plumbing'],
    missingSkills: ['BMS'],
    currentCompany: 'المقاولون العرب',
    expectedSalary: 28000
  },
  {
    id: 'cand_04',
    name: 'أ/ شريف ممدوح سليم',
    roleApplied: 'أخصائي تأمينات اجتماعية وموارد بشرية',
    requisitionId: 'req_04',
    stage: 'screening',
    experienceYears: 6,
    ratingScore: 4,
    email: 'sherif.mamdouh@yahoo.com',
    phone: '+20 109 482 0194',
    appliedDate: '2026-09-16',
    driveResumeId: 'drive_cv_sherif_mamdouh',
    extractedSkills: ['استمارة 1 و 6', 'قانون العمل 12', 'قانون التأمينات 148', 'مسيرات الرواتب'],
    matchedSkills: ['استمارة 1 و 6', 'قانون التأمينات 148'],
    missingSkills: ['Excel Advanced VLOOKUP / Power Query'],
    currentCompany: 'مستشفى السلام الدولي',
    expectedSalary: 23000
  },
  {
    id: 'cand_05',
    name: 'م. رامي طارق زهران',
    roleApplied: 'مهندس تنفيذ موقع أول (مدني خرسانات)',
    requisitionId: 'req_03',
    stage: 'hired',
    experienceYears: 9,
    ratingScore: 5,
    email: 'rami.zahran@gmail.com',
    phone: '+20 101 294 8192',
    appliedDate: '2026-08-25',
    driveResumeId: 'drive_cv_rami_zahran',
    extractedSkills: ['إدارة الموقع', 'استلام أعمال الخرسانات', 'حصر الكميات', 'الأمن والسلامة'],
    matchedSkills: ['إدارة الموقع', 'استلام أعمال الخرسانات', 'حصر الكميات'],
    missingSkills: [],
    currentCompany: 'حسن علام القابضة',
    expectedSalary: 42000
  }
];

const MOCK_INTERVIEWS: InterviewSchedule[] = [
  {
    id: 'int_01',
    candidateName: 'م. حسام الدين غانم',
    role: 'مهندس مكتب فني أول',
    interviewer: 'م. أحمد شكري (مدير المكتب الفني)',
    dateTime: '2026-09-22 11:30 AM',
    type: 'Technical',
    status: 'Scheduled'
  },
  {
    id: 'int_02',
    candidateName: 'م. يوسف فؤاد النجار',
    role: 'مهندس MEP',
    interviewer: 'م. وليد كمال (رئيس قسم الكهروميكانيك)',
    dateTime: '2026-09-23 02:00 PM',
    type: 'Technical',
    status: 'Scheduled'
  }
];

const AtsQuickDashboard: React.FC = () => {
  const { language, previewDriveFile, activeCompany } = useApp();
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'REQUISITIONS' | 'INTERVIEWS' | 'TALENT_POOL' | 'ANALYTICS'>('PIPELINE');
  const [candidates, setCandidates] = useState<ATSCandidate[]>(INITIAL_CANDIDATES);
  const [selectedReqFilter, setSelectedReqFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isAr = language === 'ar';

  const KANBAN_STAGES: { id: PipelineStage; titleAr: string; titleEn: string; color: string }[] = [
    { id: 'applied', titleAr: 'تم الاستلام', titleEn: 'Applied', color: 'var(--erp-text-dim)' },
    { id: 'screening', titleAr: 'فرز مبدئي', titleEn: 'Screening', color: 'var(--erp-dept-cts)' },
    { id: 'tech_assessment', titleAr: 'تقييم فني', titleEn: 'Tech Assessment', color: 'var(--erp-dept-engineering)' },
    { id: 'first_interview', titleAr: 'مقابلة أولى', titleEn: '1st Interview', color: 'var(--erp-dept-ats)' },
    { id: 'final_interview', titleAr: 'مقابلة نهائية', titleEn: 'Final Interview', color: 'var(--erp-dept-executive)' },
    { id: 'job_offer', titleAr: 'عرض عمل', titleEn: 'Job Offer', color: '#f59e0b' },
    { id: 'hired', titleAr: 'تم التعيين', titleEn: 'Hired', color: 'var(--erp-status-success)' }
  ];

  const moveCandidate = (candidateId: string, direction: 'forward' | 'backward') => {
    const stageOrder: PipelineStage[] = [
      'applied', 'screening', 'tech_assessment', 'first_interview', 'final_interview', 'job_offer', 'hired'
    ];
    setCandidates(prev => prev.map(c => {
      if (c.id !== candidateId) return c;
      const currentIndex = stageOrder.indexOf(c.stage);
      const newIndex = direction === 'forward' 
        ? Math.min(currentIndex + 1, stageOrder.length - 1) 
        : Math.max(currentIndex - 1, 0);
      const nextStage = stageOrder[newIndex] ?? 'applied';
      return { ...c, stage: nextStage };
    }));
  };

  const filteredCandidates = candidates.filter(c => {
    const matchesReq = selectedReqFilter === 'ALL' || c.requisitionId === selectedReqFilter;
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.roleApplied.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.extractedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesReq && matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--erp-space-6)' }}>
      {/* Module Banner */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        borderInlineStart: '4px solid var(--erp-dept-ats)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--erp-space-4)' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--erp-radius-lg)',
            background: 'hsla(262, 83%, 58%, 0.15)',
            color: 'var(--erp-dept-ats)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                {isAr ? 'منظومة استقطاب وتوظيف الكفاءات (ATS Enterprise Platform)' : 'Talent Acquisition & ATS Enterprise Platform'}
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                background: 'hsla(262, 83%, 58%, 0.15)',
                color: 'var(--erp-dept-ats)',
                padding: '2px 8px',
                borderRadius: 'var(--erp-radius-sm)'
              }}>
                8-STAGE PIPELINE & REQUISITIONS
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--erp-text-muted)', marginTop: '2px' }}>
              {isAr ? `إدارة الشواغر، لوحة الكانبان، وفحص مهارات السير الذاتية لـ: ${activeCompany.nameAr}` : `Job requisitions, candidate pipeline, and resume parsing for ${activeCompany.nameEn}`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--erp-space-2)' }}>
          <button
            onClick={() => alert(isAr ? 'فتح نافذة نشر شاغر وظيفي جديد...' : 'Opening new requisition creator...')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--erp-dept-ats)',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={15} />
            <span>{isAr ? 'طلب تعيين جديد' : 'New Requisition'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--erp-space-4)'
      }}>
        <div style={{ display: 'flex', gap: 'var(--erp-space-2)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('PIPELINE')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'PIPELINE' ? '1px solid var(--erp-dept-ats)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'PIPELINE' ? 'hsla(262, 83%, 58%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'PIPELINE' ? 'var(--erp-dept-ats)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {isAr ? 'لوحة تتبع المرشحين (Kanban)' : 'Pipeline Kanban'} ({filteredCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab('REQUISITIONS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'REQUISITIONS' ? '1px solid var(--erp-dept-ats)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'REQUISITIONS' ? 'hsla(262, 83%, 58%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'REQUISITIONS' ? 'var(--erp-dept-ats)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Briefcase size={15} />
            <span>{isAr ? 'الشواغر وطلبات التعيين' : 'Requisitions'} ({MOCK_REQUISITIONS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('INTERVIEWS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'INTERVIEWS' ? '1px solid var(--erp-dept-ats)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'INTERVIEWS' ? 'hsla(262, 83%, 58%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'INTERVIEWS' ? 'var(--erp-dept-ats)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Calendar size={15} />
            <span>{isAr ? 'أجندة المقابلات' : 'Interviews'} ({MOCK_INTERVIEWS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('ANALYTICS')}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--erp-radius-lg)',
              border: activeTab === 'ANALYTICS' ? '1px solid var(--erp-dept-ats)' : '1px solid var(--erp-border-color)',
              background: activeTab === 'ANALYTICS' ? 'hsla(262, 83%, 58%, 0.15)' : 'var(--erp-bg-surface)',
              color: activeTab === 'ANALYTICS' ? 'var(--erp-dept-ats)' : 'var(--erp-text-main)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BarChart3 size={15} />
            <span>{isAr ? 'مؤشرات التوظيف' : 'Analytics'}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', top: '12px', insetInlineStart: '12px', color: 'var(--erp-text-dim)' }} />
          <input
            type="text"
            placeholder={isAr ? 'بحث بالاسم، المسمى، أو المهارة...' : 'Search name, role, or skill...'}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              paddingInlineStart: '36px',
              background: 'var(--erp-bg-surface)',
              border: '1px solid var(--erp-border-color)',
              borderRadius: 'var(--erp-radius-lg)',
              color: 'var(--erp-text-main)',
              fontSize: '13px'
            }}
          />
        </div>
      </div>

      {/* Tab View: Kanban Pipeline */}
      {activeTab === 'PIPELINE' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(280px, 1fr))',
          gap: 'var(--erp-space-4)',
          overflowX: 'auto',
          paddingBottom: '20px'
        }}>
          {KANBAN_STAGES.map(col => {
            const colCandidates = filteredCandidates.filter(c => c.stage === col.id);
            return (
              <div
                key={col.id}
                className="glass-card"
                style={{
                  background: 'var(--erp-bg-surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 'var(--erp-radius-lg)',
                  padding: '16px',
                  minHeight: '560px'
                }}
              >
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--erp-border-color)',
                  marginBottom: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: col.color
                    }} />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                      {isAr ? col.titleAr : col.titleEn}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 'var(--erp-radius-full)',
                    background: 'var(--erp-bg-subtle)',
                    color: 'var(--erp-text-dim)'
                  }}>
                    {colCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                  {colCandidates.map(cand => (
                    <motion.div
                      layout
                      key={cand.id}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--erp-radius-md)',
                        background: 'var(--erp-bg-subtle)',
                        border: '1px solid var(--erp-border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                          {cand.name}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                          <Star size={12} fill="#f59e0b" />
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>{cand.ratingScore}</span>
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--erp-dept-ats)', fontWeight: 700 }}>
                        {cand.roleApplied}
                      </div>

                      <div style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)' }}>
                        {cand.currentCompany} • {isAr ? `${cand.experienceYears} سنوات خبرة` : `${cand.experienceYears}y exp`}
                      </div>

                      {/* Matched Skills Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                        {cand.matchedSkills.slice(0, 3).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 'var(--erp-radius-sm)',
                              background: 'hsla(160, 84%, 39%, 0.15)',
                              color: 'var(--erp-status-success)'
                            }}
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--erp-border-color)',
                        paddingTop: '10px'
                      }}>
                        <button
                          onClick={() => previewDriveFile(cand.driveResumeId, `Resume_${cand.name.replace(/\s+/g, '_')}.pdf`)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--erp-brand-primary)',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <FileText size={13} />
                          <span>{isAr ? 'السيرة الذاتية' : 'CV'}</span>
                        </button>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={() => moveCandidate(cand.id, 'backward')}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: 'var(--erp-radius-sm)',
                              border: '1px solid var(--erp-border-color)',
                              background: 'var(--erp-bg-surface)',
                              color: 'var(--erp-text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={isAr ? 'المرحلة السابقة' : 'Previous'}
                          >
                            {isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                          </button>
                          <button
                            onClick={() => moveCandidate(cand.id, 'forward')}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: 'var(--erp-radius-sm)',
                              border: '1px solid var(--erp-border-color)',
                              background: 'var(--erp-bg-surface)',
                              color: 'var(--erp-text-muted)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title={isAr ? 'المرحلة التالية' : 'Next'}
                          >
                            {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab View: Requisitions Manager */}
      {activeTab === 'REQUISITIONS' && (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isAr ? 'right' : 'left' }}>
              <thead>
                <tr style={{ background: 'var(--erp-bg-subtle)', borderBottom: '1px solid var(--erp-border-color)', color: 'var(--erp-text-dim)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'المسمى الوظيفي والقسم' : 'Title & Department'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'العدد المطلوب / المعين' : 'Headcount / Filled'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'نطاق الراتب التقديري (Salary Shield)' : 'Salary Range'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الخبرة وتاريخ الإغلاق' : 'Exp & Target Date'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'حالة الشاغر' : 'Status'}</th>
                  <th style={{ padding: '14px 16px' }}>{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_REQUISITIONS.map(req => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--erp-border-color)', fontSize: '13.5px' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 800, color: 'var(--erp-text-main)' }}>{req.title}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--erp-text-dim)', marginTop: '2px' }}>
                        {req.department}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px' }}>
                        {req.filled} / {req.headcount} {isAr ? 'معين' : 'Filled'}
                      </div>
                      <div style={{ width: '100px', height: '6px', background: 'var(--erp-bg-subtle)', borderRadius: '999px', marginTop: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${(req.filled / req.headcount) * 100}%`, height: '100%', background: 'var(--erp-status-success)' }} />
                      </div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 800 }}>
                      {req.salaryMin.toLocaleString()} - {req.salaryMax.toLocaleString()} {activeCompany.currency}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div>{isAr ? `${req.experienceMin}+ سنوات` : `${req.experienceMin}+ yrs`}</div>
                      <span style={{ fontSize: '11px', color: 'var(--erp-text-dim)' }}>{req.targetDate}</span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 'var(--erp-radius-sm)',
                        background: req.status === 'published' ? 'hsla(142, 71%, 45%, 0.15)' : 'hsla(38, 92%, 50%, 0.15)',
                        color: req.status === 'published' ? 'var(--erp-status-success)' : 'var(--erp-status-warning)'
                      }}>
                        {req.status === 'published' ? (isAr ? 'منشور نشط' : 'Published') : (isAr ? 'قيد الاعتماد' : 'Pending')}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button
                        onClick={() => {
                          setSelectedReqFilter(req.id);
                          setActiveTab('PIPELINE');
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--erp-radius-md)',
                          background: 'var(--erp-bg-subtle)',
                          border: '1px solid var(--erp-border-color)',
                          color: 'var(--erp-dept-ats)',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {isAr ? 'عرض المرشحين' : 'View Pipeline'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab View: Interviews Schedule */}
      {activeTab === 'INTERVIEWS' && (
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
            {isAr ? 'المقابلات الشخصية والفنية المجدولة للأسبوع الحالي' : 'Scheduled Technical & HR Interviews'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {MOCK_INTERVIEWS.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--erp-radius-lg)',
                  background: 'var(--erp-bg-subtle)',
                  border: '1px solid var(--erp-border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--erp-text-main)' }}>
                    {item.candidateName}
                  </span>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--erp-radius-sm)',
                    background: 'var(--erp-brand-primary-subtle)',
                    color: 'var(--erp-brand-primary)'
                  }}>
                    {item.type}
                  </span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--erp-dept-ats)', fontWeight: 700 }}>
                  {item.role}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--erp-text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>{item.dateTime}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--erp-text-muted)' }}>
                  {isAr ? 'المقابل:' : 'Interviewer:'} <strong>{item.interviewer}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab View: Analytics */}
      {activeTab === 'ANALYTICS' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              {isAr ? 'متوسط زمن التعيين (Time to Hire)' : 'Average Time to Hire'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--erp-text-main)', marginTop: '8px' }}>
              18 <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--erp-text-dim)' }}>{isAr ? 'يوم' : 'days'}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--erp-status-success)', marginTop: '4px', fontWeight: 700 }}>
              -4 {isAr ? 'أيام أسرع من المعدل المستهدف' : 'days vs benchmark'}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              {isAr ? 'نسبة قبول العروض المالية (Offer Acceptance)' : 'Offer Acceptance Rate'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--erp-text-main)', marginTop: '8px' }}>
              92.4%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--erp-status-success)', marginTop: '4px', fontWeight: 700 }}>
              +8.1% {isAr ? 'ارتفاع التنافسية السوقية' : 'market competitiveness'}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '13px', color: 'var(--erp-text-dim)', fontWeight: 600 }}>
              {isAr ? 'إجمالي السير الذاتية المفحوصة' : 'Total Resumes Screened'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--erp-dept-ats)', marginTop: '8px' }}>
              412 <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--erp-text-dim)' }}>CVs</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--erp-text-dim)', marginTop: '4px' }}>
              {isAr ? 'عبر بوابة التوظيف ومنصات LinkedIn' : 'Via Careers & Direct Sourcing'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AtsModule: React.FC = () => {
  return (
    <EmbeddedAppContainer
      appUrl="/apps/ats/"
      appTitleAr="منظومة استقطاب وتوظيف الكفاءات (ATS Enterprise Platform)"
      appTitleEn="Talent Acquisition & ATS Enterprise Platform"
      departmentCode="04_ATS"
      accentColor="var(--erp-dept-ats)"
      badgeAr="المنظومة الأصلية كاملة"
      badgeEn="FULL PRODUCTION APP"
      fallbackDashboard={<AtsQuickDashboard />}
    />
  );
};
