import React, { useState, useEffect } from 'react';
import { Correspondence, DocType, Priority, Attachment, Project } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { useAuth } from '../../../context/AuthContext';
import {
  X,
  Inbox,
  UploadCloud,
  FileText,
  AlertTriangle,
  Trash2,
  Send
} from 'lucide-react';

interface InboundEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingDoc?: Correspondence | null;
  parentOutboundDoc?: Correspondence | null;
}

const STANDARD_ENTITIES = [
  'CTR (شركة المقاول العام)',
  'CON (مركز استشارات العفيفي الهندسي)',
  'وزارة الداخلية - قطاع المشروعات (المالك)',
  'CTR (شركة النيل العامة للإنشاء والرصف)',
  'استشاري ضبط الجودة والمواد'
];

export const InboundEntryModal: React.FC<InboundEntryModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingDoc,
  parentOutboundDoc
}) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [entitiesList, setEntitiesList] = useState<string[]>(STANDARD_ENTITIES);
  const [allCorrespondences, setAllCorrespondences] = useState<Correspondence[]>([]);

  // Form Fields
  const [projectRef, setProjectRef] = useState<string>('PRJ-1233');
  const [classification, setClassification] = useState<DocType>('LTR');
  const [externalRefNo, setExternalRefNo] = useState('');
  const [senderEntity, setSenderEntity] = useState('');
  const [receiverEntity, setReceiverEntity] = useState('CON (مركز استشارات العفيفي الهندسي)');
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [priority, setPriority] = useState<Priority>('Normal');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      ctsStorage.getProjects().then(prjs => {
        setProjects(prjs);
        if (prjs.length > 0 && !existingDoc && !parentOutboundDoc) {
          setProjectRef(prjs[0].project_id);
        }
      });
      ctsStorage.getEntities().then(ents => {
        const formatted = ents.map(e => `${e.code} (${e.name})`);
        setEntitiesList(Array.from(new Set([...formatted, ...STANDARD_ENTITIES])));
      });
      ctsStorage.getCorrespondences().then(setAllCorrespondences);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (existingDoc) {
        setProjectRef(existingDoc.project_ref || 'PRJ-1233');
        setClassification(existingDoc.classification || 'LTR');
        setExternalRefNo(existingDoc.external_ref_no || '');
        setSenderEntity(existingDoc.sender_entity || '');
        setReceiverEntity(existingDoc.receiver_entity || 'CON (مركز استشارات العفيفي الهندسي)');
        setSubject(existingDoc.subject || '');
        setBodyText(existingDoc.body_text || '');
        setPriority(existingDoc.priority || 'Normal');
        setIssueDate(existingDoc.issue_date || new Date().toISOString().split('T')[0]);
        setDueDate(existingDoc.due_date ? existingDoc.due_date.split('T')[0] : '');
        setAttachments(existingDoc.attachments || []);
      } else if (parentOutboundDoc) {
        setProjectRef(parentOutboundDoc.project_ref || 'PRJ-1233');
        setClassification(parentOutboundDoc.classification || 'LTR');
        setExternalRefNo('');
        setSenderEntity(parentOutboundDoc.receiver_entity || 'CTR (شركة المقاول العام)');
        setReceiverEntity(parentOutboundDoc.sender_entity || 'CON (مركز استشارات العفيفي الهندسي)');
        setSubject(`رداً على الخطاب الصادر رقم ${parentOutboundDoc.serial_number}: ${parentOutboundDoc.subject}`);
        setBodyText('');
        setPriority('Normal');
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setAttachments([]);
      } else {
        setExternalRefNo('');
        setSenderEntity('');
        setSubject('');
        setBodyText('');
        setPriority('Normal');
        setIssueDate(new Date().toISOString().split('T')[0]);
        setDueDate('');
        setAttachments([]);
      }
    }
  }, [isOpen, existingDoc, parentOutboundDoc]);

  // Anti-Duplicate live check
  useEffect(() => {
    if (!externalRefNo.trim() || !senderEntity.trim()) {
      setDuplicateWarning(null);
      return;
    }
    const cleanRef = externalRefNo.trim().toLowerCase();
    const cleanSender = senderEntity.trim().toLowerCase();

    const matched = allCorrespondences.find(c => {
      if (existingDoc && c.doc_id === existingDoc.doc_id) return false;
      return (
        c.doc_type === 'Incoming' &&
        c.project_ref === projectRef &&
        c.external_ref_no?.trim().toLowerCase() === cleanRef &&
        c.sender_entity.trim().toLowerCase() === cleanSender
      );
    });

    if (matched) {
      setDuplicateWarning(
        `تنبيه: يوجد خطاب وارد مسجل مسبقاً بنفس الرقم الإشاري (${matched.external_ref_no}) والجهة الراسلة برقم تسلسلي: ${matched.serial_number}`
      );
    } else {
      setDuplicateWarning(null);
    }
  }, [externalRefNo, senderEntity, projectRef, allCorrespondences, existingDoc]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);

    const files = Array.from(e.target.files);
    const newAttachments: Attachment[] = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newAttachments.push({
          file_id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          doc_ref: existingDoc?.doc_id || 'new_inbound',
          file_name: file.name,
          file_size_mb: Number((file.size / (1024 * 1024)).toFixed(2)),
          storage_direct_url: reader.result as string,
          file_category: 'Scan Document',
          upload_timestamp: new Date().toISOString(),
          mime_type: file.type || 'application/pdf',
        });

        if (newAttachments.length === files.length) {
          setAttachments(prev => [...prev, ...newAttachments]);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveAttachment = (fileId: string) => {
    setAttachments(prev => prev.filter(a => a.file_id !== fileId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !senderEntity.trim()) return;

    setIsSubmitting(true);
    try {
      const selectedProject = projects.find(p => p.project_id === projectRef);
      const prjCode = selectedProject ? selectedProject.project_code : '1233';

      // Generate inbound serial if new
      let serialNumber = existingDoc?.serial_number;
      if (!serialNumber) {
        const rand = Math.floor(1000 + Math.random() * 9000);
        serialNumber = `${prjCode}-IN-${classification}-26-${rand}`;
      }

      const docPayload: Correspondence = {
        doc_id: existingDoc?.doc_id || `corr_in_${Date.now()}`,
        doc_type: 'Incoming',
        classification,
        serial_number: serialNumber,
        is_draft: false,
        external_ref_no: externalRefNo.trim() || undefined,
        project_ref: projectRef,
        project_name: selectedProject ? selectedProject.project_name : 'مشروع هندسي',
        subject: subject.trim(),
        body_text: bodyText.trim() || undefined,
        sender_entity: senderEntity.trim(),
        receiver_entity: receiverEntity.trim(),
        originator_code: 'CTR',
        recipient_code: 'CON',
        priority,
        issue_date: issueDate,
        received_date: new Date().toISOString(),
        due_date: dueDate || undefined,
        status: existingDoc?.status || 'Pending',
        parent_doc_id: parentOutboundDoc?.doc_id || existingDoc?.parent_doc_id || null,
        parent_serial: parentOutboundDoc?.serial_number || existingDoc?.parent_serial || null,
        created_by_user_id: user?.id || 'usr_dc',
        created_by_name: user?.nameAr || 'مراقب المستندات',
        attachments,
        created_at: existingDoc?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await ctsStorage.saveCorrespondence(docPayload, {
        id: user?.id || 'usr_dc',
        name: user?.nameAr || 'مراقب المستندات',
      });

      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save inbound letter', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FFFDF9] dark:bg-[#0B1120] border border-amber-200/70 dark:border-stone-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-amber-200/50 dark:border-stone-800 flex items-center justify-between gap-4 bg-gradient-to-r from-sky-500/10 via-transparent to-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {existingDoc ? 'تعديل بيانات الخطاب الوارد' : 'قيد وتسجيل خطاب وارد جديد (Inbound Intake)'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-stone-400">
                إثبات وصول المعاملة وتوليد الرقم الإشاري وحفظ المرفقات الممسوحة ضوئياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Duplicate Alert if triggered */}
          {duplicateWarning && (
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Project & Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                المشروع الهندسي المعني *
              </label>
              <select
                value={projectRef}
                onChange={e => setProjectRef(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {projects.map(p => (
                  <option key={p.project_id} value={p.project_id}>
                    [{p.project_code}] {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                تصنيف المعاملة (Classification) *
              </label>
              <select
                value={classification}
                onChange={e => setClassification(e.target.value as DocType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="LTR">خطاب رسمي (LTR)</option>
                <option value="SUB">اعتماد فني / مواد (SUB)</option>
                <option value="RFI">استفسار فني (RFI)</option>
                <option value="IPC">مستخلص جاري (IPC)</option>
                <option value="MOM">محضر اجتماع (MOM)</option>
                <option value="TRANS">مذكرة إرسال (TRANS)</option>
                <option value="SITE">ملاحظة موقعية (SITE)</option>
              </select>
            </div>
          </div>

          {/* External Ref No & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                رقم خطاب الجهة الراسلة (External Ref No) *
              </label>
              <input
                type="text"
                required
                value={externalRefNo}
                onChange={e => setExternalRefNo(e.target.value)}
                placeholder="مثال: CTR/MOI/26/088"
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                درجة الأسبقية والأولوية
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as Priority)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="Normal">عادي (Normal)</option>
                <option value="Urgent">عاجل (Urgent)</option>
                <option value="Immediate">عاجل فوراً (Immediate)</option>
              </select>
            </div>
          </div>

          {/* Sender & Receiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                الجهة الراسلة (Sender Entity) *
              </label>
              <input
                type="text"
                required
                list="sender-entities"
                value={senderEntity}
                onChange={e => setSenderEntity(e.target.value)}
                placeholder="اختر أو اكتب اسم الجهة..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <datalist id="sender-entities">
                {entitiesList.map((ent, idx) => (
                  <option key={idx} value={ent} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                الجهة المستلمة (Recipient Entity) *
              </label>
              <input
                type="text"
                required
                value={receiverEntity}
                onChange={e => setReceiverEntity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Issue Date & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                تاريخ إصدار الخطاب *
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
                المهلة التعاقدية للرد (SLA Due Date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
              موضوع الخطاب والمعاملة *
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="مثال: طلب اعتماد التعديلات الإنشائية لأساسات السور الأمني..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-stone-300 mb-1.5">
              نص الخطاب أو ملخص التعليمات الفنية
            </label>
            <textarea
              rows={3}
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
              placeholder="اكتب ملخصاً لنص الخطاب ومطالبات الجهة الراسلة..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-200/70 dark:border-stone-800 bg-white dark:bg-[#121F16] text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
          </div>

          {/* Scanned Attachments Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-stone-300">
              تحميل المرفقات وصور الخطابات الممسوحة ضوئياً (PDF, Images)
            </label>

            <label className="flex items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-amber-200/80 dark:border-stone-700 hover:border-amber-500 bg-amber-500/5 cursor-pointer transition-colors">
              <UploadCloud className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-stone-300">
                {isUploading ? 'جاري قراءة الملف وتجهيز المعاينة...' : 'انقر لاختيار ملفات الخطاب الممسوحة ضوئياً أو اسحبها هنا'}
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {attachments.map((att, idx) => (
                  <div
                    key={att.file_id || idx}
                    className="p-3 rounded-xl border border-amber-200/60 dark:border-stone-700 bg-white dark:bg-[#121F16] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-stone-200 truncate">
                          {att.file_name}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {att.file_size_mb} MB
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.file_id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="حذف المرفق"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-amber-200/40 dark:border-stone-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-amber-200/60 dark:border-stone-700 text-xs font-bold text-slate-700 dark:text-stone-300 hover:bg-amber-100/40 dark:hover:bg-stone-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : (existingDoc ? 'حفظ التعديلات' : 'تسجيل وقيد الوارد')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
