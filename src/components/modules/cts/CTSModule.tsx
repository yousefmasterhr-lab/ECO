// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Central Master Module Component (CTSModule.tsx)
// ====================================================================

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  Inbox, 
  Send, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

import { Correspondence, CTSSummaryStats } from './types';
import { ctsStorage } from '../../../services/ctsStorage';

// Modals
import { DocumentDossierModal } from './DocumentDossierModal';
import { InboundEntryModal } from './InboundEntryModal';
import { OutboundDraftModal } from './OutboundDraftModal';
import { ReturnForRevisionModal } from './ReturnForRevisionModal';

// Tabs
import { CTSDashboardTab } from './CTSDashboardTab';
import { CTSCorrespondencesTab } from './CTSCorrespondencesTab';
import { CTSInboundTab } from './CTSInboundTab';
import { CTSOutboundTab } from './CTSOutboundTab';
import { CTSAuditTab } from './CTSAuditTab';

export type CTSTabKey = 
  | 'cts_overview'
  | 'cts_correspondences'
  | 'cts_inbound'
  | 'cts_outbound'
  | 'cts_audit';

interface CTSModuleProps {
  activeSubItemId?: string | null;
  onNavigateSubItem?: (subItemId: string) => void;
}

export const CTSModule: React.FC<CTSModuleProps> = ({ 
  activeSubItemId = 'cts_overview',
  onNavigateSubItem
}) => {
  const [currentTab, setCurrentTab] = useState<CTSTabKey>(
    (activeSubItemId as CTSTabKey) || 'cts_overview'
  );

  // Synchronize if prop changes from outside (e.g. Sidebar click)
  useEffect(() => {
    if (activeSubItemId && [
      'cts_overview',
      'cts_correspondences',
      'cts_inbound',
      'cts_outbound',
      'cts_audit'
    ].includes(activeSubItemId)) {
      setCurrentTab(activeSubItemId as CTSTabKey);
    }
  }, [activeSubItemId]);

  const handleTabChange = (tab: CTSTabKey) => {
    setCurrentTab(tab);
    if (onNavigateSubItem) {
      onNavigateSubItem(tab);
    }
  };

  // Telemetry stats
  const [stats, setStats] = useState<CTSSummaryStats>({
    totalLetters: 0,
    inboundCount: 0,
    outboundCount: 0,
    draftsCount: 0,
    replyRate: 100,
    activeProjectsCount: 0,
    total_correspondences: 0,
    total_inbound: 0,
    total_outbound: 0,
    total_drafts: 0,
    total_pending_approval: 0,
    total_approved: 0,
    total_replied: 0,
    total_overdue: 0,
    average_reply_time_days: 2.8,
  });

  const loadStats = async () => {
    const s = await ctsStorage.getStats();
    setStats(s);
  };

  useEffect(() => {
    loadStats();
    const handleUpdate = () => loadStats();
    window.addEventListener('eco-cts-updated', handleUpdate);
    return () => window.removeEventListener('eco-cts-updated', handleUpdate);
  }, []);

  // Central Modals State
  const [dossierDoc, setDossierDoc] = useState<Correspondence | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [inboundToEdit, setInboundToEdit] = useState<Correspondence | null>(null);

  const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
  const [outboundToEdit, setOutboundToEdit] = useState<Correspondence | null>(null);
  const [replyParentInboundId, setReplyParentInboundId] = useState<string | null>(null);

  const [returnDoc, setReturnDoc] = useState<Correspondence | null>(null);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  // Quick Approval Handler
  const handleQuickApprove = async (doc: Correspondence) => {
    if (window.confirm(`هل أنت متأكد من اعتماد الخطاب الصادر وتوليد الرقم الرسمي الذري للمسودة [${doc.serial_number}]؟`)) {
      await ctsStorage.quickApproveOutbound(doc.doc_id, { id: 'usr_pm', name: 'د. يوسف حجازي (مدير المشروع)' });
      loadStats();
    }
  };

  // Open reply modal pre-linked to an inbound doc
  const handleReplyToInbound = (inboundDoc: Correspondence) => {
    setOutboundToEdit(null);
    setReplyParentInboundId(inboundDoc.doc_id);
    setIsOutboundModalOpen(true);
  };

  const navTabs = [
    { id: 'cts_overview', label: 'لوحة المؤشرات والتحليلات', icon: <Layers className="w-4 h-4" /> },
    { id: 'cts_correspondences', label: 'سجل المراسلات العام', icon: <FileText className="w-4 h-4" /> },
    { id: 'cts_inbound', label: 'قيد واستلام الوارد', icon: <Inbox className="w-4 h-4" />, badge: stats.total_inbound },
    { id: 'cts_outbound', label: 'إعداد واعتماد الصادر', icon: <Send className="w-4 h-4" />, badge: stats.total_drafts > 0 ? `${stats.total_drafts} مسودة` : undefined },
    { id: 'cts_audit', label: 'سجل التدقيق والامتثال', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-16" dir="rtl">
      {/* Central Interactive Modals */}
      <DocumentDossierModal
        isOpen={isDossierOpen}
        onClose={() => {
          setIsDossierOpen(false);
          setDossierDoc(null);
        }}
        document={dossierDoc}
        onReply={(inb) => {
          setIsDossierOpen(false);
          handleReplyToInbound(inb);
        }}
        onEdit={(doc) => {
          setIsDossierOpen(false);
          if (doc.doc_type === 'Incoming') {
            setInboundToEdit(doc);
            setIsInboundModalOpen(true);
          } else {
            setOutboundToEdit(doc);
            setIsOutboundModalOpen(true);
          }
        }}
        onReturnForRevision={(retDoc) => {
          setIsDossierOpen(false);
          setReturnDoc(retDoc);
          setIsReturnModalOpen(true);
        }}
      />

      <InboundEntryModal
        isOpen={isInboundModalOpen}
        onClose={() => {
          setIsInboundModalOpen(false);
          setInboundToEdit(null);
        }}
        onSaved={loadStats}
        existingDoc={inboundToEdit}
      />

      <OutboundDraftModal
        isOpen={isOutboundModalOpen}
        onClose={() => {
          setIsOutboundModalOpen(false);
          setOutboundToEdit(null);
          setReplyParentInboundId(null);
        }}
        onSaved={loadStats}
        existingDraft={outboundToEdit}
        parentInboundId={replyParentInboundId}
      />

      <ReturnForRevisionModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setReturnDoc(null);
        }}
        document={returnDoc}
        onReturned={loadStats}
      />

      {/* 3D Cinematic Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C291E] via-[#0E1A11] to-[#0A120D] text-white p-6 sm:p-8 shadow-2xl border border-amber-500/20">
        {/* Amber glow effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PCMS / CTS v2.6 Enterprise</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-stone-200 border border-white/10 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>مشروع [1233] إنشاء وتجهيز مبنى الحراص</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>مزامن مع Cloudflare D1</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>منظومة إدارة المراسلات والمشاريع الهندسية</span>
              <span className="text-amber-400 text-lg sm:text-xl font-bold font-mono">(CTS / PCMS)</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
              إدارة احترافية لدورة حياة المكاتبات، الترقيم التسلسلي الذري المحمي، شجرة تتبع الردود (Threading)، ومكافحة تكرار المعاملات مع التوثيق بالباركود QR.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-row md:flex-col items-stretch gap-3 shrink-0">
            <button
              onClick={() => {
                setInboundToEdit(null);
                setIsInboundModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 font-bold text-xs backdrop-blur-md transition shadow-lg"
            >
              <Inbox className="w-4 h-4 text-sky-400" />
              <span>قيد وارد جديد (Intake)</span>
            </button>

            <button
              onClick={() => {
                setOutboundToEdit(null);
                setReplyParentInboundId(null);
                setIsOutboundModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-bold text-xs shadow-xl shadow-amber-500/25 transition"
            >
              <Send className="w-4 h-4" />
              <span>تحرير صادر جديد</span>
            </button>
          </div>
        </div>

        {/* Hero Telemetry Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-stone-400 block">إجمالي المعاملات</span>
            <span className="text-lg sm:text-xl font-bold text-white font-mono">{stats.total_correspondences}</span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block">الوارد المعتمد</span>
            <span className="text-lg sm:text-xl font-bold text-sky-300 font-mono">{stats.total_inbound}</span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block">الصادر الموثق</span>
            <span className="text-lg sm:text-xl font-bold text-amber-300 font-mono">{stats.total_outbound}</span>
          </div>
          <div>
            <span className="text-[11px] text-stone-400 block">مسودات تحت الاعتماد</span>
            <span className="text-lg sm:text-xl font-bold text-emerald-300 font-mono">{stats.total_drafts}</span>
          </div>
        </div>
      </div>

      {/* 6-Way Tab Switcher Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-x-auto text-xs">
        {navTabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as CTSTabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/25'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-white/60 dark:hover:bg-stone-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-stone-950 text-amber-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Workspace */}
      <div className="w-full">
        {currentTab === 'cts_overview' && (
          <CTSDashboardTab
            onNavigateTab={(tab) => handleTabChange(tab as CTSTabKey)}
            onOpenInbound={() => {
              setInboundToEdit(null);
              setIsInboundModalOpen(true);
            }}
            onOpenOutbound={() => {
              setOutboundToEdit(null);
              setReplyParentInboundId(null);
              setIsOutboundModalOpen(true);
            }}
            onSelectDoc={(doc) => {
              setDossierDoc(doc);
              setIsDossierOpen(true);
            }}
          />
        )}


        {currentTab === 'cts_correspondences' && (
          <CTSCorrespondencesTab
            onOpenDossier={(doc) => {
              setDossierDoc(doc);
              setIsDossierOpen(true);
            }}
            onReplyToInbound={handleReplyToInbound}
            onOpenInboundModal={() => {
              setInboundToEdit(null);
              setIsInboundModalOpen(true);
            }}
            onOpenOutboundModal={() => {
              setOutboundToEdit(null);
              setReplyParentInboundId(null);
              setIsOutboundModalOpen(true);
            }}
          />
        )}

        {currentTab === 'cts_inbound' && (
          <CTSInboundTab
            onOpenIntakeModal={() => {
              setInboundToEdit(null);
              setIsInboundModalOpen(true);
            }}
            onOpenDossier={(doc) => {
              setDossierDoc(doc);
              setIsDossierOpen(true);
            }}
            onReplyToInbound={handleReplyToInbound}
            onEditInbound={(doc) => {
              setInboundToEdit(doc);
              setIsInboundModalOpen(true);
            }}
          />
        )}

        {currentTab === 'cts_outbound' && (
          <CTSOutboundTab
            onOpenDraftModal={() => {
              setOutboundToEdit(null);
              setReplyParentInboundId(null);
              setIsOutboundModalOpen(true);
            }}
            onOpenDossier={(doc) => {
              setDossierDoc(doc);
              setIsDossierOpen(true);
            }}
            onQuickApprove={handleQuickApprove}
            onEditOutbound={(doc) => {
              setOutboundToEdit(doc);
              setIsOutboundModalOpen(true);
            }}
            onReturnOutbound={(doc) => {
              setReturnDoc(doc);
              setIsReturnModalOpen(true);
            }}
          />
        )}

        {currentTab === 'cts_audit' && <CTSAuditTab />}
      </div>
    </div>
  );
};
