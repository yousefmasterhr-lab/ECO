import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Briefcase, 
  Kanban, 
  Users, 
  FileSignature, 
  Sparkles, 
  Building2, 
  UserCheck,
  Globe2
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { ATSAnalyticsTab } from './ATSAnalyticsTab';
import { ATSJobsTab } from './ATSJobsTab';
import { ATSPipelineTab } from './ATSPipelineTab';
import { ATSCandidatesTab } from './ATSCandidatesTab';
import { ATSOffersTab } from './ATSOffersTab';
import { ATSPortalTab } from './ATSPortalTab';

interface ATSModuleProps {
  activeSubItemId?: string | null;
}

export type ATSSubTab = 'ats_analytics' | 'ats_jobs' | 'ats_pipeline' | 'ats_candidates' | 'ats_offers' | 'ats_portal';

export const ATSModule: React.FC<ATSModuleProps> = ({ activeSubItemId }) => {
  const { t } = useLanguage();
  const { activeCompany, selectedCompanies, setActiveCompany } = useTenant();

  const [activeTab, setActiveTab] = useState<ATSSubTab>(() => {
    if (activeSubItemId && [
      'ats_analytics', 
      'ats_jobs', 
      'ats_openings', 
      'ats_pipeline', 
      'ats_candidates', 
      'ats_interviews', 
      'ats_offers',
      'ats_portal'
    ].includes(activeSubItemId)) {
      if (activeSubItemId === 'ats_openings') return 'ats_jobs';
      if (activeSubItemId === 'ats_interviews') return 'ats_pipeline';
      return activeSubItemId as ATSSubTab;
    }
    return 'ats_pipeline';
  });

  useEffect(() => {
    if (activeSubItemId) {
      if (activeSubItemId === 'ats_openings') {
        setActiveTab('ats_jobs');
      } else if (activeSubItemId === 'ats_interviews') {
        setActiveTab('ats_pipeline');
      } else if (['ats_analytics', 'ats_jobs', 'ats_pipeline', 'ats_candidates', 'ats_offers', 'ats_portal'].includes(activeSubItemId)) {
        setActiveTab(activeSubItemId as ATSSubTab);
      }
    }
  }, [activeSubItemId]);

  const tabs = [
    { id: 'ats_analytics' as const, labelAr: 'لوحة مؤشرات التوظيف', labelEn: 'Recruitment Analytics', icon: BarChart3 },
    { id: 'ats_jobs' as const, labelAr: 'إدارة الشواغر والوظائف', labelEn: 'Job Openings', icon: Briefcase },
    { id: 'ats_pipeline' as const, labelAr: 'مسار التوظيف والفرز التفاعلي', labelEn: 'Candidate Pipeline', icon: Kanban },
    { id: 'ats_candidates' as const, labelAr: 'المرشحين وتفريغ الاستمارات الورقية', labelEn: 'Talent Pool & Digitization', icon: Users },
    { id: 'ats_offers' as const, labelAr: 'عروض العمل وتعيين الموظف', labelEn: 'Offers & HR Sync', icon: FileSignature },
    { id: 'ats_portal' as const, labelAr: 'بوابة التوظيف وروابط UTM', labelEn: 'Careers Portal & UTM', icon: Globe2 },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Official Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-l from-[#F3EFE6] via-[#FBF9F5] to-[#FFFFFF] dark:from-[#121B14] dark:via-[#141E16] dark:to-[#0E1610] text-[#1A241C] dark:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628] shadow-sm dark:shadow-xl">
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#D99B26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-[#059669]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D99B26]/15 border border-[#D99B26]/30 text-[#1A241C] dark:text-[#EBB34D] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#D99B26]" />
              <span>{t('منظومة استقطاب الكفاءات وطلبات التوظيف الرسمية', 'Talent Acquisition & Tarabot Application Hub')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1A241C] dark:text-[#F3EFE6] flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-[#D99B26]" />
              {t('استقطاب الكفاءات وتفريغ طلبات التوظيف', 'Talent Acquisition & Executive Sourcing')}
            </h1>

            <p className="text-xs sm:text-sm text-[#5C665E] dark:text-[#8FA392] max-w-2xl leading-relaxed">
              {t(
                'استقبال استمارات شركة ترابط من رابط التوظيف العام، تفريغ الاستمارات الورقية والسير الذاتية المتراكمة بالشركة، والربط الفوري مع السجل العام للموظفين والتأمينات.',
                'End-to-end recruitment lifecycle, paper application digitization, and 1-click conversion to Core HR & Social Insurance.'
              )}
            </p>
          </div>

          {/* Company Multi-Tenant Context Pill */}
          <div className="p-4 rounded-2xl bg-[#FFFFFF]/80 dark:bg-[#141E16]/80 backdrop-blur-md border border-[#E0D9CB] dark:border-[#243628] flex flex-col sm:flex-row items-center gap-3 shadow-xs">
            <div className="flex items-center gap-2 text-xs text-[#5C665E] dark:text-[#8FA392]">
              <Building2 className="w-4 h-4 text-[#D99B26]" />
              <span className="font-semibold">{t('الشركة النشطة:', 'Active Entity:')}</span>
            </div>

            <select
              value={activeCompany?.id || 'all'}
              onChange={(e) => {
                const target = selectedCompanies.find(c => c.id === e.target.value);
                if (target) setActiveCompany(target);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FBF9F5] dark:bg-[#17231A] border border-[#E0D9CB] dark:border-[#243628] text-[#1A241C] dark:text-[#F3EFE6] focus:outline-none focus:ring-1 focus:ring-[#D99B26] cursor-pointer"
            >
              <option value="all">{t('كافة شركات المجموعة المعتمدة', 'All Group Companies')}</option>
              {selectedCompanies.map(c => (
                <option key={c.id} value={c.id}>{c.nameAr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 6-Way Sub-Tabs Switcher */}
        <div className="relative z-10 mt-8 pt-5 border-t border-[#E0D9CB] dark:border-[#243628] flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none cursor-pointer ${
                  isActive
                    ? 'bg-[#D99B26] text-[#1A241C] font-black shadow-md shadow-[#D99B26]/20 ring-1 ring-[#EBB34D]'
                    : 'bg-[#FFFFFF] dark:bg-[#17231A] text-[#5C665E] dark:text-[#8FA392] hover:text-[#1A241C] dark:hover:text-[#F3EFE6] border border-[#E0D9CB] dark:border-[#243628]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#1A241C]' : 'text-[#D99B26]'}`} />
                <span>{t(tab.labelAr, tab.labelEn)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Tab */}
      <div className="w-full">
        {activeTab === 'ats_analytics' && <ATSAnalyticsTab companyId={activeCompany?.id} />}
        {activeTab === 'ats_jobs' && <ATSJobsTab companyId={activeCompany?.id} />}
        {activeTab === 'ats_pipeline' && <ATSPipelineTab companyId={activeCompany?.id} />}
        {activeTab === 'ats_candidates' && <ATSCandidatesTab companyId={activeCompany?.id} />}
        {activeTab === 'ats_offers' && <ATSOffersTab companyId={activeCompany?.id} />}
        {activeTab === 'ats_portal' && <ATSPortalTab companyId={activeCompany?.id} />}
      </div>
    </div>
  );
};

