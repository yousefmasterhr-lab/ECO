export type ConfigurationCategory =
  | 'roles'
  | 'departments'
  | 'doc_types'
  | 'branch_types'
  | 'signatory_titles'
  | 'meeting_rooms'
  | 'couriers'
  | 'work_permits'
  | 'reception_lists'
  | 'insurance_request_types'
  | 'insurance_occupations';

export interface SystemConfigurationItem {
  id: string;
  category: ConfigurationCategory;
  code: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  colorVar?: string;
  isSystem?: boolean;
  isActive?: boolean;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConfigurationCategoryMeta {
  key: ConfigurationCategory;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  iconName: string;
  count?: number;
}

export const CONFIGURATION_CATEGORIES_META: ConfigurationCategoryMeta[] = [
  {
    key: 'roles',
    titleAr: 'الأدوار والمسميات الوظيفية',
    titleEn: 'Job Roles & Titles',
    descriptionAr: 'تعريف الأدوار القيادية والتنفيذية والمسميات الوظيفية في النظام',
    iconName: 'Shield',
  },
  {
    key: 'departments',
    titleAr: 'الأقسام والإدارات والتخصصات',
    titleEn: 'Departments & Specializations',
    descriptionAr: 'قائمة الهيكل الإداري والقطاعات التشغيلية والتخصصية',
    iconName: 'Network',
  },
  {
    key: 'doc_types',
    titleAr: 'أنواع الوثائق والتراخيص',
    titleEn: 'License & Document Types',
    descriptionAr: 'السجلات القانونية والتجارية وتصنيفات المقاولين والشهادات الرسمية',
    iconName: 'FileText',
  },
  {
    key: 'branch_types',
    titleAr: 'أنواع المقرات والمواقع',
    titleEn: 'Branch & Site Types',
    descriptionAr: 'تصنيفات المقرات الرئيسية، الفروع الإدارية، المستودعات ومواقع المشاريع',
    iconName: 'Building2',
  },
  {
    key: 'signatory_titles',
    titleAr: 'صفات التفويض والتوكيلات',
    titleEn: 'Signatory Titles & Capacities',
    descriptionAr: 'الصفات القانونية للمفوضين بالتوقيع والتوكيلات البنكية والإدارية',
    iconName: 'Award',
  },
  {
    key: 'meeting_rooms',
    titleAr: 'قاعات الاجتماعات والضيافة',
    titleEn: 'Meeting Rooms & Boardrooms',
    descriptionAr: 'تعريف وتجهيزات قاعات المؤتمرات والاجتماعات ومجالس الإدارة بالمنشأة',
    iconName: 'Building2',
  },
  {
    key: 'couriers',
    titleAr: 'شركات الشحن والطرود السريعة',
    titleEn: 'Courier & Shipping Services',
    descriptionAr: 'قائمة شركات الشحن السريع والبريد المعتمدة للطرود والمراسلات',
    iconName: 'Package',
  },
  {
    key: 'work_permits',
    titleAr: 'طبيعة تصاريح العمل الفنية',
    titleEn: 'Technical Work Permit Scopes',
    descriptionAr: 'تصنيفات أعمال الصيانة والتركيبات والتعديلات الفنية المسموح بها للمقاولين',
    iconName: 'HardHat',
  },
];

