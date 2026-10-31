// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Outbound Drafting & Atomic Numbering Approval Ceremony
// ====================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DocType, Priority, Attachment, Correspondence, Project, Entity } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { 
  UploadCloud, 
  FileText, 
  Trash2,
  Calendar,
  AlertTriangle,
  Link2,
  CheckCircle2,
  Stamp,
  FileEdit,
  X,
  Building2,
  ShieldCheck,
  Send
} from 'lucide-react';

interface OutboundDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingDraft?: Correspondence | null;
  parentInboundId?: string | null;
}

const STANDARD_ENTITIES = [
  'CON (مركز استشارات العفيفي الهندسي)',
  'CTR (شركة المقاول العام للإنشاءات)',
  'وزارة الداخلية - قطاع المشروعات (المالك)',
  'CTR (شركة النيل العامة للإنشاء والرصف)',
  'استشاري ضبط الجودة والمواد'
];

export const OutboundDraftModal: React.FC<OutboundDraftModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingDraft,
  parentInboundId
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [allInbounds, setAllInbounds] = useState<Correspondence[]>([]);

  const [projectRef, setProjectRef] = useState<string>('PRJ-1233');
  const [classification, setClassification] = useState<DocType>('LTR');
  const [parentDocId, setParentDocId] = useState<string>('');
  const [senderEntity, setSenderEntity] = useState('CON (مركز استشارات العفيفي الهندسي)');
  const [receiverEntity, setReceiverEntity] = useState('CTR (شركة المقاول العام للإنشاءات)');
  const [originatorCode, setOriginatorCode] = useState('CON');
  const [recipientCode, setRecipientCode] = useState('CTR');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [priority, setPriority] = useState<Priority>('Urgent');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Official Approval Stamping Ceremony State
  const [isStampingCeremony, setIsStampingCeremony] = useState(false);
  const [approvedSerial, setApprovedSerial] = useState<string | null>(null);

  // Load supporting projects, entities, inbounds
  useEffect(() => {
    if (isOpen) {
      ctsStorage.getProjects().then(p => {
        setProjects(p);
        if (p.length > 0 && !projectRef) {
          setProjectRef(p[0].project_id);
        }
      });
      ctsStorage.getEntities().then(setEntities);
      ctsStorage.getCorrespondences({ docType: 'Incoming' }).then(setAllInbounds);
    }
  }, [isOpen]);

  const registeredEntityOptions = useMemo(() => {
    const fromDb = entities.map(e => `${e.code} (${e.name})`);
    return Array.from(new Set([...fromDb, ...STANDARD_ENTITIES]));
  }, [entities]);

  // Sync draft or parent inbound on open
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (existingDraft) {
        setProjectRef(existingDraft.project_ref || 'PRJ-1233');
        setClassification(existingDraft.classification || 'LTR');
        setParentDocId(existingDraft.parent_doc_id || '');
        setSenderEntity(existingDraft.sender_entity || 'CON (مركز استشارات العفيفي الهندسي)');
        setReceiverEntity(existingDraft.receiver_entity || 'CTR (شركة المقاول العام للإنشاءات)');
        setOriginatorCode(existingDraft.originator_code || 'CON');
        setRecipientCode(existingDraft.recipient_code || 'CTR');
        setSubject(existingDraft.subject || '');
        setBodyText(existingDraft.body_text || '');
        setPriority(existingDraft.priority || 'Urgent');
        setIssueDate(existingDraft.issue_date || new Date().toISOString().split('T')[0]);
        setAttachments(existingDraft.attachments || []);
      } else if (parentInboundId) {
        setParentDocId(parentInboundId);
        ctsStorage.getCorrespondenceById(parentInboundId).then(parentDoc => {
          if (parentDoc) {
            setProjectRef(parentDoc.project_ref);
            setSenderEntity('CON (مركز استشارات العفيفي الهندسي)');
            setReceiverEntity(parentDoc.sender_entity);
            setClassification(parentDoc.classification || 'LTR');
            setPriority(parentDoc.priority || 'Urgent');
            setSubject(`الرد على: ${parentDoc.subject}`);
            setBodyText('');
            setAttachments([]);
          }
        });
      } else {
        setParentDocId('');
        setClassification('LTR');
        setPriority('Urgent');
        setSubject('');
        setBodyText('');
        setAttachments([]);
        setSenderEntity('CON (مركز استشارات العفيفي الهندسي)');
        setReceiverEntity('CTR (شركة المقاول العام للإنشاءات)');
        setOriginatorCode('CON');
        setRecipientCode('CTR');
      }
      setIsStampingCeremony(false);
      setApprovedSerial(null);
    }
  }, [isOpen, parentInboundId, existingDraft]);

  const handleParentDocChange = (newParentId: string) => {
    setParentDocId(newParentId);
    if (newParentId) {
      const selectedParent = allInbounds.find(d => d.doc_id === newParentId);
      if (selectedParent) {
        setProjectRef(selectedParent.project_ref);
        setReceiverEntity(selectedParent.sender_entity);
        if (!subject.trim() || subject.startsWith('الرد على:')) {
          setSubject(`الرد على: ${selectedParent.subject}`);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setTimeout(() => {
      const newAtt: Attachment = {
        file_id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        doc_ref: existingDraft?.doc_id || 'pending-outbound',
        file_name: file.name,
        file_size_mb: parseFloat((file.size / (1024 * 1024)).toFixed(2)) || 0.1,
        storage_direct_url: `/simulated-storage/${file.name}`,
        file_category: 'Outbound Technical Submittal',
        upload_timestamp: new Date().toISOString()
      };
      setAttachments(prev => [...prev, newAtt]);
      setIsUploading(false);
    }, 400);
  };

  const removeAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(a => a.file_id !== fileId));
  };

  // Save Draft (DRAFT-XXXX)
  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      setErrorMsg('يرجى كتابة موضوع الخطاب');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const project = projects.find(p => p.project_id === projectRef);
      const parentDoc = parentDocId ? allInbounds.find(d => d.doc_id === parentDocId) : null;

      const draftToSave: Correspondence = {
        doc_id: existingDraft?.doc_id || `out_${Date.now()}`,
        serial_number: existingDraft?.serial_number || `DRAFT-${Math.floor(1000 + Math.random() * 9000)}`,
        doc_type: 'Outgoing',
        classification,
        project_ref: projectRef,
        project_name: project?.project_name,
        subject: subject.trim(),
        body_text: bodyText.trim(),
        sender_entity: senderEntity.trim(),
        receiver_entity: receiverEntity.trim(),
        originator_code: originatorCode.trim().toUpperCase(),
        recipient_code: recipientCode.trim().toUpperCase(),
        priority,
        issue_date: issueDate,
        status: existingDraft?.status === 'Rejected' ? 'Draft' : (existingDraft?.status || 'Draft'),
        is_draft: true,
        parent_doc_id: parentDocId || null,
        parent_serial: parentDoc?.serial_number || existingDraft?.parent_serial || null,
        created_by_user_id: 'usr_author',
        created_by_name: 'مهندس السجلات والتوثيق',
        attachments,
      };

      await ctsStorage.saveCorrespondence(draftToSave, { id: 'usr_author', name: 'مهندس السجلات والتوثيق' });
      setIsSubmitting(false);
      onSaved();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ المسودة');
    }
  };

  // Official Approval Ceremony & Atomic Serial Generation
  const handleApproveAndIssue = async () => {
    if (!subject.trim()) {
      setErrorMsg('يرجى كتابة موضوع الخطاب قبل الاعتماد');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const project = projects.find(p => p.project_id === projectRef);
      const parentDoc = parentDocId ? allInbounds.find(d => d.doc_id === parentDocId) : null;
      const cleanProjectCode = projectRef.replace(/^PRJ-/, '');

      // Reserve atomic serial
      const serialRes = await ctsStorage.reserveAtomicOfficialSerial({
        project_code: cleanProjectCode,
        originator_code: originatorCode.trim().toUpperCase() || 'CON',
        recipient_code: recipientCode.trim().toUpperCase() || 'CTR',
        doc_type: classification,
      });

      const approvedDoc: Correspondence = {
        doc_id: existingDraft?.doc_id || `out_${Date.now()}`,
        serial_number: serialRes.serial_number,
        doc_type: 'Outgoing',
        classification,
        project_ref: projectRef,
        project_name: project?.project_name,
        subject: subject.trim(),
        body_text: bodyText.trim(),
        sender_entity: senderEntity.trim(),
        receiver_entity: receiverEntity.trim(),
        originator_code: originatorCode.trim().toUpperCase(),
        recipient_code: recipientCode.trim().toUpperCase(),
        priority,
        issue_date: issueDate,
        status: 'Approved',
        is_draft: false,
        parent_doc_id: parentDocId || null,
        parent_serial: parentDoc?.serial_number || existingDraft?.parent_serial || null,
        created_by_user_id: existingDraft?.created_by_user_id || 'usr_author',
        created_by_name: existingDraft?.created_by_name || 'مهندس السجلات والتوثيق',
        approved_by_user_id: 'usr_pm',
        approved_by_name: 'د. يوسف حجازي (مدير المشروع)',
        approval_date: new Date().toISOString(),
        attachments,
      };

      await ctsStorage.saveCorrespondence(approvedDoc, { id: 'usr_pm', name: 'د. يوسف حجازي (مدير المشروع)' });

      // If reply to inbound, mark parent as Replied
      if (parentDocId) {
        const parent = allInbounds.find(d => d.doc_id === parentDocId);
        if (parent) {
          parent.status = 'Replied';
          await ctsStorage.saveCorrespondence(parent);
        }
      }

      setApprovedSerial(serialRes.serial_number);
      setIsStampingCeremony(true);

      setTimeout(() => {
        setIsStampingCeremony(false);
        setIsSubmitting(false);
        onSaved();
        onClose();
      }, 3500);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'فشل اعتماد الخطاب وتوليد الرقم التسلسلي');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl my-auto rounded-3xl bg-[#FFFDF9] dark:bg-[#0D1F17] border border-amber-200/60 dark:border-amber-500/30 shadow-2xl p-6 text-slate-900 dark:text-stone-100 overflow-hidden"
        dir="rtl"
      >
        {/* Official Approval Stamping Ceremony Overlay Animation */}
        <AnimatePresence>
          {isStampingCeremony && approvedSerial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-[#0E1A11]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none"
            >
              <motion.div
                initial={{ scale: 2, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: -2, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 rounded-3xl border-2 border-amber-400 bg-amber-950/40 shadow-2xl shadow-amber-500/30 flex flex-col items-center gap-4 relative max-w-md w-full"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold tracking-wide text-sm">
                  <Stamp className="w-6 h-6 animate-pulse" />
                  <span>مراسم اعتماد وتوثيق الخطاب الصادر</span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-amber-300 tracking-wider bg-black/60 px-6 py-3 rounded-2xl border border-amber-500/30 shadow-inner font-mono">
                  {approvedSerial}
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>تم إصدار الرقم التسلسلي المعتمد وتحديث سجل المعاملات</span>
                </div>

                <div className="text-xs text-amber-200/80">
                  المعتمد: د. يوسف حجازي (مدير المشروع) • {new Date().toLocaleDateString('ar-EG')}
                </div>
              </motion.div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsStampingCeremony(false);
                    setIsSubmitting(false);
                    onSaved();
                    onClose();
                  }}
                  className="px-4 py-2 text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold transition shadow-lg"
                >
                  إغلاق والانتقال للمراسلات
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>إعداد وتوجيه خطاب صادر</span>
                {existingDraft && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-stone-100 dark:bg-stone-800 text-amber-600 dark:text-amber-400">
                    {existingDraft.serial_number}
                  </span>
                )}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                تحرير مسودة مكاتبة جديدة، ربطها بوارد سابق، أو اعتمادها وإصدار رقمها الرسمي فوراً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveDraft} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto px-1">
          {/* Review Remarks Banner (if rejected previously) */}
          {existingDraft?.review_remarks && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  ملاحظات المراجعة والتصحيح المطلوبة من ({existingDraft.returned_by_name || 'المدير المسؤول'}):
                </p>
                <p className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-rose-500/20 text-stone-800 dark:text-stone-200 leading-relaxed">
                  {existingDraft.review_remarks}
                </p>
              </div>
            </div>
          )}

          {/* Project & Parent Document Cross-Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" />
                <span>المشروع الهندسي: *</span>
              </label>
              <select
                value={projectRef}
                onChange={(e) => setProjectRef(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition"
              >
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>
                    [{p.project_code}] {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>مرتبط بوارد سابق (رد على خطاب):</span>
                </span>
                <span className="text-[10px] text-stone-400">اختياري</span>
              </label>
              <select
                value={parentDocId}
                onChange={(e) => handleParentDocChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-amber-500/40 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition"
              >
                <option value="">-- خطاب صادر جديد مستقل (بدون وارد سابق) --</option>
                {allInbounds.map(inb => (
                  <option key={inb.doc_id} value={inb.doc_id}>
                    [{inb.serial_number}] {inb.subject.substring(0, 45)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Classification & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                التصنيف الهندسي (Doc Type): *
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value as DocType)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition font-semibold"
              >
                <option value="LTR">LTR - خطاب رسمي (Official Letter)</option>
                <option value="SUB">SUB - تقديم واعتماد فني (Submittal)</option>
                <option value="IPC">IPC - مستخلص مالي جاري (Payment Certificate)</option>
                <option value="MOM">MOM - محضر اجتماع تنسيقي (Minutes of Meeting)</option>
                <option value="RFI">RFI - طلب معلومات واستيضاح (Request For Info)</option>
                <option value="NCR">NCR - إشعار عدم مطابقة هندسية (Non-Conformance)</option>
                <option value="TRANS">TRANS - مذكرة إرسال / تسليم (Transmittal)</option>
                <option value="VAR">VAR - أمر تغيير / مطالبة (Variation / Claim)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                مستوى الأولوية والأهمية:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition"
              >
                <option value="Normal">عادي (Normal - 7 أيام)</option>
                <option value="Urgent">عاجل (Urgent - 3 أيام)</option>
                <option value="Critical">حرج جداً (Critical - 24 ساعة)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>تاريخ التحرير والإصدار:</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition font-mono"
              />
            </div>
          </div>

          {/* Sender & Recipient Entities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                الجهة الصادر منها (الراسلة): *
              </label>
              <input
                type="text"
                list="registered-entities"
                value={senderEntity}
                onChange={(e) => {
                  setSenderEntity(e.target.value);
                  const matched = e.target.value.match(/^([A-Z0-9]+)/);
                  if (matched) setOriginatorCode(matched[1]);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                الجهة الموجه إليها الخطاب (المستلمة): *
              </label>
              <input
                type="text"
                list="registered-entities"
                value={receiverEntity}
                onChange={(e) => {
                  setReceiverEntity(e.target.value);
                  const matched = e.target.value.match(/^([A-Z0-9]+)/);
                  if (matched) setRecipientCode(matched[1]);
                }}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition"
              />
            </div>
          </div>

          <datalist id="registered-entities">
            {registeredEntityOptions.map((opt, idx) => (
              <option key={idx} value={opt} />
            ))}
          </datalist>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              موضوع الخطاب والبيان: *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثال: اعتماد عينات حديد التسليح لمشروع إنشاء مبنى الحراص ومطابقتها للمواصفات..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none transition font-medium"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center justify-between">
              <span>نص المكاتبة أو الملاحظات الفنية:</span>
              <span className="text-[10px] text-stone-400">اختياري</span>
            </label>
            <textarea
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="اكتب هنا الملخص التنفيذي، أو بنود المكاتبة الرسمية، أو متطلبات الفحص..."
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none resize-none leading-relaxed transition"
            />
          </div>

          {/* Attachments Section */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-amber-500" />
                <span>المرفقات والوثائق الفنية الملحقة:</span>
              </span>
              <span className="text-[11px] text-stone-500">{attachments.length} مرفقات محملة</span>
            </label>

            {/* Upload Drag/Select Box */}
            <div className="relative border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl p-4 text-center cursor-pointer transition bg-stone-50/50 dark:bg-stone-900/40">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center gap-1 text-xs text-stone-600 dark:text-stone-400">
                <UploadCloud className="w-6 h-6 text-amber-500" />
                <span className="font-semibold text-stone-800 dark:text-stone-200">
                  {isUploading ? 'جارٍ رفع الوثيقة...' : 'انقر أو اسحب المستندات هنا (PDF, DWG, XLSX, Images)'}
                </span>
                <span className="text-[10px] text-stone-400">الحد الأقصى للمرفق 25 ميجابايت</span>
              </div>
            </div>

            {/* Attachments List */}
            {attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((att) => (
                  <div
                    key={att.file_id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="font-medium text-stone-800 dark:text-stone-200 truncate">{att.file_name}</span>
                      <span className="text-[10px] text-stone-400">({att.file_size_mb} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.file_id)}
                      className="p-1 rounded text-stone-400 hover:text-rose-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Ceremony Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>الاعتماد الرسمي يولد رقماً تسلسلياً فريداً ومقفلاً فورياً</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition"
              >
                <FileEdit className="w-3.5 h-3.5 text-amber-500" />
                <span>حفظ كمسودة</span>
              </button>

              <button
                type="button"
                onClick={handleApproveAndIssue}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
              >
                <Stamp className="w-4 h-4" />
                <span>{isSubmitting ? 'جارٍ الاعتماد والتوليد...' : 'اعتماد فوري وإصدار الرقم'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
