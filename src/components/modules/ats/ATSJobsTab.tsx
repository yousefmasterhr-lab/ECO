import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  Building2, 
  CheckCircle2, 
  Archive, 
  Trash2, 
  Eye, 
  X
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { atsStorage } from '../../../services/atsStorage';
import { JobRequisition, RequisitionStatus, EmploymentType } from './types';
import { fireConfetti } from '../../../utils/confetti';

interface ATSJobsTabProps {
  companyId?: string;
}

export const ATSJobsTab: React.FC<ATSJobsTabProps> = ({ companyId }) => {
  const { t } = useLanguage();
  const { activeCompany, selectedCompanies } = useTenant();

  const [jobs, setJobs] = useState<JobRequisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequisition | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [department, setDepartment] = useState('الإدارة الهندسية');
  const [compSelect, setCompSelect] = useState(companyId || activeCompany?.id || 'comp_01');
  const [headcount, setHeadcount] = useState(1);
  const [minSalary, setMinSalary] = useState(25000);
  const [maxSalary, setMaxSalary] = useState(40000);
  const [employmentType] = useState<EmploymentType>('full_time');
  const [location] = useState('القاهرة - المقر الرئيسي');
  const [description, setDescription] = useState('');
  const [skillsText, setSkillsText] = useState('React, TypeScript, Node.js, SQL');
  const [targetHireDate] = useState('');

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await atsStorage.getJobs(companyId);
      setJobs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const handleUpdate = () => loadJobs();
    window.addEventListener('eco-ats-updated', handleUpdate);
    return () => window.removeEventListener('eco-ats-updated', handleUpdate);
  }, [companyId]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const targetComp = selectedCompanies.find(c => c.id === compSelect) || activeCompany;
    const newJob: JobRequisition = {
      id: `req_${Date.now()}`,
      code: `REQ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      title,
      titleEn,
      companyId: targetComp?.id || 'comp_01',
      companyName: targetComp?.nameAr || 'شركة أركان للإنشاءات الهندسية',
      department,
      headcount: Number(headcount) || 1,
      filledCount: 0,
      budgetMin: Number(minSalary) || 0,
      budgetMax: Number(maxSalary) || 0,
      currency: targetComp?.currency || 'EGP',
      employmentType,
      location,
      experienceYearsMin: 3,
      experienceYearsMax: 7,
      skills: skillsText.split(',').map(s => s.trim()).filter(Boolean),
      description,
      responsibilities: ['تنفيذ ومتابعة المهام التشغيلية وفق أعلى معايير الجودة'],
      requirements: ['مؤهل جامعي ملائم مع خبرة عملية مثبتة'],
      status: 'published',
      currentTier: 1,
      approvalChain: [],
      publishedAt: new Date().toISOString().substring(0, 10),
      targetHireDate: targetHireDate || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
      createdAt: new Date().toISOString().substring(0, 10),
      updatedAt: new Date().toISOString().substring(0, 10),
    };

    await atsStorage.saveJob(newJob);
    setIsCreateModalOpen(false);
    setTitle('');
    setTitleEn('');
    setDescription('');
    fireConfetti();
  };

  const handleUpdateStatus = async (job: JobRequisition, newStatus: RequisitionStatus) => {
    await atsStorage.saveJob({ ...job, status: newStatus });
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الشاغر الوظيفي؟')) return;
    await atsStorage.deleteJob(jobId);
    if (selectedJob?.id === jobId) setSelectedJob(null);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesDept = departmentFilter === 'all' || job.department === departmentFilter;
    const matchesComp = !companyId || companyId === 'all' || job.companyId === companyId;
    return matchesSearch && matchesStatus && matchesDept && matchesComp;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white/70 dark:bg-[#0D1C13]/70 backdrop-blur-md border border-[#E0D9CB] dark:border-[#1D3324] shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-amber-500" />
            {t('دليل الشواغر والاحتياجات الوظيفية', 'Job Openings & Requisitions')}
          </h2>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">
            {t('إدارة طلبات الاحتياج الوظيفي، الشواغر المعتمدة، ومعدلات الإشغال عبر الشركات', 'Manage active requisitions, headcounts, salary budgets, and approval workflows')}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-4 h-4" />
          {t('إضافة شاغر وظيفي جديد', 'Post New Job Opening')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white/60 dark:bg-[#0D1C13]/60 border border-[#E0D9CB] dark:border-[#1D3324] flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#5C665E] dark:text-[#97A69B] absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('ابحث برقم الشاغر، المسمى الوظيفي، أو القسم...', 'Search by code, title, or department...')}
            className="w-full pl-3 pr-9 py-2 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
        >
          <option value="all">{t('كافة الحالات', 'All Statuses')}</option>
          <option value="published">{t('منشور ونشط', 'Published')}</option>
          <option value="draft">{t('مسودة', 'Draft')}</option>
          <option value="completed">{t('مكتمل التعيين', 'Filled')}</option>
          <option value="archived">{t('مؤرشف', 'Archived')}</option>
        </select>

        {/* Department Filter */}
        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
        >
          <option value="all">{t('كافة الإدارات', 'All Departments')}</option>
          <option value="الإدارة الهندسية">{t('الإدارة الهندسية', 'Engineering')}</option>
          <option value="إدارة الموارد البشرية">{t('إدارة الموارد البشرية', 'HR')}</option>
          <option value="الشؤون المالية">{t('الشؤون المالية', 'Finance')}</option>
          <option value="إدارة المشروعات">{t('إدارة المشروعات', 'Projects')}</option>
        </select>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-[#5C665E] dark:text-[#97A69B]">
          {t('جاري تحميل الشواغر الوظيفية...', 'Loading job requisitions...')}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white/40 dark:bg-[#0D1C13]/40 border-2 border-dashed border-[#E0D9CB] dark:border-[#1D3324]">
          <Briefcase className="w-10 h-10 text-[#5C665E] dark:text-[#97A69B] mx-auto mb-3 opacity-40" />
          <h3 className="text-sm font-bold text-[#142319] dark:text-[#E8F3EB]">{t('لا توجد شواغر مطابقة', 'No Job Openings Found')}</h3>
          <p className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1">{t('يمكنك إنشاء شاغر جديد عبر الزر أعلاه', 'Create a new requisition to begin sourcing talent')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => {
            return (
              <div
                key={job.id}
                className="p-5 rounded-2xl bg-white/80 dark:bg-[#0D1C13]/80 border border-[#E0D9CB] dark:border-[#1D3324] hover:border-amber-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                      {job.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' :
                      job.status === 'completed' ? 'bg-blue-500/10 text-blue-500' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {job.status === 'published' ? t('منشور ونشط', 'Active') :
                       job.status === 'completed' ? t('مكتمل التعيين', 'Filled') :
                       t('مسودة', 'Draft')}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB] line-clamp-1">{job.title}</h3>
                  <div className="text-xs text-[#5C665E] dark:text-[#97A69B] mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-500" />
                    <span>{job.companyName || t('شركة المجموعة', 'Group Entity')}</span>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#5C665E] dark:text-[#97A69B]">
                      <span>{t('القسم / الإدارة:', 'Department:')}</span>
                      <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">{job.department}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#5C665E] dark:text-[#97A69B]">
                      <span>{t('المقر والنمط:', 'Location:')}</span>
                      <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">{job.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#5C665E] dark:text-[#97A69B]">
                      <span>{t('نطاق الراتب:', 'Budget Range:')}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {job.budgetMin.toLocaleString()} - {job.budgetMax.toLocaleString()} {job.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#5C665E] dark:text-[#97A69B]">
                      <span>{t('المطلوب تعيينهم:', 'Headcount:')}</span>
                      <span className="font-semibold text-[#142319] dark:text-[#E8F3EB]">
                        {job.filledCount} / {job.headcount} {t('موظف', 'Hires')}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  {job.skills && job.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {job.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F0ECE1] dark:bg-[#122318] text-[#5C665E] dark:text-[#97A69B]">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#F0ECE1] dark:bg-[#122318] text-amber-500 font-bold">
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-[#E0D9CB]/60 dark:border-[#1D3324]/60 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center gap-1.5 text-xs font-bold text-amber-500 hover:text-amber-600"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {t('عرض التفاصيل', 'View Details')}
                  </button>

                  <div className="flex items-center gap-1">
                    {job.status === 'published' ? (
                      <button
                        onClick={() => handleUpdateStatus(job, 'archived')}
                        title={t('أرشفة الشاغر', 'Archive')}
                        className="p-1.5 rounded-lg text-[#5C665E] hover:text-amber-500 hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(job, 'published')}
                        title={t('تنشيط ونشر', 'Publish')}
                        className="p-1.5 rounded-lg text-[#5C665E] hover:text-emerald-500 hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      title={t('حذف الشاغر', 'Delete')}
                      className="p-1.5 rounded-lg text-[#5C665E] hover:text-red-500 hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Job */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E0D9CB] dark:border-[#1D3324]">
              <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB] flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500" />
                {t('إضافة شاغر وظيفي جديد', 'Post New Job Requisition')}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('المسمى الوظيفي بالعربية *', 'Job Title (Arabic) *')}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مهندس مكتب فني أول (Senior Technical Office)"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('الشركة التابعة *', 'Company Entity *')}
                  </label>
                  <select
                    value={compSelect}
                    onChange={(e) => setCompSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  >
                    {selectedCompanies.map(c => (
                      <option key={c.id} value={c.id}>{c.nameAr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('الإدارة / القسم *', 'Department *')}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  >
                    <option value="الإدارة الهندسية">{t('الإدارة الهندسية', 'Engineering')}</option>
                    <option value="إدارة المشروعات">{t('إدارة المشروعات', 'Project Management')}</option>
                    <option value="الموارد البشرية والتوظيف">{t('الموارد البشرية والتوظيف', 'HR & Talent')}</option>
                    <option value="الشؤون المالية">{t('الشؤون المالية', 'Finance')}</option>
                    <option value="المكتب الفني">{t('المكتب الفني', 'Technical Office')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('العدد المطلوب *', 'Headcount *')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={headcount}
                    onChange={(e) => setHeadcount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('الحد الأدنى للراتب', 'Min Salary')}
                  </label>
                  <input
                    type="number"
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                    {t('الحد الأقصى للراتب', 'Max Salary')}
                  </label>
                  <input
                    type="number"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('المهارات المطلوبة (مفصولة بفاصلة)', 'Skills Required')}
                </label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="AutoCAD, Primavera, حصر كميات, Revit"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">
                  {t('الوصف الوظيفي والمسؤوليات', 'Job Description')}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للمهام والمسؤوليات المطلوبة..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#F8F6F0] dark:bg-[#122318] border border-[#E0D9CB] dark:border-[#1D3324] text-[#142319] dark:text-[#E8F3EB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0D9CB] dark:border-[#1D3324]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-sm"
                >
                  {t('نشر الشاغر فوراً', 'Publish Opening')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Job Details */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0D1C13] border border-[#E0D9CB] dark:border-[#1D3324] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E0D9CB] dark:border-[#1D3324]">
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-500">{selectedJob.code}</span>
                <h3 className="text-base font-bold text-[#142319] dark:text-[#E8F3EB]">{selectedJob.title}</h3>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-lg text-[#5C665E] hover:bg-[#F0ECE1] dark:hover:bg-[#122318]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5C665E] dark:text-[#97A69B]">{t('الشركة:', 'Company:')}</span>
                <span className="font-bold text-[#142319] dark:text-[#E8F3EB]">{selectedJob.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C665E] dark:text-[#97A69B]">{t('الإدارة:', 'Department:')}</span>
                <span className="font-bold text-[#142319] dark:text-[#E8F3EB]">{selectedJob.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C665E] dark:text-[#97A69B]">{t('المقر:', 'Location:')}</span>
                <span className="font-bold text-[#142319] dark:text-[#E8F3EB]">{selectedJob.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C665E] dark:text-[#97A69B]">{t('الميزانية:', 'Budget:')}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedJob.budgetMin.toLocaleString()} - {selectedJob.budgetMax.toLocaleString()} {selectedJob.currency}
                </span>
              </div>

              {selectedJob.description && (
                <div className="mt-3 p-3 rounded-xl bg-[#F8F6F0] dark:bg-[#122318]">
                  <div className="font-bold text-[#142319] dark:text-[#E8F3EB] mb-1">{t('الوصف:', 'Description:')}</div>
                  <p className="text-[#5C665E] dark:text-[#97A69B] leading-relaxed">{selectedJob.description}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#E0D9CB] dark:border-[#1D3324] flex justify-end">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600"
              >
                {t('إغلاق', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

