import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Briefcase, 
  Kanban, 
  Users, 
  FileSignature, 
  Sparkles, 
  Building2, 
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useTenant } from '../../../context/TenantContext';
import { ATSAnalyticsTab } from './ATSAnalyticsTab';
import { ATSJobsTab } from './ATSJobsTab';
import { ATSPipelineTab } from './ATSPipelineTab';
import { ATSCandidatesTab } from './ATSCandidatesTab';
import { ATSOffersTab } from './ATSOffersTab';

interface ATSModuleProps {
  activeSubItemId?: string | null;
}

export type ATSSubTab = 'ats_analytics' | 'ats_jobs' | 'ats_pipeline' | 'ats_candidates' | 'ats_offers';

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
      'ats_offers'
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
      } else if (['ats_analytics', 'ats_jobs', 'ats_pipeline', 'ats_candidates', 'ats_offers'].includes(activeSubItemId)) {
        setActiveTab(activeSubItemId as ATSSubTab);
      }
    }
  }, [activeSubItemId]);

  const tabs = [
    { id: 'ats_analytics' as const, labelAr: 'لوحة مؤشرات التوظيف', labelEn: 'Recruitment Analytics', icon: BarChart3 },
    { id: 'ats_jobs' as const, labelAr: 'إدارة الشواغر والوظائف', labelEn: 'Job Openings', icon: Briefcase },
    { id: 'ats_pipeline' as const, labelAr: 'مسار التوظيف والكانبان التفاعلي', labelEn: 'Candidate Pipeline', icon: Kanban },
    { id: 'ats_candidates' as const, labelAr: 'قاعدة بيانات المرشحين والمواهب', labelEn: 'Talent Pool', icon: Users },
    { id: 'ats_offers' as const, labelAr: 'عروض العمل وتعيين الموظف', labelEn: 'Offers & HR Sync', icon: FileSignature },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* 3D Cinematic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0F2618] via-[#142A1D] to-[#0A180F] border border-[#1D3324] text-white shadow-xl">
        {/* Ambient Decorative Lighting */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('منظومة استقطاب الكفاءات والذكاء الوظيفي (Enterprise ATS)', 'Talent Acquisition & AI Recruitment Engine')}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-amber-400" />
              {t('استقطاب الكفاءات والمواهب القيادية', 'Talent Acquisition & Executive Sourcing')}
            </h1>

            <p className="text-xs sm:text-sm text-[#97A69B] max-w-2xl leading-relaxed">
              {t(
                'إدارة دورة حياة التوظيف والفرز الذكي للمرشحين، توجيه عروض العمل الرقمية، والربط المباشر اللحظي مع منظومة الموارد البشرية والتأمينات بنقرة واحدة.',
                'End-to-end recruitment lifecycle, smart candidate pipeline, digital job offers, and 1-click seamless conversion to Core HR & Social Insurance.'
              )}
            </p>
          </div>

          {/* Company Multi-Tenant Context Pill */}
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-[#97A69B]">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>{t('الشركة النشطة:', 'Active Entity:')}</span>
            </div>

            <select
              value={activeCompany?.id || 'all'}
              onChange={(e) => {
                const target = selectedCompanies.find(c => c.id === e.target.value);
                if (target) setActiveCompany(target);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#17231A] border border-[#243628] text-[#E8F3EB] focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">{t('كافة شركات المجموعة المعتمدة', 'All Group Companies')}</option>
              {selectedCompanies.map(c => (
                <option key={c.id} value={c.id}>{c.nameAr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-Way Sub-Tabs Switcher */}
        <div className="relative z-10 mt-8 pt-5 border-t border-white/10 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-102 ring-1 ring-amber-400'
                    : 'bg-white/5 text-[#97A69B] hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-400/80'}`} />
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
      </div>
    </div>
  );
};

