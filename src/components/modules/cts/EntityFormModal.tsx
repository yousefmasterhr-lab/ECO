// ====================================================================
// ECO ERP - Project Correspondence Management System (CTS / PCMS)
// Stakeholder Entity Add / Edit Modal
// ====================================================================

import React, { useState, useEffect } from 'react';
import { Entity, EntityRole, LegalEntityType, EntityStatus } from './types';
import { ctsStorage } from '../../../services/ctsStorage';
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  X,
  Hash
} from 'lucide-react';

interface EntityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  existingEntity?: Entity | null;
}

export const EntityFormModal: React.FC<EntityFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  existingEntity
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [role, setRole] = useState<EntityRole>('Consultant');
  const [legalType, setLegalType] = useState<LegalEntityType>('Company');
  const [registrationNo, setRegistrationNo] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<EntityStatus>('Active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (existingEntity) {
        setCode(existingEntity.code || '');
        setName(existingEntity.name || '');
        setShortName(existingEntity.short_name || '');
        setRole(existingEntity.role || 'Consultant');
        setLegalType(existingEntity.legal_type || 'Company');
        setRegistrationNo(existingEntity.registration_no || '');
        setTaxNo(existingEntity.tax_no || '');
        setContactPerson(existingEntity.contact_person || '');
        setContactTitle(existingEntity.contact_title || '');
        setPhone(existingEntity.phone || '');
        setEmail(existingEntity.email || '');
        setAddress(existingEntity.address || '');
        setStatus(existingEntity.status || 'Active');
      } else {
        setCode('');
        setName('');
        setShortName('');
        setRole('Consultant');
        setLegalType('Company');
        setRegistrationNo('');
        setTaxNo('');
        setContactPerson('');
        setContactTitle('');
        setPhone('');
        setEmail('');
        setAddress('');
        setStatus('Active');
      }
    }
  }, [isOpen, existingEntity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('يرجى تحديد كود أو رمز مختصر للجهة (مثال: CON)');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('يرجى كتابة الاسم الرسمي للجهة');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const entityPayload: Entity = {
        id: existingEntity?.id || `ent_${Date.now()}`,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        short_name: shortName.trim() || undefined,
        role,
        legal_type: legalType,
        registration_no: registrationNo.trim() || undefined,
        tax_no: taxNo.trim() || undefined,
        contact_person: contactPerson.trim() || undefined,
        contact_title: contactTitle.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        status,
      };

      await ctsStorage.saveEntity(entityPayload);
      setIsSubmitting(false);
      onSaved();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'حدث خطأ أثناء حفظ بيانات الجهة');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl my-auto rounded-3xl bg-white dark:bg-[#0E1A11] border border-stone-200 dark:border-amber-500/20 shadow-2xl p-6 text-stone-900 dark:text-stone-100 overflow-hidden"
        dir="rtl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {existingEntity ? 'تعديل بيانات جهة / شريك' : 'تسجيل جهة أو شريك جديد'}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                إضافة جهة معنية جديدة لدليل العناوين والترقيم التسلسلي للمراسلات
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-amber-500" />
                <span>كود الجهة في الترقيم (مثال: CON, CTR): *</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CON"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                الصفة الهندسية (الدور): *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as EntityRole)}
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="Consultant">استشاري (Consultant)</option>
                <option value="Owner">المالك (Client / Owner)</option>
                <option value="Main_Contractor">مقاول رئيسي (Main Contractor)</option>
                <option value="Subcontractor">مقاول باطن (Subcontractor)</option>
                <option value="Supplier">مورد معتمد (Supplier)</option>
                <option value="Authority">جهة حكومية / رقابية (Authority)</option>
                <option value="Other">أخرى (Other)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              الاسم الرسمي بالكامل: *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: مركز استشارات العفيفي الهندسي"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>الشخص المسؤول للتواصل:</span>
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="م. أحمد الشناوي"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                المسمى الوظيفي:
              </label>
              <input
                type="text"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                placeholder="مدير إدارة المشاريع"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>رقم الهاتف / الجوال:</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 234 5678"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>البريد الإلكتروني:</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@entity.com"
                className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>العنوان والمقر الرئيسي:</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="مدينة نصر - الحي السابع - القاهرة"
              className="w-full px-3.5 py-2.5 text-xs bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200 dark:border-stone-800">
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
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-500/25 transition disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'جارٍ الحفظ...' : (existingEntity ? 'تحديث بيانات الجهة' : 'تسجيل الجهة')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
