import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  FileText,
  Package,
  BarChart3,
  Users,
  Briefcase,
  Settings,
  HelpCircle,
  Plus,
  MoreVertical,
  MessageSquare,
  Paperclip,
  CheckCircle2,
  Circle,
  Clock,
  Search,
  Bell,
  ArrowLeft,
  X,
  Send,
  Folder,
  ChevronRight,
  ChevronLeft,
  Pin,
  CalendarCheck,
  Palette,
  Check,
  Trash2,
  Pencil,
  Copy,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  FolderOpen,
  Building2,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  ChevronDown,
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Timer,
  AlertTriangle,
  ShieldAlert,
  Flame,
  Boxes,
  ExternalLink,
  Target,
  Gauge,
  Phone,
  Award
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api/v1';

export type CardColor = 'blue' | 'peach' | 'purple' | 'mint' | 'coral' | 'canary';

interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
}

interface Task {
  id: string;
  columnId: 'todo' | 'inprogress' | 'inreview' | 'done';
  title: string;
  tags: string[];
  color: CardColor;
  note?: string;
  progress: number;
  subtasks?: Subtask[];
  hasImagePreview?: boolean;
  assignees: { name: string; avatar: string }[];
  commentsCount: number;
  attachmentsCount: number;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  comments: Comment[];
  timeSpent?: number; // Total seconds spent on this task
  estimatedHours?: number; // Realistic budget in hours (e.g. 4.0h)
  isTimerRunning?: boolean;
  aiRiskScore?: 'Low' | 'Medium' | 'High' | 'Overdue';
  aiRiskReason?: string;
  product_id?: string;
  product_name?: string;
  orgId?: string;
  folderId?: string;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  color: 'cream' | 'sand' | 'mint' | 'rose';
  isPinned: boolean;
  author: string;
  date: string;
  orgId?: string;
  folderId?: string;
}

interface ScheduleSubtask {
  id: string;
  text: string;
  completed: boolean;
}

interface ScheduleComment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  content: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'Milestone' | 'Review' | 'Sprint' | 'Deadline' | 'Research';
  color: CardColor;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: string;
  status: 'Scheduled' | 'In Progress' | 'Done' | 'Completed';
  phase?: 'Discovery & Research' | 'Design & Planning' | 'Development' | 'Review & QA' | 'Launch' | string;
  startDate?: string;
  endDate?: string;
  description?: string;
  assigneeRole?: string;
  assigneeAvatar?: string;
  subtasks?: ScheduleSubtask[];
  comments?: ScheduleComment[];
  orgId?: string;
  folderId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  projects: string[];
  workload: number;
  lastActive: string;
  status?: 'active' | 'pending';
  inviteLink?: string;
}

export interface TaskFolder {
  id: string;
  name: string;
  code: string;
  description: string;
  color: CardColor;
  status: string;
  tasksCount?: number;
}

// Archival Select Dropdown option interface and component
interface ArchivalOption<T extends string | number = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  sublabel?: string;
}

interface ArchivalSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: ArchivalOption<T>[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  title?: string;
}

function ArchivalSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  title
}: ArchivalSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (val: T) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative dropdown-container ${className}`} data-dropdown="true">
      <button
        type="button"
        title={title}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className={`w-full bg-[#FAF6EE] border border-[#D5CABB] hover:border-[#8C7E6C] rounded-xl px-3 py-2 text-xs font-bold text-[#2A231D] flex items-center justify-between shadow-2xs transition-all active:scale-[0.99] touch-target cursor-pointer ${
          isOpen ? 'ring-2 ring-[#2E2721]/20 border-[#2E2721]' : ''
        } ${buttonClassName}`}
      >
        <div className="flex items-center space-x-2 truncate mr-1.5 pointer-events-none">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          {selectedOption?.badge && (
            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-[#E8DEC9] text-[#554A3E] shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#8C7E6C] transition-transform duration-200 shrink-0 pointer-events-none ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 top-full mt-1.5 min-w-[210px] w-full bg-[#FAF6EE] border border-[#D5CABB] rounded-xl shadow-2xl p-1.5 z-[9999] animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto no-scrollbar ${menuClassName}`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={String(opt.value)}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(opt.value);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(opt.value);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all text-left mb-1 last:mb-0 cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#2E2721] text-[#FAF6EE] font-bold shadow-2xs'
                    : 'text-[#3E342B] hover:bg-[#EAE0CF] font-medium'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate mr-2 pointer-events-none">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="truncate">
                    <span className="truncate block font-semibold">{opt.label}</span>
                    {opt.sublabel && (
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-[#DCD1BC]' : 'text-[#8C7E6C]'}`}>
                        {opt.sublabel}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 shrink-0 ml-1 pointer-events-none">
                  {opt.badge && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-[#FAF6EE]' : 'bg-[#E8DEC9] text-[#554A3E]'}`}>
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#FAF6EE] ml-1 shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export interface ProductFeature {
  id: string;
  title: string;
  status: 'Planned' | 'In Progress' | 'Completed';
}

export interface ProductMetrics {
  completionRate: number;
  openBugs: number;
  totalMilestones: number;
}

export interface ClientItem {
  id: string;
  name: string;
  code: string;
  company: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  avatar: string;
  status: 'Active' | 'In Negotiation' | 'Onboarding' | 'Retainer' | 'Completed';
  contract_value: string;
  tier: 'Enterprise' | 'Retainer' | 'Growth' | 'Standard';
  lead_owner: string;
  lead_avatar: string;
  active_projects: string[];
  deliverables_count: number;
  notes: string;
  website: string;
  organization_id?: number | string;
}

const INITIAL_CLIENTS: ClientItem[] = [
  {
    id: 'cl-1',
    name: 'Nexus Dynamics Group',
    code: 'CL-01',
    company: 'Nexus Dynamics Corp.',
    industry: 'Enterprise Software & Cloud',
    contact_name: 'Elena Rostova',
    contact_email: 'elena.rostova@nexusdynamics.io',
    contact_phone: '+1 (555) 349-1029',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
    status: 'Active',
    contract_value: '$120,000',
    tier: 'Enterprise',
    lead_owner: 'Mason Walker',
    lead_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    active_projects: ['Brand & Marketing Ops', 'Client Deliverables'],
    deliverables_count: 8,
    notes: 'Priority enterprise retainer. Quarterly security audit & design system refresh due in Q3.',
    website: 'https://nexusdynamics.io'
  },
  {
    id: 'cl-2',
    name: 'Starlight Media Studios',
    code: 'CL-02',
    company: 'Starlight Interactive Ltd.',
    industry: 'Streaming & Digital Entertainment',
    contact_name: 'Marcus Vance',
    contact_email: 'm.vance@starlightstudios.com',
    contact_phone: '+1 (555) 782-9901',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    status: 'Retainer',
    contract_value: '$85,000',
    tier: 'Retainer',
    lead_owner: 'Sofia Delgado',
    lead_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    active_projects: ['Client Deliverables'],
    deliverables_count: 5,
    notes: 'Ongoing monthly retainer for digital streaming portal UI and mobile companion apps.',
    website: 'https://starlightstudios.com'
  },
  {
    id: 'cl-3',
    name: 'Aetheria Health Systems',
    code: 'CL-03',
    company: 'Aetheria Health LLC',
    industry: 'Biotech & HealthTech',
    contact_name: 'Dr. Aris Chen',
    contact_email: 'aris.chen@aetheriahealth.org',
    contact_phone: '+1 (555) 412-8820',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    status: 'Onboarding',
    contract_value: '$94,000',
    tier: 'Growth',
    lead_owner: 'Julian Thorne',
    lead_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    active_projects: ['Internal Research & Labs'],
    deliverables_count: 3,
    notes: 'New account completing HIPAA compliant data telemetry and clinician dashboard onboarding.',
    website: 'https://aetheriahealth.org'
  },
  {
    id: 'cl-4',
    name: 'Solaria FinTech Capital',
    code: 'CL-04',
    company: 'Solaria Ventures Inc.',
    industry: 'Decentralized Finance & Asset Management',
    contact_name: 'Liam Sterling',
    contact_email: 'liam@solariacapital.com',
    contact_phone: '+1 (555) 902-1244',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
    status: 'Active',
    contract_value: '$165,000',
    tier: 'Enterprise',
    lead_owner: 'Mason Walker',
    lead_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    active_projects: ['Client Deliverables', 'Brand & Marketing Ops'],
    deliverables_count: 12,
    notes: 'Tier-1 client. Automated high-frequency clearing portal and executive investor dossiers.',
    website: 'https://solariacapital.com'
  }
];

export interface ProductItem {
  id: string;
  name: string;
  code: string;
  version: string;
  description: string;
  category: string;
  stage: 'Discovery' | 'In Development' | 'Review & QA' | 'Launched' | string;
  health: 'On Track' | 'At Risk' | 'Needs Attention' | string;
  color: CardColor;
  target_release: string;
  lead_name: string;
  lead_avatar: string;
  linked_tasks_count: number;
  features: ProductFeature[];
  metrics: ProductMetrics;
  orgId?: string;
  folderId?: string;
}

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prd-1',
    orgId: 'org-1',
    folderId: 'f-1',
    name: 'Acme Digital Portal',
    code: 'PRD-01',
    version: 'v2.4.0',
    description: 'Client self-service dashboard with multi-tenant permissions, real-time analytics, and billing hooks.',
    category: 'Web App',
    stage: 'In Development',
    health: 'On Track',
    color: 'peach',
    target_release: '2026-06-30',
    lead_name: 'Mason Walker',
    lead_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
    linked_tasks_count: 8,
    features: [
      { id: 'f1', title: 'Single Sign-On (Google/SAML)', status: 'Completed' },
      { id: 'f2', title: 'Telemetry & Audit Logs', status: 'In Progress' },
      { id: 'f3', title: 'Export PDF Deliverables', status: 'Planned' }
    ],
    metrics: { completionRate: 68, openBugs: 2, totalMilestones: 6 }
  },
  {
    id: 'prd-2',
    orgId: 'org-1',
    folderId: 'f-1',
    name: 'Ginko Mobile Native App',
    code: 'PRD-02',
    version: 'v1.1.2',
    description: 'High-performance iOS & Android client with offline SQLite cache, push reminders, and biometrics.',
    category: 'Mobile App',
    stage: 'Review & QA',
    health: 'At Risk',
    color: 'mint',
    target_release: '2026-05-20',
    lead_name: 'Emma Carter',
    lead_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
    linked_tasks_count: 14,
    features: [
      { id: 'f1', title: 'Biometric FaceID Login', status: 'Completed' },
      { id: 'f2', title: 'Push Notification Gateway', status: 'Completed' },
      { id: 'f3', title: 'App Store Submission Dossier', status: 'In Progress' }
    ],
    metrics: { completionRate: 85, openBugs: 5, totalMilestones: 8 }
  },
  {
    id: 'prd-3',
    orgId: 'org-1',
    folderId: 'f-1',
    name: 'Orion Design System & UI Kit',
    code: 'PRD-03',
    version: 'v3.0.0-rc',
    description: 'Shared token repository, Figma UI variables, tactile vintage card components, and accessible patterns.',
    category: 'Design System',
    stage: 'Launched',
    health: 'On Track',
    color: 'blue',
    target_release: '2026-04-15',
    lead_name: 'Sophia Bennett',
    lead_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
    linked_tasks_count: 5,
    features: [
      { id: 'f1', title: 'Manila Dossier Card Specs', status: 'Completed' },
      { id: 'f2', title: 'Figma Auto-Layout Tokens', status: 'Completed' },
      { id: 'f3', title: 'KaTeX Formula Support', status: 'Completed' }
    ],
    metrics: { completionRate: 100, openBugs: 0, totalMilestones: 4 }
  },
  {
    id: 'prd-4',
    orgId: 'org-1',
    folderId: 'f-1',
    name: 'Telemetry AI Risk Radar API',
    code: 'PRD-04',
    version: 'v0.9-beta',
    description: 'Machine learning pacing engine calculating task slip probabilities, burndown forecasts, and velocity warnings.',
    category: 'API & Service',
    stage: 'Discovery',
    health: 'Needs Attention',
    color: 'purple',
    target_release: '2026-08-10',
    lead_name: 'Lucas Wright',
    lead_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces',
    linked_tasks_count: 9,
    features: [
      { id: 'f1', title: 'Chronos Real-time Stopwatch Sync', status: 'Completed' },
      { id: 'f2', title: 'Heuristic Pace Warning Matrix', status: 'In Progress' },
      { id: 'f3', title: 'Weekly Executive Briefing PDF', status: 'Planned' }
    ],
    metrics: { completionRate: 42, openBugs: 3, totalMilestones: 5 }
  }
];

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  folders: TaskFolder[];
}

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    orgId: 'org-1',
    folderId: 'f-1',
    columnId: 'todo',
    title: 'Search inspirations for upcoming project',
    tags: ['#website', '#client'],
    color: 'blue',
    note: 'Note: They like our behance project Mise',
    progress: 40,
    assignees: [
      { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces' },
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 12,
    attachmentsCount: 8,
    dueDate: 'May 18, 2026',
    priority: 'Medium',
    product_id: 'prd-1',
    product_name: 'Acme Digital Portal',
    timeSpent: 3600, // 1h 00m
    estimatedHours: 3.5,
    isTimerRunning: false,
    aiRiskScore: 'Low',
    aiRiskReason: 'Sprint pace matches team velocity. Expected on time.',
    comments: [
      { id: 'c1', author: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces', time: '2 hours ago', content: 'Collected 14 clean moodboards from Dribbble and Behance.' },
      { id: 'c2', author: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces', time: '35 mins ago', content: 'The typography palette in Mise matches client expectations closely.' }
    ]
  },
  {
    id: 't-2',
    orgId: 'org-1',
    folderId: 'f-1',
    columnId: 'todo',
    title: 'Ginko mobile app design',
    tags: ['#mobile app', '#client'],
    color: 'purple',
    note: 'Note: We have a meeting 2:34 AM',
    progress: 15,
    timeSpent: 7200, // 2h 00m
    estimatedHours: 5.0,
    isTimerRunning: false,
    aiRiskScore: 'Medium',
    aiRiskReason: 'Multiple wireframe iterations pending review. Approaching 40% time limit.',
    subtasks: [
      { id: 'st-1', text: 'Create user flow', completed: true },
      { id: 'st-2', text: 'Make wireframe', completed: false },
      { id: 'st-3', text: 'Design onboarding screens', completed: false },
      { id: 'st-4', text: 'Make prototype', completed: false }
    ],
    assignees: [
      { name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Marcus W.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 7,
    attachmentsCount: 2,
    dueDate: 'May 20, 2026',
    priority: 'High',
    product_id: 'prd-2',
    product_name: 'Ginko Mobile Native App',
    comments: [
      { id: 'c3', author: 'Marcus W.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces', time: 'Yesterday', content: 'Wireframes review scheduled right after breakfast.' }
    ]
  },
  {
    id: 't-3',
    orgId: 'org-1',
    folderId: 'f-1',
    columnId: 'inprogress',
    title: 'Wehiu product task and the task process pages',
    tags: ['#dribbble shot', '#product'],
    color: 'peach',
    note: 'Have to finish this before weekend',
    progress: 90,
    timeSpent: 16200, // 4h 30m
    estimatedHours: 4.0,
    isTimerRunning: false,
    aiRiskScore: 'High',
    aiRiskReason: 'Over original budget by 30 mins. Finishing touches in progress.',
    hasImagePreview: true,
    assignees: [
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 6,
    attachmentsCount: 1,
    dueDate: 'May 14, 2026',
    priority: 'Urgent',
    product_id: 'prd-1',
    product_name: 'Acme Digital Portal',
    comments: [
      { id: 'c4', author: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces', time: '10 mins ago', content: 'Finalized the responsive navigation breakpoints.' }
    ]
  },
  {
    id: 't-4',
    orgId: 'org-1',
    folderId: 'f-1',
    columnId: 'inprogress',
    title: 'Design CRM shop product page responsive website',
    tags: ['#products', '#client'],
    color: 'mint',
    progress: 40,
    timeSpent: 5400, // 1h 30m
    estimatedHours: 6.0,
    isTimerRunning: false,
    aiRiskScore: 'Low',
    aiRiskReason: 'Healthy progress within allotted workload budget.',
    assignees: [
      { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Alex T.', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 12,
    attachmentsCount: 8,
    dueDate: 'May 22, 2026',
    priority: 'Medium',
    product_id: 'prd-3',
    product_name: 'Orion Design System & UI Kit',
    comments: []
  },
  {
    id: 't-5',
    orgId: 'org-1',
    folderId: 'f-1',
    columnId: 'inreview',
    title: 'Orypto product landing page create in webflow',
    tags: ['#development', '#client'],
    color: 'coral',
    progress: 60,
    timeSpent: 9000,
    estimatedHours: 4.5,
    isTimerRunning: false,
    aiRiskScore: 'Medium',
    aiRiskReason: 'Review gatekeepers have not approved mobile viewport tests.',
    assignees: [
      { name: 'Alex T.', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop&crop=faces' },
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 12,
    attachmentsCount: 8,
    dueDate: 'May 12, 2026',
    priority: 'High',
    comments: []
  },
  {
    id: 't-6',
    orgId: 'org-1',
    folderId: 'f-1',
    columnId: 'inreview',
    title: 'Natverk video platform web app design and develop',
    tags: ['#product', '#client'],
    color: 'blue',
    progress: 80,
    timeSpent: 14400,
    estimatedHours: 8.0,
    isTimerRunning: false,
    aiRiskScore: 'Low',
    aiRiskReason: 'Final QA validation underway.',
    assignees: [
      { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 12,
    attachmentsCount: 8,
    dueDate: 'May 16, 2026',
    priority: 'Medium',
    product_id: 'prd-4',
    product_name: 'Telemetry AI Risk Radar API',
    comments: []
  }
];

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n-1',
    orgId: 'org-1',
    folderId: 'f-1',
    title: 'Client Brand Identity Guidelines',
    content: 'Client requested a vintage warm dossier palette with file-folder cutout tabs. Ensure high contrast charcoal typography (#2C2621) and soft paper drop-shadows across all cards.',
    tags: ['#design', '#client', '#spec'],
    color: 'cream',
    isPinned: true,
    author: 'Mason Walker',
    date: 'May 09, 2026'
  },
  {
    id: 'n-2',
    orgId: 'org-1',
    folderId: 'f-1',
    title: 'Sprint #3 Key Milestones & Deliverables',
    content: '1. Complete responsive layout testing.\n2. Enable real-time card color changing on click.\n3. Integrate interactive Schedule & Note tabs directly into the folder interface.',
    tags: ['#sprint', '#planning'],
    color: 'sand',
    isPinned: true,
    author: 'Sarah L.',
    date: 'May 10, 2026'
  },
  {
    id: 'n-3',
    orgId: 'org-1',
    folderId: 'f-1',
    title: 'WebSocket Real-time Broadcast Architecture',
    content: 'Broadcast presence events on project room whenever a card changes color, advances column, or gets a new comment.',
    tags: ['#backend', '#websockets'],
    color: 'mint',
    isPinned: false,
    author: 'David K.',
    date: 'May 10, 2026'
  }
];

const INITIAL_SCHEDULE: ScheduleItem[] = [
  // Discovery & Research
  {
    id: 's-1',
    title: 'Market research',
    phase: 'Discovery & Research',
    date: '2026-05-05',
    startDate: '2026-05-05',
    endDate: '2026-05-07',
    time: '10:00 AM',
    category: 'Research',
    color: 'purple',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Alex Carter',
    assigneeRole: 'Product Manager',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    description: 'Analyze market trends, competitors, and user needs to inform the product strategy.',
    subtasks: [
      { id: 'sub-1', text: 'Review industry reports', completed: true },
      { id: 'sub-2', text: 'Analyze competitors', completed: true },
      { id: 'sub-3', text: 'Summarize findings', completed: false }
    ],
    comments: [
      { id: 'c-1', author: 'Alex Carter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop', time: 'May 6, 2026, 10:24 AM', content: 'Initial research shows strong demand in the SMB segment. I\'ll share the full report in the dossier.' },
      { id: 'c-2', author: 'Taylor Kim', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop', time: 'May 6, 2026, 2:17 PM', content: 'Great! Let\'s focus on the top 3 competitors for the next step.' },
      { id: 'c-3', author: 'Jordan Lee', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop', time: 'May 6, 2026, 4:03 PM', content: 'Sounds good. I\'ve added the links to the research folder.' }
    ]
  },
  {
    id: 's-2',
    title: 'User interviews',
    phase: 'Discovery & Research',
    date: '2026-05-05',
    startDate: '2026-05-05',
    endDate: '2026-05-06',
    time: '02:00 PM',
    category: 'Research',
    color: 'purple',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Alex Carter',
    assigneeRole: 'Product Manager',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    description: 'Conduct 5 remote user interviews focusing on workspace archival needs.',
    subtasks: [],
    comments: []
  },
  {
    id: 's-3',
    title: 'Competitive analysis',
    phase: 'Discovery & Research',
    date: '2026-05-06',
    startDate: '2026-05-06',
    endDate: '2026-05-07',
    time: '04:00 PM',
    category: 'Research',
    color: 'purple',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Taylor Kim',
    assigneeRole: 'UX Researcher',
    assigneeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    description: 'Matrix comparison of competitive filing and calendar timeline interfaces.',
    subtasks: [],
    comments: []
  },

  // Design & Planning
  {
    id: 's-4',
    title: 'Create wireframes',
    phase: 'Design & Planning',
    date: '2026-05-07',
    startDate: '2026-05-07',
    endDate: '2026-05-09',
    time: '11:00 AM',
    category: 'Review',
    color: 'peach',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Taylor Kim',
    assigneeRole: 'Lead Product Designer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    description: 'Wireframe user flows, timeline navigation grids, and task detail inspect drawers.',
    subtasks: [
      { id: 'sub-w1', text: 'Low-fi layout sketches', completed: true },
      { id: 'sub-w2', text: 'High-fi desktop & drawer screens', completed: true }
    ],
    comments: []
  },
  {
    id: 's-5',
    title: 'Design system',
    phase: 'Design & Planning',
    date: '2026-05-08',
    startDate: '2026-05-08',
    endDate: '2026-05-10',
    time: '01:30 PM',
    category: 'Sprint',
    color: 'peach',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Taylor Kim',
    assigneeRole: 'Lead Product Designer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    description: 'Parchment and charcoal color swatches, button states, and badge styling.',
    subtasks: [],
    comments: []
  },
  {
    id: 's-6',
    title: 'Prototype',
    phase: 'Design & Planning',
    date: '2026-05-09',
    startDate: '2026-05-09',
    endDate: '2026-05-10',
    time: '03:00 PM',
    category: 'Sprint',
    color: 'peach',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Alex Carter',
    assigneeRole: 'Product Manager',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    description: 'Clickable interactive walkthrough prototype for client signoff.',
    subtasks: [],
    comments: []
  },

  // Development
  {
    id: 's-7',
    title: 'Frontend development',
    phase: 'Development',
    date: '2026-05-09',
    startDate: '2026-05-09',
    endDate: '2026-05-12',
    time: '09:00 AM',
    category: 'Sprint',
    color: 'mint',
    priority: 'Urgent',
    status: 'In Progress',
    assignee: 'Jordan Lee',
    assigneeRole: 'Frontend Engineer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    description: 'Construct the Gantt timeline layout, connected connector lines, and inspect drawer state.',
    subtasks: [
      { id: 'sub-f1', text: '7-day date grid', completed: true },
      { id: 'sub-f2', text: 'Horizontal timeline bar offsets', completed: true }
    ],
    comments: []
  },
  {
    id: 's-8',
    title: 'Backend development',
    phase: 'Development',
    date: '2026-05-09',
    startDate: '2026-05-09',
    endDate: '2026-05-11',
    time: '11:00 AM',
    category: 'Sprint',
    color: 'mint',
    priority: 'High',
    status: 'In Progress',
    assignee: 'Jordan Lee',
    assigneeRole: 'Fullstack Engineer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    description: 'REST API endpoints for tasks, subtasks toggle, comments stream, and sqlite persistence.',
    subtasks: [],
    comments: []
  },
  {
    id: 's-9',
    title: 'API integration',
    phase: 'Development',
    date: '2026-05-10',
    startDate: '2026-05-10',
    endDate: '2026-05-11',
    time: '02:00 PM',
    category: 'Sprint',
    color: 'mint',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Jordan Lee',
    assigneeRole: 'Frontend Engineer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    description: 'Hook frontend Schedule tab directly with live Express endpoints.',
    subtasks: [],
    comments: []
  },

  // Review & QA
  {
    id: 's-10',
    title: 'Testing',
    phase: 'Review & QA',
    date: '2026-05-11',
    startDate: '2026-05-11',
    endDate: '2026-05-12',
    time: '10:00 AM',
    category: 'Review',
    color: 'blue',
    priority: 'High',
    status: 'Scheduled',
    assignee: 'Taylor Kim',
    assigneeRole: 'QA Engineer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    description: 'End-to-end user testing across date spans, checklists, and responsiveness.',
    subtasks: [],
    comments: []
  },
  {
    id: 's-11',
    title: 'Client review',
    phase: 'Review & QA',
    date: '2026-05-11',
    startDate: '2026-05-11',
    endDate: '2026-05-12',
    time: '01:00 PM',
    category: 'Review',
    color: 'blue',
    priority: 'High',
    status: 'Scheduled',
    assignee: 'Alex Carter',
    assigneeRole: 'Product Manager',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    description: 'Walkthrough demonstration with stakeholder steering committee.',
    subtasks: [],
    comments: []
  },
  {
    id: 's-12',
    title: 'Fixes',
    phase: 'Review & QA',
    date: '2026-05-11',
    startDate: '2026-05-11',
    endDate: '2026-05-12',
    time: '04:00 PM',
    category: 'Review',
    color: 'blue',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Jordan Lee',
    assigneeRole: 'Frontend Engineer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    description: 'Address any styling refinements or bug fixes identified during testing.',
    subtasks: [],
    comments: []
  },

  // Launch
  {
    id: 's-13',
    title: 'Deploy to production',
    phase: 'Launch',
    date: '2026-05-11',
    startDate: '2026-05-11',
    endDate: '2026-05-12',
    time: '09:00 AM',
    category: 'Milestone',
    color: 'purple',
    priority: 'Urgent',
    status: 'Scheduled',
    assignee: 'Alex Carter',
    assigneeRole: 'Product Manager',
    assigneeAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    description: 'Execute deployment pipeline and archive release documentation.',
    subtasks: [],
    comments: []
  },
  {
    id: 's-14',
    title: 'Monitor & support',
    phase: 'Launch',
    date: '2026-05-11',
    startDate: '2026-05-11',
    endDate: '2026-05-12',
    time: '02:00 PM',
    category: 'Milestone',
    color: 'purple',
    priority: 'Medium',
    status: 'Scheduled',
    assignee: 'Jordan Lee',
    assigneeRole: 'Lead Engineer',
    assigneeAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    description: 'Live telemetry and telemetry monitor post-launch.',
    subtasks: [],
    comments: []
  }
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'tm-1',
    name: 'Emma Carter',
    email: 'emma@archivalpm.com',
    role: 'Product Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
    projects: ['Acme Digital Revamp', 'CRM Platform'],
    workload: 80,
    lastActive: '2h ago'
  },
  {
    id: 'tm-2',
    name: 'Liam Johnson',
    email: 'liam@archivalpm.com',
    role: 'Developer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
    projects: ['Web Platform', 'Mobile App'],
    workload: 60,
    lastActive: '4h ago'
  },
  {
    id: 'tm-3',
    name: 'Olivia Martinez',
    email: 'olivia@archivalpm.com',
    role: 'Designer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop',
    projects: ['Acme Digital Revamp', 'Brand Refresh'],
    workload: 45,
    lastActive: '1h ago'
  },
  {
    id: 'tm-4',
    name: 'Noah Wilson',
    email: 'noah@archivalpm.com',
    role: 'Developer',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
    projects: ['Web Platform', 'API Integration'],
    workload: 70,
    lastActive: '3h ago'
  },
  {
    id: 'tm-5',
    name: 'Sophia Lee',
    email: 'sophia@archivalpm.com',
    role: 'QA Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
    projects: ['CRM Platform', 'Mobile App'],
    workload: 50,
    lastActive: '5h ago'
  },
  {
    id: 'tm-6',
    name: 'Daniel Kim',
    email: 'daniel@archivalpm.com',
    role: 'Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop',
    projects: ['API Integration', 'Web Platform'],
    workload: 75,
    lastActive: '2h ago'
  },
  {
    id: 'tm-7',
    name: 'Ava Thompson',
    email: 'ava@archivalpm.com',
    role: 'Project Manager',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop',
    projects: ['Acme Digital Revamp', 'Brand Refresh'],
    workload: 55,
    lastActive: '6h ago'
  },
  {
    id: 'tm-8',
    name: 'Ethan Davis',
    email: 'ethan@archivalpm.com',
    role: 'Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop',
    projects: ['Mobile App', 'CRM Platform'],
    workload: 65,
    lastActive: '1h ago'
  }
];

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function App() {
  // Screen Management: 'splash' | 'auth' | 'org_setup' | 'folder_hub' | 'app'
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth' | 'org_setup' | 'folder_hub' | 'app'>('splash');
  const [isFolderOpened, setIsFolderOpened] = useState(false);
  const [splashStep, setSplashStep] = useState<number>(0);

  // Organizations & Folder States
  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: 'org-1',
      name: 'Apex Studio Agency',
      slug: 'apex-studio',
      description: 'Digital product design, brand identity & architecture studio',
      folders: [
        {
          id: 'f-1',
          name: 'Client Deliverables',
          code: 'D-01',
          description: 'Active client design systems & production builds',
          color: 'peach',
          status: 'Active',
          tasksCount: 4
        },
        {
          id: 'f-2',
          name: 'Internal Research & Labs',
          code: 'D-02',
          description: 'Product specs, AI models & wireframes',
          color: 'mint',
          status: 'Active',
          tasksCount: 2
        },
        {
          id: 'f-3',
          name: 'Brand & Marketing Ops',
          code: 'D-03',
          description: 'Press kits, typography guides & launch schedules',
          color: 'blue',
          status: 'Active',
          tasksCount: 0
        }
      ]
    }
  ]);
  const [currentOrg, setCurrentOrg] = useState<Organization>(organizations[0]);
  const [currentFolder, setCurrentFolder] = useState<TaskFolder>(organizations[0].folders[0]);

  // Modals for creating new Organization or Task Folder
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');

  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderCode, setNewFolderCode] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderColor, setNewFolderColor] = useState<CardColor>('peach');

  // Auth form states (matching user screenshot)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Mason Walker',
    email: 'mason.walker@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'
  });

  const [activeTab, setActiveTab] = useState<'board' | 'schedule' | 'notes' | 'reports' | 'team' | 'products' | 'clients' | 'settings'>('board');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [clients, setClients] = useState<ClientItem[]>(INITIAL_CLIENTS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Settings State & Forms
  const [settingsActiveSubtab, setSettingsActiveSubtab] = useState<'profile' | 'organization' | 'notifications' | 'security' | 'integrations'>('profile');
  const [settingsName, setSettingsName] = useState(currentUser.name);
  const [settingsEmail, setSettingsEmail] = useState(currentUser.email);
  const [settingsAvatar, setSettingsAvatar] = useState(currentUser.avatar);
  const [settingsRole, setSettingsRole] = useState('Lead Archival Architect');
  const [settingsOrgName, setSettingsOrgName] = useState('');
  const [settingsOrgDescription, setSettingsOrgDescription] = useState('');
  const [settingsCurrentPassword, setSettingsCurrentPassword] = useState('');
  const [settingsNewPassword, setSettingsNewPassword] = useState('');
  const [settingsConfirmPassword, setSettingsConfirmPassword] = useState('');
  const [settingsEmailAlerts, setSettingsEmailAlerts] = useState(true);
  const [settingsTaskAssignedAlerts, setSettingsTaskAssignedAlerts] = useState(true);
  const [settingsDeadlineReminders, setSettingsDeadlineReminders] = useState(true);
  const [settingsSoundEffects, setSettingsSoundEffects] = useState(false);
  const [settingsCompactMode, setSettingsCompactMode] = useState(false);
  const [settingsSaveMessage, setSettingsSaveMessage] = useState<string | null>(null);
  const [settingsSaveError, setSettingsSaveError] = useState<string | null>(null);

  // Clients Page State & Modals
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('All');
  const [clientTierFilter, setClientTierFilter] = useState('All');
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientCode, setNewClientCode] = useState('');
  const [newClientCompany, setNewClientCompany] = useState('');
  const [newClientIndustry, setNewClientIndustry] = useState('Technology');
  const [newClientContactName, setNewClientContactName] = useState('');
  const [newClientContactEmail, setNewClientContactEmail] = useState('');
  const [newClientContactPhone, setNewClientContactPhone] = useState('');
  const [newClientStatus, setNewClientStatus] = useState<'Active' | 'In Negotiation' | 'Onboarding' | 'Retainer' | 'Completed'>('Active');
  const [newClientValue, setNewClientValue] = useState('$50,000');
  const [newClientTier, setNewClientTier] = useState<'Enterprise' | 'Retainer' | 'Growth' | 'Standard'>('Standard');
  const [newClientLead, setNewClientLead] = useState('Mason Walker');
  const [newClientNotes, setNewClientNotes] = useState('');
  const [newClientWebsite, setNewClientWebsite] = useState('');

  // Products Page & Multi-Product Board Filtering State
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [boardProductFilter, setBoardProductFilter] = useState<string>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productStageFilter, setProductStageFilter] = useState('All');
  const [isNewProductModalOpen, setIsNewProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductVersion, setNewProductVersion] = useState('v1.0.0');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Web App');
  const [newProductStage, setNewProductStage] = useState('In Development');
  const [newProductHealth, setNewProductHealth] = useState('On Track');
  const [newProductColor, setNewProductColor] = useState<CardColor>('peach');
  const [newProductRelease, setNewProductRelease] = useState('2026-06-30');
  const [newProductLead, setNewProductLead] = useState('Mason Walker');
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Team Management Filters & Modal State
  const [teamRoleFilter, setTeamRoleFilter] = useState<string>('All Roles');
  const [teamProjectFilter, setTeamProjectFilter] = useState<string>('All Projects');
  const [teamSearchQuery, setTeamSearchQuery] = useState<string>('');
  const [isInviteMemberModalOpen, setIsInviteMemberModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Developer');
  const [newMemberProjects, setNewMemberProjects] = useState<string[]>(['Acme Digital Revamp']);
  const [newMemberWorkload, setNewMemberWorkload] = useState<number>(60);
  const [newCommentText, setNewCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // ClickUp-Style Email Invitation & Onboarding States
  const [lastCreatedInvite, setLastCreatedInvite] = useState<{
    email: string;
    name: string;
    role: string;
    token: string;
    invite_url: string;
    organization_name: string;
    email_sent?: boolean;
    email_preview_url?: string | null;
    email_error?: string | null;
  } | null>(null);
  const [showInviteSuccessModal, setShowInviteSuccessModal] = useState(false);
  const [activeInvitationToken, setActiveInvitationToken] = useState<string | null>(null);
  const [invitationDetails, setInvitationDetails] = useState<any | null>(null);
  const [inviteAcceptPassword, setInviteAcceptPassword] = useState('password123');
  const [inviteAcceptName, setInviteAcceptName] = useState('');

  // Modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isNewScheduleModalOpen, setIsNewScheduleModalOpen] = useState(false);

  // New task form fields
  const [newTaskTargetColumn, setNewTaskTargetColumn] = useState<'todo' | 'inprogress' | 'inreview' | 'done'>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColor, setNewTaskColor] = useState<CardColor>('blue');
  const [newTaskTag, setNewTaskTag] = useState('#client');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newTaskProductId, setNewTaskProductId] = useState<string>('');
  const [newTaskAssignees, setNewTaskAssignees] = useState<{ name: string; avatar: string }[]>([
    { name: 'Emma Carter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop' }
  ]);

  // New Note form fields
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteColor, setNewNoteColor] = useState<'cream' | 'sand' | 'mint' | 'rose'>('cream');
  const [newNoteTag, setNewNoteTag] = useState('#general');
  const [newNotePinned, setNewNotePinned] = useState(false);

  // New Schedule form fields
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleDate, setNewScheduleDate] = useState('2026-05-15');
  const [newScheduleTime, setNewScheduleTime] = useState('10:00 AM');
  const [newScheduleCategory, setNewScheduleCategory] = useState<'Milestone' | 'Review' | 'Sprint' | 'Deadline' | 'Research'>('Sprint');
  const [newScheduleColor, setNewScheduleColor] = useState<CardColor>('peach');
  const [newSchedulePriority, setNewSchedulePriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newSchedulePhase, setNewSchedulePhase] = useState<string>('Design & Planning');
  const [newScheduleStartDate, setNewScheduleStartDate] = useState('2026-05-08');
  const [newScheduleEndDate, setNewScheduleEndDate] = useState('2026-05-10');

  // Interactive Timeline & Real-Time Dynamic Calendar State
  const [timelineViewMode, setTimelineViewMode] = useState<'gantt' | 'calendar'>('calendar');
  const [timelineZoom, setTimelineZoom] = useState<'Week' | 'Month' | 'Quarter'>('Month');
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<Date>(new Date());
  const [calendarViewYear, setCalendarViewYear] = useState<number>(new Date().getFullYear());
  const [calendarViewMonth, setCalendarViewMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [selectedScheduleItem, setSelectedScheduleItem] = useState<ScheduleItem | null>(null);
  const [timelineCommentInput, setTimelineCommentInput] = useState('');
  const [timelineNewSubtaskInput, setTimelineNewSubtaskInput] = useState('');
  const [timelineCollapsedPhases, setTimelineCollapsedPhases] = useState<Record<string, boolean>>({});

  // Custom Color Theme Popover Dropdown open states
  const [isTaskColorDropdownOpen, setIsTaskColorDropdownOpen] = useState(false);
  const [isScheduleColorDropdownOpen, setIsScheduleColorDropdownOpen] = useState(false);
  const [isDetailColorDropdownOpen, setIsDetailColorDropdownOpen] = useState(false);

  // Custom Member Assignment Popover Dropdown open states
  const [isDetailMemberDropdownOpen, setIsDetailMemberDropdownOpen] = useState(false);
  const [isTaskMemberDropdownOpen, setIsTaskMemberDropdownOpen] = useState(false);

  // Set sidebar open on wide screens and closed on mobile screens initially
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, []);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [createTaskSubtasks, setCreateTaskSubtasks] = useState<string[]>([]);
  const [createTaskSubtaskInput, setCreateTaskSubtaskInput] = useState('');

  // 3-dots Card Context Menu state
  const [cardMenuOpenId, setCardMenuOpenId] = useState<string | null>(null);

  // Close custom popover menus when clicking or tapping anywhere outside
  useEffect(() => {
    const handleGlobalOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // If clicked inside a dropdown toggle or menu container, do nothing
      if (
        target.closest('.dropdown-container') ||
        target.closest('[data-dropdown="true"]') ||
        target.closest('[data-card-menu="true"]')
      ) {
        return;
      }

      setIsTaskColorDropdownOpen(false);
      setIsScheduleColorDropdownOpen(false);
      setIsDetailColorDropdownOpen(false);
      setIsDetailMemberDropdownOpen(false);
      setIsTaskMemberDropdownOpen(false);
      setShowNotifications(false);
      setIsUserMenuOpen(false);
      setCardMenuOpenId(null);
    };

    document.addEventListener('mousedown', handleGlobalOutsideClick);
    document.addEventListener('touchstart', handleGlobalOutsideClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleGlobalOutsideClick);
      document.removeEventListener('touchstart', handleGlobalOutsideClick);
    };
  }, []);

  // Splash Screen Animation sequence: opens folder smoothly without rushing user away
  useEffect(() => {
    if (currentScreen === 'splash') {
      setIsFolderOpened(false);
      const timerOpen = setTimeout(() => {
        setIsFolderOpened(true);
      }, 500);

      return () => {
        clearTimeout(timerOpen);
      };
    }
  }, [currentScreen]);

  // Load organizations from backend
  useEffect(() => {
    fetch(`${API_BASE}/organizations`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const mappedOrgs: Organization[] = data.map((org: any) => ({
            id: `org-${org.id}`,
            name: org.name,
            slug: org.slug,
            description: org.description || '',
            folders: (org.folders || []).map((f: any) => ({
              id: `f-${f.id}`,
              name: f.name,
              code: f.code || 'DOSSIER',
              description: f.description || '',
              color: (f.color || 'peach') as CardColor,
              status: f.status || 'Active',
              tasksCount: f.taskCount || 0
            }))
          }));
          setOrganizations(mappedOrgs);
          if (mappedOrgs.length > 0) {
            setCurrentOrg(mappedOrgs[0]);
            if (mappedOrgs[0].folders && mappedOrgs[0].folders.length > 0) {
              setCurrentFolder(mappedOrgs[0].folders[0]);
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = authEmail.trim() || 'mason.walker@company.com';
    const finalName = authName.trim() || (authMode === 'signup' ? 'New Member' : 'Mason Walker');

    setCurrentUser({
      name: finalName,
      email: finalEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'
    });

    // If signing up or no organizations exist, go to Organization Setup; otherwise to Folder Hub
    if (authMode === 'signup' || organizations.length === 0) {
      setCurrentScreen('org_setup');
    } else {
      setCurrentScreen('folder_hub');
    }

    setNotifications(prev => [
      { id: Date.now(), text: `Authenticated as ${finalName}`, time: 'Just now' },
      ...prev
    ]);
  };

  const handleGoogleLogin = () => {
    setCurrentUser({
      name: 'Mason Walker',
      email: 'mason.walker@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces'
    });
    if (organizations.length === 0) {
      setCurrentScreen('org_setup');
    } else {
      setCurrentScreen('folder_hub');
    }
    setNotifications(prev => [
      { id: Date.now(), text: 'Signed in with Google Account', time: 'Just now' },
      ...prev
    ]);
  };

  // Create new organization handler
  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: newOrgName.trim(),
      slug: newOrgName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newOrgDescription.trim() || 'Custom Organization Workspace',
      folders: [
        {
          id: `f-${Date.now()}-1`,
          name: 'Primary Tasks',
          code: 'DOSSIER-01',
          description: 'Primary tasks and active deliverables',
          color: 'peach',
          status: 'Active',
          tasksCount: 0
        }
      ]
    };

    setOrganizations(prev => [...prev, newOrg]);
    setCurrentOrg(newOrg);
    setCurrentFolder(newOrg.folders[0]);
    setIsNewOrgModalOpen(false);
    setNewOrgName('');
    setNewOrgDescription('');

    // Persist to backend
    fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newOrg.name, description: newOrg.description })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Created organization: "${newOrg.name}"`, time: 'Just now' },
      ...prev
    ]);

    // Proceed to Folder Hub for this new organization
    setCurrentScreen('folder_hub');
  };

  const formatFolderCode = (code?: string, index?: number) => {
    if (!code) return `D-0${(index ?? 0) + 1}`;
    // If it matches DOSSIER-XX or DOSSIER XX, turn it into D-XX
    const match = code.match(/DOSSIER[_\-\s]*(\d+)/i);
    if (match) return `D-${match[1].padStart(2, '0')}`;
    return code;
  };

  // Create new task folder handler
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    const shortCode = newFolderCode.trim().toUpperCase() || `D-0${currentOrg.folders.length + 1}`;
    const newFld: TaskFolder = {
      id: `f-${Date.now()}`,
      name: newFolderName.trim(),
      code: formatFolderCode(shortCode, currentOrg.folders.length),
      description: newFolderDescription.trim() || 'Classified task folder',
      color: newFolderColor,
      status: 'Active',
      tasksCount: 0
    };

    const updatedFolders = [...currentOrg.folders, newFld];
    const updatedOrg = { ...currentOrg, folders: updatedFolders };

    setOrganizations(prev => prev.map(o => o.id === currentOrg.id ? updatedOrg : o));
    setCurrentOrg(updatedOrg);
    setCurrentFolder(newFld);
    setIsNewFolderModalOpen(false);
    setNewFolderName('');
    setNewFolderCode('');
    setNewFolderDescription('');

    const orgNumId = currentOrg.id.replace('org-', '');
    fetch(`${API_BASE}/organizations/${orgNumId}/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newFld.name,
        code: newFld.code,
        description: newFld.description,
        color: newFld.color
      })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Created task folder: "${newFld.name}" (${newFld.code})`, time: 'Just now' },
      ...prev
    ]);
  };

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Backend connected to SQLite API server', time: 'Just now' },
    { id: 2, text: 'Sophia Bennett assigned you to Dossier #4092', time: '5m ago' },
    { id: 3, text: 'Mason Walker commented on Ginko mobile app', time: '14m ago' }
  ]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load from backend API if available
  useEffect(() => {
    // Check if user followed an invite link (e.g. ?invite=inv_xyz)
    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('invite');
    if (inviteToken) {
      setActiveInvitationToken(inviteToken);
      fetch(`${API_BASE}/invites/${inviteToken}`)
        .then(res => res.ok ? res.json() : null)
        .then(inv => {
          if (inv && !inv.error) {
            setInvitationDetails(inv);
            setInviteAcceptName(inv.name || '');
            setCurrentScreen('auth');
            setAuthEmail(inv.email);
          }
        })
        .catch(() => {});
    }

    fetch(`${API_BASE}/notes`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const apiNotes: NoteItem[] = data.map((d: any) => ({
            id: `n-${d.id}`,
            title: d.title,
            content: d.content,
            tags: d.tags || ['#general'],
            color: (d.color as any) || 'cream',
            isPinned: !!d.is_pinned,
            author: 'Mason Walker',
            date: d.created_at ? new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'May 10, 2026'
          }));
          setNotes(prev => [...apiNotes, ...prev.filter(p => !apiNotes.some(a => a.id === p.id))]);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/schedules`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const apiSchedules: ScheduleItem[] = data.map((d: any) => ({
            id: `s-${d.id}`,
            title: d.title,
            date: d.date,
            time: d.time || '10:00 AM',
            category: (d.category as any) || 'Sprint',
            color: (d.color as any) || 'blue',
            priority: (d.priority as any) || 'Medium',
            assignee: d.assignee || 'Mason Walker',
            assigneeRole: d.assignee_role || 'Contributor',
            assigneeAvatar: d.assignee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
            status: (d.status as any) || 'Scheduled',
            phase: d.phase || 'Discovery & Research',
            startDate: d.start_date || d.date,
            endDate: d.end_date || d.date,
            description: d.description || '',
            subtasks: Array.isArray(d.subtasks) ? d.subtasks : [],
            comments: Array.isArray(d.comments) ? d.comments : []
          }));
          setSchedules(apiSchedules);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/team-members`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const apiTeam: TeamMember[] = data.map((d: any) => ({
            id: `tm-${d.id}`,
            name: d.name,
            email: d.email,
            role: d.role || 'Developer',
            avatar: d.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
            projects: Array.isArray(d.projects) ? d.projects : ['Acme Digital Revamp'],
            workload: d.workload || 50,
            lastActive: d.last_active || 'Just now'
          }));
          setTeamMembers(apiTeam);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/products`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const apiProducts: ProductItem[] = data.map((d: any) => ({
            id: `prd-${d.id}`,
            orgId: d.organization_id ? `org-${d.organization_id}` : 'org-1',
            folderId: d.folder_id ? `f-${d.folder_id}` : 'f-1',
            name: d.name,
            code: d.code,
            version: d.version || 'v1.0.0',
            description: d.description || '',
            category: d.category || 'Web App',
            stage: d.stage || 'In Development',
            health: d.health || 'On Track',
            color: (d.color as any) || 'peach',
            target_release: d.target_release || '2026-06-30',
            lead_name: d.lead_name || 'Mason Walker',
            lead_avatar: d.lead_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
            linked_tasks_count: d.linked_tasks_count || 0,
            features: Array.isArray(d.features) ? d.features : [],
            metrics: d.metrics || { completionRate: 50, openBugs: 0, totalMilestones: 4 }
          }));
          setProducts(apiProducts);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/clients`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const apiClients: ClientItem[] = data.map((d: any) => ({
            id: `cl-${d.id}`,
            name: d.name,
            code: d.code,
            company: d.company || d.name,
            industry: d.industry || 'Technology',
            contact_name: d.contact_name || '',
            contact_email: d.contact_email || '',
            contact_phone: d.contact_phone || '',
            avatar: d.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
            status: d.status || 'Active',
            contract_value: d.contract_value || '$50,000',
            tier: d.tier || 'Standard',
            lead_owner: d.lead_owner || 'Mason Walker',
            lead_avatar: d.lead_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
            active_projects: Array.isArray(d.active_projects) ? d.active_projects : ['Client Deliverables'],
            deliverables_count: d.deliverables_count || 1,
            notes: d.notes || '',
            website: d.website || '',
            organization_id: d.organization_id
          }));
          setClients(apiClients);
        }
      })
      .catch(() => {});

    fetch(`${API_BASE}/projects/1`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.columns && Array.isArray(data.columns)) {
          const loadedTasks: Task[] = [];
          data.columns.forEach((col: any) => {
            const colId = col.id === 1 ? 'todo' : col.id === 2 ? 'inprogress' : 'inreview';
            if (col.tasks && Array.isArray(col.tasks)) {
              col.tasks.forEach((t: any) => {
                loadedTasks.push({
                  id: `t-${t.id}`,
                  orgId: t.organization_id ? `org-${t.organization_id}` : 'org-1',
                  folderId: t.folder_id ? `f-${t.folder_id}` : 'f-1',
                  columnId: colId,
                  title: t.title,
                  tags: Array.isArray(t.tags) ? t.tags : ['#client'],
                  color: (t.color as any) || 'blue',
                  note: t.note || undefined,
                  progress: t.progress || 0,
                  subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
                  assignees: Array.isArray(t.assignees) && t.assignees.length > 0 ? t.assignees : [
                    { name: 'Emma Carter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop' }
                  ],
                  commentsCount: (t.comments && t.comments.length) || 0,
                  attachmentsCount: 0,
                  dueDate: t.due_date || 'May 30, 2026',
                  priority: (t.priority as any) || 'Medium',
                  timeSpent: t.time_spent || 0,
                  estimatedHours: t.estimated_hours || 4.0,
                  isTimerRunning: !!t.is_timer_running,
                  aiRiskScore: (t.ai_risk_score as any) || 'Low',
                  aiRiskReason: t.ai_risk_reason || 'Sprint pace on track',
                  comments: Array.isArray(t.comments) ? t.comments : []
                });
              });
            }
          });
          if (loadedTasks.length > 0) {
            setTasks(prev => {
              const prevNonBackend = prev.filter(p => !loadedTasks.some(lt => lt.id === p.id));
              return [...loadedTasks, ...prevNonBackend];
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Live Stopwatch Ticker for Running Timers (1s interval)
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTasks(prev => {
        let hasChanges = false;
        const updated = prev.map(t => {
          if (t.isTimerRunning) {
            hasChanges = true;
            const newTime = (t.timeSpent || 0) + 1;
            const estHours = t.estimatedHours || 4.0;
            const spentHours = newTime / 3600;
            let risk = t.aiRiskScore;
            let reason = t.aiRiskReason;

            if (spentHours > estHours) {
              risk = 'High';
              reason = `Over realistic estimate by ${(spentHours - estHours).toFixed(1)}h. Pace needs attention.`;
            } else if (spentHours > estHours * 0.75 && t.progress < 50) {
              risk = 'Medium';
              reason = `Used 75% of budget with ${t.progress}% completion. Risk of deadline slip.`;
            }

            return {
              ...t,
              timeSpent: newTime,
              aiRiskScore: risk,
              aiRiskReason: reason
            };
          }
          return t;
        });

        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Real-time WebSocket connection for live team comments and task synchronizations
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.hostname || 'localhost';
        const wsUrl = `${wsProtocol}//${wsHost}:3001`;

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[Live Archival Tunnel] Connected to real-time sync server');
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_COMMENT') {
              const { taskId, comment } = data;
              const formattedComment: Comment = {
                id: `c-${comment.id || Date.now()}`,
                author: comment.author || comment.name || 'Team Member',
                avatar: comment.avatar || comment.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
                time: comment.time || 'Just now',
                content: comment.text || comment.content || ''
              };

              setTasks(prevTasks => prevTasks.map(t => {
                const rawId = t.id.replace('t-', '');
                if (t.id === taskId || rawId === String(taskId)) {
                  // Prevent duplicate comment if matching text content
                  const exists = (t.comments || []).some(c => (
                    c.id === formattedComment.id ||
                    c.content.trim().toLowerCase() === formattedComment.content.trim().toLowerCase()
                  ));
                  if (exists) return t;

                  const updatedComments = [formattedComment, ...(t.comments || [])];
                  return {
                    ...t,
                    comments: updatedComments,
                    commentsCount: (t.commentsCount || 0) + 1
                  };
                }
                return t;
              }));

              setSelectedTask(prevSelected => {
                if (prevSelected) {
                  const rawSelId = prevSelected.id.replace('t-', '');
                  if (prevSelected.id === taskId || rawSelId === String(taskId)) {
                    const exists = (prevSelected.comments || []).some(c => (
                      c.id === formattedComment.id ||
                      c.content.trim().toLowerCase() === formattedComment.content.trim().toLowerCase()
                    ));
                    if (!exists) {
                      return {
                        ...prevSelected,
                        comments: [formattedComment, ...(prevSelected.comments || [])],
                        commentsCount: (prevSelected.commentsCount || 0) + 1
                      };
                    }
                  }
                }
                return prevSelected;
              });

              setNotifications(prev => [
                {
                  id: Date.now(),
                  text: `New dispatch from ${formattedComment.author}: "${formattedComment.content.slice(0, 30)}${formattedComment.content.length > 30 ? '...' : ''}"`,
                  time: 'Just now'
                },
                ...prev
              ]);
            } else if (data.type === 'TASK_UPDATED' && data.task) {
              const updated = data.task;
              setTasks(prev => prev.map(t => {
                const rawId = t.id.replace('t-', '');
                if (t.id === `t-${updated.id}` || rawId === String(updated.id)) {
                  // If timer is currently running, keep the local monotonic timeSpent instead of rolling back to stale backend snapshot
                  const resolvedTimeSpent = t.isTimerRunning && (t.timeSpent || 0) > (updated.time_spent || 0)
                    ? t.timeSpent
                    : (updated.time_spent !== undefined ? updated.time_spent : t.timeSpent);
                  return {
                    ...t,
                    title: updated.title !== undefined ? updated.title : t.title,
                    color: updated.color || t.color,
                    progress: updated.progress !== undefined ? updated.progress : t.progress,
                    priority: updated.priority || t.priority,
                    note: updated.note !== undefined ? updated.note : t.note,
                    product_id: updated.product_id !== undefined ? updated.product_id : t.product_id,
                    product_name: updated.product_name !== undefined ? updated.product_name : t.product_name,
                    timeSpent: resolvedTimeSpent,
                    isTimerRunning: updated.is_timer_running !== undefined ? !!updated.is_timer_running : t.isTimerRunning,
                    assignees: Array.isArray(updated.assignees) && updated.assignees.length > 0 ? updated.assignees : t.assignees
                  };
                }
                return t;
              }));

              setSelectedTask(prev => {
                if (prev) {
                  const rawSelId = prev.id.replace('t-', '');
                  if (prev.id === `t-${updated.id}` || rawSelId === String(updated.id)) {
                    const resolvedTimeSpent = prev.isTimerRunning && (prev.timeSpent || 0) > (updated.time_spent || 0)
                      ? prev.timeSpent
                      : (updated.time_spent !== undefined ? updated.time_spent : prev.timeSpent);
                    return {
                      ...prev,
                      title: updated.title !== undefined ? updated.title : prev.title,
                      color: updated.color || prev.color,
                      progress: updated.progress !== undefined ? updated.progress : prev.progress,
                      priority: updated.priority || prev.priority,
                      note: updated.note !== undefined ? updated.note : prev.note,
                      product_id: updated.product_id !== undefined ? updated.product_id : prev.product_id,
                      product_name: updated.product_name !== undefined ? updated.product_name : prev.product_name,
                      timeSpent: resolvedTimeSpent,
                      isTimerRunning: updated.is_timer_running !== undefined ? !!updated.is_timer_running : prev.isTimerRunning,
                      assignees: Array.isArray(updated.assignees) && updated.assignees.length > 0 ? updated.assignees : prev.assignees
                    };
                  }
                }
                return prev;
              });
            } else if (data.type === 'TASK_CREATED' && data.task) {
              const newTask = data.task;
              const formattedTask: Task = {
                id: `t-${newTask.id}`,
                columnId: (newTask.column_id === 1 ? 'todo' : newTask.column_id === 2 ? 'inprogress' : 'inreview') as any,
                title: newTask.title,
                tags: Array.isArray(newTask.tags) ? newTask.tags : ['#client'],
                color: (newTask.color as any) || 'blue',
                note: newTask.note || undefined,
                progress: newTask.progress || 0,
                subtasks: Array.isArray(newTask.subtasks) ? newTask.subtasks : [],
                assignees: Array.isArray(newTask.assignees) && newTask.assignees.length > 0 ? newTask.assignees : [
                  { name: 'Emma Carter', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop' }
                ],
                commentsCount: 0,
                attachmentsCount: 0,
                dueDate: newTask.due_date || 'May 30, 2026',
                priority: (newTask.priority as any) || 'Medium',
                timeSpent: newTask.time_spent || 0,
                estimatedHours: newTask.estimated_hours || 4.0,
                isTimerRunning: !!newTask.is_timer_running,
                aiRiskScore: (newTask.ai_risk_score as any) || 'Low',
                aiRiskReason: newTask.ai_risk_reason || 'Sprint pace on track',
                comments: []
              };
              setTasks(prev => {
                if (prev.some(t => t.id === formattedTask.id)) return prev;
                return [formattedTask, ...prev];
              });
            }
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = () => {
          if (ws) ws.close();
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  // Format seconds to HH:MM:SS or MM:SS
  const formatTimeSpent = (totalSeconds: number = 0) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Toggle Stopwatch Timer on a Task
  const handleToggleTimer = (taskId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    let targetAction: 'start' | 'stop' = 'start';
    let updatedTaskObj: Task | null = null;

    let currentSnapshotTime = 0;
    setTasks(prev => {
      return prev.map(t => {
        if (t.id === taskId) {
          const nextRunning = !t.isTimerRunning;
          targetAction = nextRunning ? 'start' : 'stop';
          currentSnapshotTime = t.timeSpent || 0;
          updatedTaskObj = { ...t, isTimerRunning: nextRunning };
          return updatedTaskObj;
        }
        return t;
      });
    });

    setSelectedTask(prev => {
      if (prev && prev.id === taskId) {
        return { ...prev, isTimerRunning: !prev.isTimerRunning };
      }
      return prev;
    });

    const numId = taskId.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}/timer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: targetAction, time_spent: currentSnapshotTime })
    }).catch(() => {});

    setNotifications(prev => [
      {
        id: Date.now(),
        text: `${targetAction === 'start' ? '⏱️ Stopwatch Started' : '⏸️ Stopwatch Paused'} on task`,
        time: 'Just now'
      },
      ...prev
    ]);
  };

  // Reset Stopwatch Timer
  const handleResetTimer = (taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let updatedTaskObj: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTaskObj = { ...t, timeSpent: 0, isTimerRunning: false, aiRiskScore: 'Low', aiRiskReason: 'Timer reset. On track.' };
        return updatedTaskObj;
      }
      return t;
    }));

    if (selectedTask && selectedTask.id === taskId && updatedTaskObj) {
      setSelectedTask(updatedTaskObj);
    }

    const numId = taskId.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}/timer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset' })
    }).catch(() => {});
  };

  // Update Estimated Hours (Realistic Deadline Budget)
  const handleSetEstimatedHours = (taskId: string, hours: number) => {
    const val = Math.max(0.5, Math.min(100, hours));
    let updatedTaskObj: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        updatedTaskObj = { ...t, estimatedHours: val };
        return updatedTaskObj;
      }
      return t;
    }));

    if (selectedTask && selectedTask.id === taskId && updatedTaskObj) {
      setSelectedTask(updatedTaskObj);
    }

    const numId = taskId.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimated_hours: val })
    }).catch(() => {});
  };

  // Product Catalog Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim()) return;

    const newProd: ProductItem = {
      id: `prd-${Date.now()}`,
      orgId: currentOrg.id,
      folderId: currentFolder.id,
      name: newProductName.trim(),
      code: newProductCode.trim().toUpperCase() || `PRD-0${products.length + 1}`,
      version: newProductVersion.trim() || 'v1.0.0',
      description: newProductDescription.trim() || 'Classified product deliverable and engineering system.',
      category: newProductCategory,
      stage: newProductStage,
      health: newProductHealth,
      color: newProductColor,
      target_release: newProductRelease,
      lead_name: newProductLead,
      lead_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
      linked_tasks_count: 0,
      features: [
        { id: `f-${Date.now()}-1`, title: 'Core architecture scaffolding', status: 'Completed' },
        { id: `f-${Date.now()}-2`, title: 'Integration testing & QA review', status: 'In Progress' }
      ],
      metrics: { completionRate: 35, openBugs: 1, totalMilestones: 4 }
    };

    setProducts(prev => [newProd, ...prev]);
    setIsNewProductModalOpen(false);
    setNewProductName('');
    setNewProductCode('');
    setNewProductVersion('v1.0.0');
    setNewProductDescription('');

    fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newProd.name,
        code: newProd.code,
        version: newProd.version,
        description: newProd.description,
        category: newProd.category,
        stage: newProd.stage,
        health: newProd.health,
        color: newProd.color,
        target_release: newProd.target_release,
        lead_name: newProd.lead_name,
        lead_avatar: newProd.lead_avatar,
        linked_tasks_count: newProd.linked_tasks_count,
        features: newProd.features,
        metrics: newProd.metrics
      })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Created product dossier: "${newProd.name}" (${newProd.code})`, time: 'Just now' },
      ...prev
    ]);
  };

  const handleToggleProductFeature = (productId: string, featureId: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextFeatures = p.features.map(f => {
          if (f.id === featureId) {
            const nextStatus: 'Planned' | 'In Progress' | 'Completed' =
              f.status === 'Completed' ? 'In Progress' : f.status === 'In Progress' ? 'Planned' : 'Completed';
            return { ...f, status: nextStatus };
          }
          return f;
        });
        const completedCount = nextFeatures.filter(f => f.status === 'Completed').length;
        const newRate = nextFeatures.length > 0 ? Math.round((completedCount / nextFeatures.length) * 100) : p.metrics.completionRate;
        const updated = {
          ...p,
          features: nextFeatures,
          metrics: { ...p.metrics, completionRate: newRate }
        };
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updated);
        }
        return updated;
      }
      return p;
    }));
  };

  const handleAddProductFeature = (productId: string) => {
    if (!newFeatureInput.trim()) return;
    const newFeature: ProductFeature = {
      id: `f-${Date.now()}`,
      title: newFeatureInput.trim(),
      status: 'Planned'
    };

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const nextFeatures = [...p.features, newFeature];
        const completedCount = nextFeatures.filter(f => f.status === 'Completed').length;
        const newRate = Math.round((completedCount / nextFeatures.length) * 100);
        const updated = {
          ...p,
          features: nextFeatures,
          metrics: { ...p.metrics, completionRate: newRate }
        };
        if (selectedProduct && selectedProduct.id === productId) {
          setSelectedProduct(updated);
        }
        return updated;
      }
      return p;
    }));

    setNewFeatureInput('');
  };

  const handleDeleteProduct = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to archive this product deliverable dossier?')) return;

    setProducts(prev => prev.filter(p => p.id !== productId));
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }

    const numId = productId.replace('prd-', '');
    fetch(`${API_BASE}/products/${numId}`, {
      method: 'DELETE'
    }).catch(() => {});
  };

  // Real-time dynamic Date & Clock
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 10000);
    return () => clearInterval(clockInterval);
  }, []);

  const getRealTimeDateFormatted = (date: Date = currentDateTime) => {
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();

    // Suffix (1st, 2nd, 3rd, 4th...)
    const nth = (d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1:  return 'st';
        case 2:  return 'nd';
        case 3:  return 'rd';
        default: return 'th';
      }
    };

    return `Today is ${weekday}, ${month} ${day}${nth(day)}, ${year}`;
  };

  // Card Color Switcher - changes color of existing task
  const handleTaskColorChange = (taskId: string, newColor: CardColor) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, color: newColor };
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));

    // Send update to backend
    const numId = taskId.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ color: newColor })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Card color changed to ${newColor.toUpperCase()}`, time: 'Just now' },
      ...prev
    ]);
  };

  // Assign or change Product Deliverable on an existing task
  const handleTaskProductChange = (taskId: string, productId: string) => {
    const matchedProduct = products.find(p => p.id === productId || p.name === productId);
    const assignedProdId = matchedProduct?.id || (productId || undefined);
    const assignedProdName = matchedProduct?.name || undefined;

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updated = { ...t, product_id: assignedProdId, product_name: assignedProdName };
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(updated);
        }
        return updated;
      }
      return t;
    }));

    const numId = taskId.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: assignedProdId, product_name: assignedProdName })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Assigned to ${assignedProdName || 'Standalone Deliverable'}`, time: 'Just now' },
      ...prev
    ]);
  };

  // Toggle member assignment on a task
  const handleToggleTaskAssignee = (taskId: string, member: TeamMember) => {
    let updatedTask: Task | null = null;
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const hasMember = (t.assignees || []).some(a => a.name === member.name);
        const newAssignees = hasMember
          ? (t.assignees.length > 1 ? t.assignees.filter(a => a.name !== member.name) : t.assignees)
          : [...(t.assignees || []), { name: member.name, avatar: member.avatar }];
        
        updatedTask = { ...t, assignees: newAssignees };
        return updatedTask;
      }
      return t;
    }));

    if (selectedTask && selectedTask.id === taskId && updatedTask) {
      setSelectedTask(updatedTask);
    }

    const numId = taskId.replace('t-', '');
    if (updatedTask) {
      const t = updatedTask as Task;
      fetch(`${API_BASE}/tasks/${numId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignees: t.assignees })
      }).catch(() => {});

      setNotifications(prev => [
        { id: Date.now(), text: `Updated assignees on "${t.title.slice(0, 24)}..."`, time: 'Just now' },
        ...prev
      ]);
    }
  };

  // Add a subtask to selectedTask in modal
  const handleAddSubtaskToSelectedTask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskInput.trim() || !selectedTask) return;

    const newSt: Subtask = {
      id: `st-${Date.now()}`,
      text: newSubtaskInput.trim(),
      completed: false
    };

    const currentSubtasks = selectedTask.subtasks || [];
    const updatedSubtasks = [...currentSubtasks, newSt];
    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);

    const updatedTask = {
      ...selectedTask,
      subtasks: updatedSubtasks,
      progress: newProgress
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setNewSubtaskInput('');

    // Persist to backend
    const numId = selectedTask.id.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtasks: updatedSubtasks, progress: newProgress })
    }).catch(() => {});
  };

  // Delete subtask from selectedTask
  const handleDeleteSubtask = (subtaskId: string) => {
    if (!selectedTask) return;
    const currentSubtasks = selectedTask.subtasks || [];
    const updatedSubtasks = currentSubtasks.filter(st => st.id !== subtaskId);
    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const newProgress = updatedSubtasks.length > 0 ? Math.round((completedCount / updatedSubtasks.length) * 100) : 0;

    const updatedTask = {
      ...selectedTask,
      subtasks: updatedSubtasks,
      progress: newProgress
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);

    const numId = selectedTask.id.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subtasks: updatedSubtasks, progress: newProgress })
    }).catch(() => {});
  };

  // Subtask toggle
  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId || !t.subtasks) return t;
      const updatedSubtasks = t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
      const completedCount = updatedSubtasks.filter(st => st.completed).length;
      const newProgress = Math.round((completedCount / updatedSubtasks.length) * 100);
      const updatedTask = { ...t, subtasks: updatedSubtasks, progress: newProgress };
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updatedTask);
      }

      // Persist to backend
      const numId = taskId.replace('t-', '');
      fetch(`${API_BASE}/tasks/${numId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: updatedSubtasks, progress: newProgress })
      }).catch(() => {});

      return updatedTask;
    }));
  };

  // Add comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;

    const trimmed = newCommentText.trim();
    const commentAuthor = currentUser.name || 'Mason Walker';
    const commentAvatar = currentUser.avatar;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: commentAuthor,
      avatar: commentAvatar,
      time: 'Just now',
      content: trimmed
    };

    const updatedTask = {
      ...selectedTask,
      comments: [newComment, ...selectedTask.comments],
      commentsCount: selectedTask.commentsCount + 1
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setNewCommentText('');

    const numId = selectedTask.id.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: trimmed, author: commentAuthor })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Comment broadcasted to team on "${selectedTask.title.slice(0, 20)}..."`, time: 'Just now' },
      ...prev
    ]);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
    }
    setCardMenuOpenId(null);

    const numId = taskId.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}`, {
      method: 'DELETE'
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Card removed from board`, time: 'Just now' },
      ...prev
    ]);
  };

  // Duplicate task
  const handleDuplicateTask = (task: Task) => {
    const duplicated: Task = {
      ...task,
      id: `t-${Date.now()}`,
      orgId: task.orgId || currentOrg.id,
      folderId: task.folderId || currentFolder.id,
      title: `${task.title} (Copy)`,
      subtasks: task.subtasks ? task.subtasks.map((s, idx) => ({ ...s, id: `st-${Date.now()}-${idx}` })) : [],
      comments: [],
      commentsCount: 0
    };

    setTasks(prev => [duplicated, ...prev]);
    setCardMenuOpenId(null);

    fetch(`${API_BASE}/projects/1/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column_id: duplicated.columnId === 'todo' ? 1 : duplicated.columnId === 'inprogress' ? 2 : 3,
        title: duplicated.title,
        priority: duplicated.priority,
        color: duplicated.color,
        tags: duplicated.tags,
        subtasks: duplicated.subtasks,
        progress: duplicated.progress
      })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Duplicated card "${task.title.slice(0, 18)}..."`, time: 'Just now' },
      ...prev
    ]);
  };

  // Move task to column
  const moveTask = (taskId: string, targetCol: 'todo' | 'inprogress' | 'inreview' | 'done') => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: targetCol } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, columnId: targetCol } : null);
    }
    setCardMenuOpenId(null);

    const numId = taskId.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column_id: targetCol === 'todo' ? 1 : targetCol === 'inprogress' ? 2 : 3,
        position: 0
      })
    }).catch(() => {});
  };

  // Create new task with initial subtasks
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const initialSubtasks: Subtask[] = createTaskSubtasks.map((txt, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      text: txt,
      completed: false
    }));

    const taskAssignees = newTaskAssignees.length > 0
      ? newTaskAssignees
      : [{ name: currentUser.name || 'Mason Walker', avatar: currentUser.avatar }];

    const matchedProduct = products.find(p => p.id === newTaskProductId || p.name === newTaskProductId);
    const assignedProdId = matchedProduct?.id || (newTaskProductId || undefined);
    const assignedProdName = matchedProduct?.name || undefined;

    const newTask: Task = {
      id: `t-${Date.now()}`,
      orgId: currentOrg.id,
      folderId: currentFolder.id,
      columnId: newTaskTargetColumn,
      title: newTaskTitle.trim(),
      tags: [newTaskTag],
      color: newTaskColor,
      progress: 0,
      subtasks: initialSubtasks,
      assignees: taskAssignees,
      commentsCount: 0,
      attachmentsCount: 0,
      dueDate: 'May 30, 2026',
      priority: newTaskPriority,
      product_id: assignedProdId,
      product_name: assignedProdName,
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');
    setNewTaskProductId('');
    setCreateTaskSubtasks([]);
    setCreateTaskSubtaskInput('');

    // Persist to backend
    fetch(`${API_BASE}/projects/1/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column_id: newTaskTargetColumn === 'todo' ? 1 : newTaskTargetColumn === 'inprogress' ? 2 : 3,
        title: newTask.title,
        priority: newTask.priority,
        color: newTask.color,
        tags: newTask.tags,
        subtasks: newTask.subtasks,
        progress: 0,
        assignees: newTask.assignees,
        product_id: assignedProdId,
        product_name: assignedProdName
      })
    }).catch(() => {});

    const memberNames = taskAssignees.map(a => a.name).join(', ');
    setNotifications(prev => [
      { id: Date.now(), text: `Task created: "${newTask.title}" (assigned to ${memberNames})`, time: 'Just now' },
      ...prev
    ]);
  };

  // Create new Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
      orgId: currentOrg.id,
      folderId: currentFolder.id,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: [newNoteTag],
      color: newNoteColor,
      isPinned: newNotePinned,
      author: 'Mason Walker',
      date: 'May 10, 2026'
    };

    setNotes(prev => [newNote, ...prev]);
    setIsNewNoteModalOpen(false);
    setNewNoteTitle('');
    setNewNoteContent('');

    fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags,
        color: newNote.color,
        is_pinned: newNote.isPinned
      })
    }).catch(() => {});
  };

  // Toggle Pin Note with real-time sorting and backend persistence
  const togglePinNote = (noteId: string) => {
    let nextPinnedState = false;
    setNotes(prev => {
      const updated = prev.map(n => {
        if (n.id === noteId) {
          nextPinnedState = !n.isPinned;
          return { ...n, isPinned: nextPinnedState };
        }
        return n;
      });
      // Pinned notes stay at the top
      return [...updated].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
    });

    const numId = noteId.replace('n-', '');
    fetch(`${API_BASE}/notes/${numId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: nextPinnedState })
    }).catch(() => {});
  };

  // Create Schedule Item
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim()) return;

    const newEvent: ScheduleItem = {
      id: `s-${Date.now()}`,
      orgId: currentOrg.id,
      folderId: currentFolder.id,
      title: newScheduleTitle.trim(),
      date: newScheduleDate,
      startDate: newScheduleStartDate || newScheduleDate,
      endDate: newScheduleEndDate || newScheduleDate,
      time: newScheduleTime,
      category: newScheduleCategory,
      color: newScheduleColor,
      priority: newSchedulePriority,
      phase: newSchedulePhase || 'Design & Planning',
      assignee: currentUser.name || 'Mason Walker',
      assigneeRole: 'Contributor',
      assigneeAvatar: currentUser.avatar,
      description: 'Scheduled task in ' + (newSchedulePhase || 'project roadmap'),
      status: 'Scheduled',
      subtasks: [],
      comments: []
    };

    setSchedules(prev => [...prev, newEvent]);
    setIsNewScheduleModalOpen(false);
    setNewScheduleTitle('');

    fetch(`${API_BASE}/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newEvent.title,
        date: newEvent.date,
        start_date: newEvent.startDate,
        end_date: newEvent.endDate,
        time: newEvent.time,
        category: newEvent.category,
        color: newEvent.color,
        priority: newEvent.priority,
        assignee: newEvent.assignee,
        assignee_role: newEvent.assigneeRole,
        assignee_avatar: newEvent.assigneeAvatar,
        phase: newEvent.phase,
        description: newEvent.description,
        subtasks: [],
        comments: []
      })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Added "${newEvent.title.slice(0, 20)}..." to Timeline`, time: 'Just now' },
      ...prev
    ]);
  };

  // Toggle Timeline Task Subtask
  const handleToggleScheduleSubtask = (itemId: string, subtaskId: string) => {
    let updatedItem: ScheduleItem | null = null;
    setSchedules(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedSubs = (item.subtasks || []).map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
        const allDone = updatedSubs.length > 0 && updatedSubs.every(st => st.completed);
        updatedItem = {
          ...item,
          subtasks: updatedSubs,
          status: allDone ? 'Done' : 'In Progress'
        };
        return updatedItem;
      }
      return item;
    }));

    if (selectedScheduleItem && selectedScheduleItem.id === itemId && updatedItem) {
      setSelectedScheduleItem(updatedItem);
    }

    const numId = itemId.replace('s-', '');
    if (updatedItem) {
      const it = updatedItem as ScheduleItem;
      fetch(`${API_BASE}/schedules/${numId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtasks: it.subtasks,
          status: it.status
        })
      }).catch(() => {});
    }
  };

  // Add subtask to schedule item
  const handleAddScheduleSubtask = (itemId: string) => {
    if (!timelineNewSubtaskInput.trim()) return;
    const newSt: ScheduleSubtask = {
      id: 'sub-' + Date.now(),
      text: timelineNewSubtaskInput.trim(),
      completed: false
    };

    let updatedItem: ScheduleItem | null = null;
    setSchedules(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedSubs = [...(item.subtasks || []), newSt];
        updatedItem = { ...item, subtasks: updatedSubs };
        return updatedItem;
      }
      return item;
    }));

    if (selectedScheduleItem && selectedScheduleItem.id === itemId && updatedItem) {
      setSelectedScheduleItem(updatedItem);
    }
    setTimelineNewSubtaskInput('');

    const numId = itemId.replace('s-', '');
    if (updatedItem) {
      const it = updatedItem as ScheduleItem;
      fetch(`${API_BASE}/schedules/${numId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtasks: it.subtasks })
      }).catch(() => {});
    }
  };

  // Add Comment to Schedule Item
  const handleAddScheduleComment = (itemId: string) => {
    if (!timelineCommentInput.trim()) return;
    const newComment: ScheduleComment = {
      id: 'c-' + Date.now(),
      author: currentUser.name || 'Mason Walker',
      avatar: currentUser.avatar,
      time: 'Just now',
      content: timelineCommentInput.trim()
    };

    let updatedItem: ScheduleItem | null = null;
    setSchedules(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedComments = [...(item.comments || []), newComment];
        updatedItem = { ...item, comments: updatedComments };
        return updatedItem;
      }
      return item;
    }));

    if (selectedScheduleItem && selectedScheduleItem.id === itemId && updatedItem) {
      setSelectedScheduleItem(updatedItem);
    }
    setTimelineCommentInput('');

    const numId = itemId.replace('s-', '');
    fetch(`${API_BASE}/schedules/${numId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newComment.content,
        author: newComment.author,
        avatar: newComment.avatar
      })
    }).catch(() => {});
  };

  // Add / Invite Team Member (ClickUp Style with Email Invitation Link)
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberEmail.trim()) return;

    const emailTrimmed = newMemberEmail.trim().toLowerCase();
    const generatedToken = 'inv_' + Math.random().toString(36).substring(2, 9);
    const origin = window.location.origin || 'http://localhost:5173';
    const inviteLink = `${origin}/?invite=${generatedToken}`;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: newMemberName.trim(),
      email: emailTrimmed,
      role: newMemberRole || 'Developer',
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=80&h=80&fit=crop`,
      projects: newMemberProjects.length > 0 ? newMemberProjects : ['Acme Digital Revamp'],
      workload: newMemberWorkload || 50,
      lastActive: 'Invite pending',
      status: 'pending',
      inviteLink
    };

    setTeamMembers(prev => [newMember, ...prev]);
    setIsInviteMemberModalOpen(false);

    // Save invite state so the user can copy or preview the invitation email
    const orgNumId = currentOrg.id.replace('org-', '') || '1';
    const inviteObj = {
      email: emailTrimmed,
      name: newMemberName.trim(),
      role: newMemberRole || 'Developer',
      token: generatedToken,
      invite_url: inviteLink,
      organization_name: currentOrg.name
    };
    setLastCreatedInvite(inviteObj);
    setShowInviteSuccessModal(true);

    // Persist invitation to backend
    fetch(`${API_BASE}/organizations/${orgNumId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        projects: newMember.projects
      })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.invite_url) {
          setLastCreatedInvite(prev => prev ? {
            ...prev,
            invite_url: data.invite_url,
            token: data.token,
            email_sent: data.email_sent,
            email_preview_url: data.email_preview_url,
            email_error: data.email_error
          } : null);
        }
      })
      .catch(() => {});

    setNewMemberName('');
    setNewMemberEmail('');
    setNewMemberRole('Developer');
    setNewMemberProjects(['Acme Digital Revamp']);
    setNewMemberWorkload(60);

    setNotifications(prev => [
      { id: Date.now(), text: `Sent workspace invitation email to "${newMember.email}"`, time: 'Just now' },
      ...prev
    ]);
  };

  // Accept Invitation & Join Organization (ClickUp Onboarding Flow)
  const handleAcceptInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvitationToken) return;

    fetch(`${API_BASE}/invites/${activeInvitationToken}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: inviteAcceptName || authName || (invitationDetails ? invitationDetails.name : 'Team Member'),
        password: inviteAcceptPassword || 'password123'
      })
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.user) {
          setCurrentUser({
            name: data.user.name,
            email: data.user.email,
            avatar: data.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'
          });

          if (data.organization) {
            const orgData = data.organization;
            const formattedOrg: Organization = {
              id: `org-${orgData.id}`,
              name: orgData.name,
              slug: orgData.slug,
              description: orgData.description || '',
              folders: (orgData.folders || []).map((f: any) => ({
                id: `f-${f.id}`,
                name: f.name,
                code: f.code || 'DOSSIER',
                description: f.description || '',
                color: (f.color || 'peach') as CardColor,
                status: f.status || 'Active',
                tasksCount: f.taskCount || 0
              }))
            };
            setOrganizations(prev => {
              if (prev.some(o => o.id === formattedOrg.id)) {
                return prev.map(o => o.id === formattedOrg.id ? formattedOrg : o);
              }
              return [formattedOrg, ...prev];
            });
            setCurrentOrg(formattedOrg);
            if (formattedOrg.folders.length > 0) {
              setCurrentFolder(formattedOrg.folders[0]);
            }
          }

          // Mark active member status in local directory
          setTeamMembers(prev => prev.map(m => m.email.toLowerCase() === data.user.email.toLowerCase() ? {
            ...m,
            status: 'active',
            lastActive: 'Just now',
            name: data.user.name
          } : m));

          // Clean query param from URL
          window.history.replaceState({}, document.title, window.location.pathname);
          setActiveInvitationToken(null);
          setInvitationDetails(null);
          setCurrentScreen('app');

          setNotifications(prev => [
            { id: Date.now(), text: `Joined organization "${data.organization?.name || 'Workspace'}" successfully!`, time: 'Just now' },
            ...prev
          ]);
        }
      })
      .catch(() => {
        // Fallback for offline demo
        const demoEmail = invitationDetails?.email || authEmail || 'invited.member@company.com';
        const demoName = inviteAcceptName || authName || 'Invited Member';
        setCurrentUser({
          name: demoName,
          email: demoEmail,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'
        });
        window.history.replaceState({}, document.title, window.location.pathname);
        setActiveInvitationToken(null);
        setInvitationDetails(null);
        setCurrentScreen('app');
      });
  };

  // Toggle Project Assignment on Team Member
  const handleToggleProjectAssignment = (memberId: string, projectName: string) => {
    let updatedMember: TeamMember | null = null;
    setTeamMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const hasProj = m.projects.includes(projectName);
        const newProjects = hasProj
          ? (m.projects.length > 1 ? m.projects.filter(p => p !== projectName) : m.projects)
          : [...m.projects, projectName];
        updatedMember = { ...m, projects: newProjects };
        return updatedMember;
      }
      return m;
    }));

    const numId = memberId.replace('tm-', '');
    if (updatedMember) {
      const mem = updatedMember as TeamMember;
      fetch(`${API_BASE}/team-members/${numId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projects: mem.projects })
      }).catch(() => {});
    }
  };

  // Delete / Remove Team Member
  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    const numId = memberId.replace('tm-', '');
    fetch(`${API_BASE}/team-members/${numId}`, {
      method: 'DELETE'
    }).catch(() => {});
    setNotifications(prev => [
      { id: Date.now(), text: 'Team member removed from directory', time: 'Just now' },
      ...prev
    ]);
  };

  // Role Badge Styling Helper
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Product Owner':
        return 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]';
      case 'Project Manager':
        return 'bg-[#EDE9FE] text-[#7C3AED] border-[#DDD6FE]';
      case 'Developer':
        return 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]';
      case 'Frontend Engineer':
        return 'bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]';
      case 'Backend Engineer':
        return 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]';
      case 'Designer':
        return 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]';
      case 'QA Engineer':
        return 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]';
      default:
        return 'bg-[#F3F4F6] text-[#374151] border-[#E5E7EB]';
    }
  };

  // Project Tag Styling Helper
  const getProjectTagStyle = (proj: string) => {
    switch (proj) {
      case 'Acme Digital Revamp':
        return 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
      case 'CRM Platform':
        return 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]';
      case 'Web Platform':
        return 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]';
      case 'Mobile App':
        return 'bg-[#FCE7F3] text-[#BE185D] border-[#FBCFE8]';
      case 'Brand Refresh':
        return 'bg-[#FFEDD5] text-[#9A3412] border-[#FED7AA]';
      case 'API Integration':
        return 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]';
      default:
        return 'bg-[#F5EFEB] text-[#4F4438] border-[#DCD1BC]';
    }
  };

  // Workload Bar Color Helper
  const getWorkloadColor = (percent: number) => {
    if (percent >= 75) return 'bg-[#8B5CF6]';
    if (percent >= 60) return 'bg-[#3B82F6]';
    if (percent >= 50) return 'bg-[#10B981]';
    return 'bg-[#F97316]';
  };

  // Color Styles Mapping (matching vintage pastel paper aesthetics)
  const getColorStyles = (color: CardColor) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-[#EBF2FE]',
          border: 'border-[#CADCFE]',
          tagBg: 'bg-[#D6E6FE]',
          tagText: 'text-[#1E429F]',
          dotActive: 'bg-[#2B6CB0]',
          dotInactive: 'bg-[#CBD5E1]',
          textColor: 'text-[#1E293B]',
          indicator: 'bg-blue-500'
        };
      case 'peach':
        return {
          bg: 'bg-[#FFF3E5]',
          border: 'border-[#FDD9B5]',
          tagBg: 'bg-[#FFE2C2]',
          tagText: 'text-[#9A3412]',
          dotActive: 'bg-[#D97706]',
          dotInactive: 'bg-[#FED7AA]',
          textColor: 'text-[#431407]',
          indicator: 'bg-amber-500'
        };
      case 'purple':
        return {
          bg: 'bg-[#F3EEFF]',
          border: 'border-[#E2D5FF]',
          tagBg: 'bg-[#E5D7FF]',
          tagText: 'text-[#6B21A8]',
          dotActive: 'bg-[#7C3AED]',
          dotInactive: 'bg-[#DDD6FE]',
          textColor: 'text-[#3B0764]',
          indicator: 'bg-purple-500'
        };
      case 'mint':
        return {
          bg: 'bg-[#E8FAF0]',
          border: 'border-[#C2F0D5]',
          tagBg: 'bg-[#D1F7E2]',
          tagText: 'text-[#065F46]',
          dotActive: 'bg-[#059669]',
          dotInactive: 'bg-[#A7F3D0]',
          textColor: 'text-[#064E3B]',
          indicator: 'bg-emerald-500'
        };
      case 'coral':
        return {
          bg: 'bg-[#FFF0F0]',
          border: 'border-[#FED3D3]',
          tagBg: 'bg-[#FFE0E0]',
          tagText: 'text-[#991B1B]',
          dotActive: 'bg-[#DC2626]',
          dotInactive: 'bg-[#FECACA]',
          textColor: 'text-[#450A0A]',
          indicator: 'bg-rose-500'
        };
      case 'canary':
        return {
          bg: 'bg-[#FEFCE8]',
          border: 'border-[#FEF08A]',
          tagBg: 'bg-[#FEF08A]',
          tagText: 'text-[#854D0E]',
          dotActive: 'bg-[#CA8A04]',
          dotInactive: 'bg-[#FEF9C3]',
          textColor: 'text-[#713F12]',
          indicator: 'bg-yellow-500'
        };
    }
  };

  const getNotePaperColor = (color: NoteItem['color']) => {
    switch (color) {
      case 'cream': return 'bg-[#FAF6EE] border-[#DCD1BC] text-[#2C2621]';
      case 'sand': return 'bg-[#F6EEDC] border-[#D8C7A9] text-[#3D3328]';
      case 'mint': return 'bg-[#EBF7F0] border-[#C2E7D1] text-[#164E34]';
      case 'rose': return 'bg-[#FDF0EE] border-[#F7D0CA] text-[#5C231C]';
    }
  };

  const filteredTasks = tasks.filter(t => {
    // Scope tasks to active organization & folder
    const matchOrg = !t.orgId || t.orgId === currentOrg.id;
    const matchFolder = !t.folderId || !currentFolder || t.folderId === currentFolder.id;
    if (!matchOrg || !matchFolder) return false;

    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.product_name && t.product_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchProduct =
      boardProductFilter === 'all' ||
      t.product_id === boardProductFilter ||
      t.product_name === boardProductFilter;
    return matchSearch && matchProduct;
  });

  const columns = [
    { id: 'todo', title: 'Todo list', count: filteredTasks.filter(t => t.columnId === 'todo').length },
    { id: 'inprogress', title: 'In Progress', count: filteredTasks.filter(t => t.columnId === 'inprogress').length },
    { id: 'inreview', title: 'In Review', count: filteredTasks.filter(t => t.columnId === 'inreview').length },
  ];

  // Scoped collections based on active organization and folder
  const currentOrgTasks = tasks.filter(t => (!t.orgId || t.orgId === currentOrg.id) && (!t.folderId || !currentFolder || t.folderId === currentFolder.id));
  const currentOrgSchedules = schedules.filter(s => (!s.orgId || s.orgId === currentOrg.id) && (!s.folderId || !currentFolder || s.folderId === currentFolder.id));
  const currentOrgNotes = notes.filter(n => (!n.orgId || n.orgId === currentOrg.id) && (!n.folderId || !currentFolder || n.folderId === currentFolder.id));
  const currentOrgProducts = products.filter(p => !p.orgId || p.orgId === currentOrg.id);

  // 1. Splash & Onboarding Screen: Cinematic 3D Folder Dossier & Interactive Walkthrough
  if (currentScreen === 'splash') {
    const onboardingSteps = [
      {
        badge: 'Archival PM Dossier',
        title: 'Tactile Project Management',
        description: 'Experience your work through an analog-inspired, vintage file-folder aesthetic engineered for focus, clarity, and rapid execution.',
        statLabel: 'CONFIDENTIAL DOSSIER',
        statValue: 'VOL. 2026'
      },
      {
        badge: 'Interactive Cards & Checklist',
        title: 'Real-time Progress & Color Coding',
        description: 'Organize priorities with pastel-washed vintage card themes, subtask checklists that advance progress meters, and instant status updates.',
        statLabel: 'ORGANIZATION',
        statValue: '6 COLOR CODES'
      },
      {
        badge: 'Unified Dossier Workspace',
        title: 'Kanban, Timeline & Dossier Notes',
        description: 'Seamlessly shift between Kanban boards, scheduling timelines, and classified project notes inside cutout folder tabs.',
        statLabel: 'CONNECTED WORKSPACE',
        statValue: 'SYNCED & SECURE'
      }
    ];

    return (
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col justify-between p-6 sm:p-10 relative overflow-hidden select-none">
        {/* Subtle Vintage Texture Background */}
        <div className="absolute inset-0 bg-[#F5EFEB] opacity-90 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#D5C8B2_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-40 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#E8DECA] opacity-30 blur-3xl pointer-events-none glow-ambient" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#E5D7BF] opacity-30 blur-3xl pointer-events-none glow-ambient" />

        {/* Top Bar: Brand + Direct Skip to Sign In */}
        <header className="relative z-20 flex items-center justify-between max-w-5xl mx-auto w-full pt-8 sm:pt-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#3F3730] text-[#FAF6EE] flex items-center justify-center shadow-md border border-[#2C241E] shrink-0">
              <Folder className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#2C241E] whitespace-nowrap">Archival PM</span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded bg-[#E8DECA] text-[#5A5046] border border-[#D5CABB] whitespace-nowrap">
                  Onboarding
                </span>
              </div>
              <p className="text-[11px] text-[#7A7064] font-medium hidden sm:block">Tactile Dossier & Project Workflow</p>
            </div>
          </div>

          <button
            onClick={() => setCurrentScreen('auth')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#FAF6EE] hover:bg-[#EFE8DC] active:scale-95 border border-[#DCD1BC] text-xs font-bold text-[#3F3730] transition-all shadow-xs flex items-center space-x-1 sm:space-x-1.5 shrink-0 whitespace-nowrap ml-2"
          >
            <span>Skip to Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </header>

        {/* Main Interactive Stage */}
        <main className="relative z-20 max-w-5xl mx-auto w-full my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Onboarding Copy, Features, and Navigation */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8DECA]/90 text-[#4D4236] border border-[#D5CABB] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>{onboardingSteps[splashStep].badge}</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C241E] tracking-tight leading-tight transition-all duration-300">
                {onboardingSteps[splashStep].title}
              </h1>
              <p className="text-sm sm:text-base text-[#6E6356] leading-relaxed max-w-lg font-normal transition-all duration-300">
                {onboardingSteps[splashStep].description}
              </p>
            </div>

            {/* Micro Dossier Spec Info */}
            <div className="flex items-center space-x-6 py-3 border-y border-[#DCD1BC]/70">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#8C8072]">Specification</p>
                <p className="text-xs font-bold text-[#2C241E] mt-0.5">{onboardingSteps[splashStep].statLabel}</p>
              </div>
              <div className="h-7 w-px bg-[#DCD1BC]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#8C8072]">Status</p>
                <p className="text-xs font-bold text-[#8A4A1C] mt-0.5">{onboardingSteps[splashStep].statValue}</p>
              </div>
              <div className="h-7 w-px bg-[#DCD1BC]" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#8C8072]">Active Step</p>
                <p className="text-xs font-bold text-[#2C241E] mt-0.5">{splashStep + 1} of 3</p>
              </div>
            </div>

            {/* Stepper Dots & Action Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex space-x-1.5 shrink-0">
                {onboardingSteps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSplashStep(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      splashStep === idx ? 'w-7 sm:w-8 bg-[#3F3730]' : 'w-2.5 bg-[#D5CABB] hover:bg-[#B8AA94]'
                    }`}
                    title={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {splashStep < onboardingSteps.length - 1 ? (
                  <button
                    onClick={() => setSplashStep(prev => prev + 1)}
                    className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#3F3730] text-[#FAF6EE] text-xs font-bold hover:bg-[#2C241E] active:scale-95 transition-all shadow-md flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <span>Next Feature</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentScreen('auth')}
                    className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#3F3730] text-[#FAF6EE] text-xs font-bold hover:bg-[#2C241E] active:scale-95 transition-all shadow-md flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <span>Enter Archival PM</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsFolderOpened(!isFolderOpened)}
                  className="px-3 sm:px-3.5 py-2.5 rounded-xl bg-[#FAF6EE] hover:bg-[#EFE8DC] active:scale-95 border border-[#D5CABB] text-xs font-semibold text-[#5A5046] transition-colors whitespace-nowrap"
                  title="Toggle 3D folder flap opening"
                >
                  {isFolderOpened ? 'Close Folder' : 'Open Folder'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Folder Dossier Presentation with Floating Cards */}
          <div className="lg:col-span-6 flex justify-center items-center py-6 sm:py-10 max-w-full overflow-hidden">
            <div className="folder-perspective relative w-72 sm:w-80 md:w-96 h-56 sm:h-64 flex items-center justify-center">
              {/* Folder Shadow Glow */}
              <div className="absolute -bottom-8 w-64 sm:w-72 md:w-80 h-10 bg-[#2C2621]/15 rounded-full blur-xl pointer-events-none" />

              {/* Folder Back Body */}
              <div className="absolute inset-0 bg-[#D8CAAE] rounded-2xl border-2 border-[#C5B595] folder-emboss flex flex-col justify-between p-5 overflow-hidden">
                {/* Folder Top Manila Cutout Notch */}
                <div className="absolute -top-3.5 left-6 bg-[#D8CAAE] border-t-2 border-l-2 border-r-2 border-[#C5B595] w-28 h-5 rounded-t-lg flex items-center px-2">
                  <span className="text-[9px] font-mono font-bold text-[#7E6F59] tracking-widest uppercase">DOSSIER #01</span>
                </div>

                <div className="flex justify-between items-start pt-1 text-[10px] font-mono text-[#7E6F59] tracking-widest uppercase">
                  <span>CONFIDENTIAL ARCHIVE</span>
                  <span>SYSTEM v1.0</span>
                </div>

                <div className="text-center my-auto opacity-35">
                  <Folder className="w-16 h-16 text-[#8F7E66] mx-auto" />
                </div>

                <div className="flex items-center justify-between text-[10px] text-[#6E604D] border-t border-[#C5B595]/80 pt-2 font-mono">
                  <span>CLASSIFIED TASKS: 06</span>
                  <span>SECURITY CLEARANCE: LVL 4</span>
                </div>
              </div>

              {/* Emerging Task Cards when Folder Opens */}
              {isFolderOpened && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                  {/* Left Floating Card: Blue */}
                  <div className="absolute w-44 sm:w-52 p-3 sm:p-3.5 rounded-xl bg-[#EBF2FE] border border-[#CADCFE] paper-shadow anim-card-left pointer-events-auto cursor-pointer hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D6E6FE] text-[#1E429F]">#mobile app</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-[#1E293B] mt-1.5 leading-snug">Design system & icons</p>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#CADCFE]/70 text-[10px] text-[#475569]">
                      <span className="font-semibold text-emerald-700">✓ Completed</span>
                      <span className="font-bold">100%</span>
                    </div>
                  </div>

                  {/* Center Hero Floating Card: Peach (Priority) */}
                  <div className="absolute w-52 sm:w-64 p-3.5 sm:p-4 rounded-xl bg-[#FFF3E5] border border-[#FDD9B5] paper-shadow anim-card-center z-30 pointer-events-auto cursor-pointer hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFE2C2] text-[#9A3412]">#product task</span>
                      <span className="text-[10px] font-mono font-bold text-[#9A3412] bg-[#FDD9B5]/80 px-1.5 py-0.5 rounded">Urgent</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#431407] mt-2 leading-snug">Wehiu product task & process</p>
                    <div className="mt-2 sm:mt-3">
                      <div className="flex justify-between text-[10px] font-semibold text-[#7C2D12] mb-1">
                        <span>Checklist progress</span>
                        <span>90%</span>
                      </div>
                      <div className="w-full bg-[#FED7AA] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#D97706] h-full rounded-full transition-all duration-500" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Right Floating Card: Mint */}
                  <div className="absolute w-44 sm:w-52 p-3 sm:p-3.5 rounded-xl bg-[#E8FAF0] border border-[#C2F0D5] paper-shadow anim-card-right pointer-events-auto cursor-pointer hover:-translate-y-1 transition-transform">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#D1F7E2] text-[#065F46]">#crm #client</span>
                      <span className="text-[10px] text-emerald-800 font-medium">In Progress</span>
                    </div>
                    <p className="text-xs font-bold text-[#064E3B] mt-1.5 leading-snug">Responsive CRM shop page</p>
                    <div className="flex items-center justify-between mt-2.5 pt-1.5 border-t border-[#C2F0D5]/70 text-[10px] text-[#047857]">
                      <span>3 of 5 subtasks</span>
                      <span className="font-bold">40%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Front Manila Flap with 3D Opening Effect */}
              <div
                onClick={() => setIsFolderOpened(!isFolderOpened)}
                className={`absolute inset-0 bg-[#E8DECA] rounded-2xl border-2 border-[#D5CABB] folder-flap-3d cursor-pointer flex flex-col items-center justify-center p-6 select-none ${
                  isFolderOpened ? 'folder-flap-open-active opacity-20 pointer-events-none' : 'hover:scale-[1.01]'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-[#3F3730] flex items-center justify-center text-[#FAF6EE] shadow-md mb-3 border border-[#2C241E]">
                  <FolderOpen className="w-7 h-7" />
                </div>
                <p className="text-base font-extrabold text-[#2C241E] tracking-tight">Archival Project Dossier</p>
                <p className="text-xs text-[#7A7064] mt-1 font-medium">Click to unlock and reveal task cards</p>
                <div className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#DCD1BC]/60 text-[#4D4236] text-[11px] font-semibold border border-[#C5B595]">
                  <span>Touch or click to open</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Footer: Feature Highlights */}
        <footer className="relative z-20 max-w-5xl mx-auto w-full pt-3 sm:pt-4 pb-2 border-t border-[#DCD1BC]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A7064] gap-2.5">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-[11px] sm:text-xs">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>Interactive Checklist Physics</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>6 Pastel Card Palettes</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden xs:inline">Schedule Timeline & Dossier Notes</span>
          </div>
          <button
            onClick={() => setCurrentScreen('auth')}
            className="text-xs font-black text-[#2C241E] bg-[#FAF6EE] hover:bg-[#EFE8DC] active:scale-95 border border-[#D5CABB] px-3.5 py-1.5 rounded-xl shadow-2xs flex items-center space-x-1"
          >
            <span>Ready? Sign in or Create Account</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </footer>
      </div>
    );
  }

  // 2. Authentication Screen: Authentic Manila Folder Dossier with Raised Cutout Tabs
  if (currentScreen === 'auth') {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 relative selection:bg-[#E8DECA]">
        {/* Vintage Paper Texture Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#D5C8B2_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="w-full max-w-md mx-auto relative z-10 pt-8 sm:pt-0">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#3F3730] text-[#FAF6EE] flex items-center justify-center mx-auto shadow-sm">
              <Folder className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="mt-3 text-xl sm:text-2xl font-bold tracking-tight text-[#2C2621]">
              {authMode === 'signin' ? 'Archival PM' : 'Create an Account'}
            </h2>
            <p className="mt-1 text-xs text-[#7A7064]">
              Organize, track, and deliver your work. All in one place.
            </p>
          </div>

          {/* Authentic Raised Manila Folder Tabs & Pocket */}
          <div className="relative">
            {/* Top Cutout Folder Tab Slips */}
            <div className="flex items-end justify-between px-1.5 -mb-px relative z-20">
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs font-black tracking-wider transition-all flex items-center space-x-1.5 border-t-2 border-l-2 border-r-2 whitespace-nowrap ${
                    authMode === 'signin'
                      ? 'bg-[#FAF6EE] text-[#2C241E] border-[#D5CABB] shadow-xs translate-y-0.5 z-30'
                      : 'bg-[#EAE0CF] text-[#7A6E5E] border-[#D0C4AF] hover:bg-[#E5D7BF]'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>SIGN IN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className={`px-4 sm:px-5 py-2.5 rounded-t-xl text-xs font-black tracking-wider transition-all flex items-center space-x-1.5 border-t-2 border-l-2 border-r-2 whitespace-nowrap ${
                    authMode === 'signup'
                      ? 'bg-[#FAF6EE] text-[#2C241E] border-[#D5CABB] shadow-xs translate-y-0.5 z-30'
                      : 'bg-[#EAE0CF] text-[#7A6E5E] border-[#D0C4AF] hover:bg-[#E5D7BF]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>NEW ACCOUNT</span>
                </button>
              </div>

              {/* Archival Stamp / Clearance Tag on Folder Tab */}
              <div className="hidden xs:flex items-center space-x-1 px-2.5 py-1 rounded-t-lg bg-[#E5D9C4] border-t border-l border-r border-[#CFBF9F] text-[9px] font-mono font-bold text-[#70624E] tracking-widest uppercase">
                <Lock className="w-2.5 h-2.5 text-amber-800" />
                <span>CONFIDENTIAL</span>
              </div>
            </div>

            {/* Folder Main Pocket Body with seamless cutout tab connection */}
            <div className="bg-[#FAF6EE] border-2 border-[#D5CABB] rounded-2xl rounded-tl-none py-5 sm:py-7 px-4 sm:px-8 shadow-xl relative z-10 overflow-hidden">
              {/* Folder Internal Paper Watermark */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(#D5CABB_1px,transparent_1px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

              {/* Folder Pocket Header */}
              <div className="mb-4 sm:mb-5 pb-3 border-b border-[#E8DEC9] relative">
                {/* Meta Badge clean top row */}
                <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-[#A89C8C]">REF: DOSSIER-APEX-2026</span>
                  <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 inline-block font-mono">
                    SEC-LEVEL 4
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#2C241E]">
                    {activeInvitationToken
                      ? 'Organization Workspace Invitation'
                      : authMode === 'signin'
                      ? 'Archival Member Clearance'
                      : 'Agent Dossier Registration'}
                  </h3>
                  <p className="text-[11px] text-[#7C6F60] mt-1 font-medium leading-relaxed">
                    {activeInvitationToken
                      ? `You've been invited to join "${invitationDetails?.organization_name || 'Apex Studio Agency'}" as a ${invitationDetails?.role || 'team member'}.`
                      : authMode === 'signin'
                      ? 'Verify your credentials to unlock active workspaces.'
                      : 'Enter your credentials to generate a classified workspace.'}
                  </p>
                </div>
              </div>

              {/* ClickUp-style Invitation Banner if arriving via email link */}
              {activeInvitationToken && (
                <div className="mb-4 p-3.5 bg-[#EFE8DC] border border-[#8C7E6C] rounded-xl flex items-start space-x-3 shadow-xs">
                  <div className="p-2 bg-[#2B231D] text-[#FAF6EE] rounded-lg shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#2A231D]">
                      Join {invitationDetails?.organization_name || 'Apex Studio Agency'}
                    </p>
                    <p className="text-[11px] text-[#6B5E4F] mt-0.5">
                      Invited as <span className="font-semibold text-[#2A231D]">{invitationDetails?.role || 'Developer'}</span> for{' '}
                      <span className="font-semibold text-[#2A231D]">{authEmail}</span>. Set your name & password to enter immediately.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={activeInvitationToken ? handleAcceptInvite : handleAuthSubmit} className="space-y-4">
                {(authMode === 'signup' || activeInvitationToken) && (
                  <div>
                    <label className="block text-xs font-bold text-[#2C2621] mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Mason Walker"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-xl text-[#2C2621] placeholder-[#A4988A] focus:outline-hidden focus:ring-1 focus:ring-[#3F3730] shadow-2xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#A4988A]" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-xl text-[#2C2621] placeholder-[#A4988A] focus:outline-hidden focus:ring-1 focus:ring-[#3F3730] shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#2C2621]">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to registered email.'); }} className="text-[11px] font-semibold text-[#6E6356] hover:underline">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#A4988A]" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={activeInvitationToken ? inviteAcceptPassword : authPassword}
                      onChange={(e) => {
                        setAuthPassword(e.target.value);
                        setInviteAcceptPassword(e.target.value);
                      }}
                      className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-[#D5CABB] rounded-xl text-[#2C2621] placeholder-[#A4988A] focus:outline-hidden focus:ring-1 focus:ring-[#3F3730] shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A4988A] hover:text-[#2C2621]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#3F3730] text-[#FAF6EE] text-xs font-bold hover:bg-[#2C2621] transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>
                      {activeInvitationToken
                        ? `Accept Invite & Join ${invitationDetails?.organization_name || 'Organization'}`
                        : authMode === 'signin'
                        ? 'Sign in to Dossier'
                        : 'Create Archival Workspace'}
                    </span>
                  </button>
                </div>
              </form>

              {/* Divider with vintage stitches */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-[#D5CABB]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#FAF6EE] text-[#8C8072] font-semibold uppercase text-[10px] tracking-wider">
                    or authenticate with
                  </span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-[#D5CABB] text-xs font-semibold text-[#2C2621] hover:bg-[#F5EFEB] transition-colors flex items-center justify-center shadow-2xs"
                >
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Toggle Sign Up / Sign In footer */}
              <div className="text-center mt-5 pt-3 border-t border-[#E8DEC9]">
                <p className="text-xs text-[#7A7064]">
                  {authMode === 'signin' ? 'New to Archival PM? ' : 'Already have an account? '}
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                    className="font-black text-[#2E2721] hover:underline"
                  >
                    {authMode === 'signin' ? 'Create new account' : 'Sign in here'}
                  </button>
                </p>
              </div>

              {/* Replay splash button */}
              <div className="text-center mt-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('splash')}
                  className="text-[11px] text-[#8C8072] hover:text-[#3F3730] inline-flex items-center space-x-1"
                >
                  <Folder className="w-3 h-3" />
                  <span>Replay folder opening animation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2b. Organization Onboarding / Setup Screen
  if (currentScreen === 'org_setup') {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-[#E8DECA]">
        <div className="absolute inset-0 bg-[radial-gradient(#D5C8B2_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-[#3F3730] text-[#FAF6EE] flex items-center justify-center mx-auto shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#2C2621]">
              Create Your Organization
            </h2>
            <p className="mt-1 text-xs text-[#7A7064]">
              Organizations house your task folders, dossiers, and project management boards.
            </p>
          </div>

          <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-[#FAF6EE] py-8 px-6 sm:px-8 shadow-sm border border-[#DCD1BC] rounded-2xl">
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Studio Agency, Horizon Media..."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-lg text-[#2C2621] placeholder-[#A4988A] focus:outline-none focus:ring-1 focus:ring-[#3F3730]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">
                    Description or Industry
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of what your team or organization builds..."
                    value={newOrgDescription}
                    onChange={(e) => setNewOrgDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-lg text-[#2C2621] placeholder-[#A4988A] focus:outline-none focus:ring-1 focus:ring-[#3F3730]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-[#3F3730] text-[#FAF6EE] text-xs font-bold hover:bg-[#2C2621] transition-colors shadow-sm flex items-center justify-center space-x-2"
                  >
                    <span>Create Organization & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {organizations.length > 0 && (
                <div className="text-center mt-5 pt-4 border-t border-[#E8DEC9]">
                  <p className="text-xs text-[#7A7064]">
                    Already have an organization?{' '}
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('folder_hub')}
                      className="font-bold text-[#3F3730] hover:underline"
                    >
                      Go to Folder Hub
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2c. Task Folders & Dossiers Hub Screen
  if (currentScreen === 'folder_hub') {
    return (
      <div className="min-h-screen bg-[#F5EFEB] text-[#2C2621] flex flex-col justify-between selection:bg-[#E8DECA] relative overflow-x-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#D5C8B2_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-35 pointer-events-none" />

        {/* Top Header */}
        <header className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#EFE8DC] border-b border-[#DCD1BC] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-9 sm:pt-4 relative z-50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#3F3730] text-[#FAF6EE] flex items-center justify-center shadow-sm shrink-0">
              <Folder className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[#2C241E] whitespace-nowrap">Archival PM</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#E4DAC7] text-[#5A5046] border border-[#D5CABB] whitespace-nowrap">
                  Folder Hub
                </span>
              </div>
              <p className="text-[11px] text-[#7A7064] font-medium truncate">Select a dossier task folder to open its Kanban board</p>
            </div>
          </div>

          {/* Org Selector & Controls */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial min-w-[170px]">
              <ArchivalSelect
                value={currentOrg.id}
                onChange={(val) => {
                  const found = organizations.find(o => o.id === val);
                  if (found) {
                    setCurrentOrg(found);
                    if (found.folders && found.folders.length > 0) {
                      setCurrentFolder(found.folders[0]);
                    }
                  }
                }}
                options={organizations.map(org => ({
                  value: org.id,
                  label: org.name,
                  icon: <Building2 className="w-3.5 h-3.5 text-[#8C7E6C]" />
                }))}
                title="Select Active Organization"
              />
            </div>

            <button
              onClick={() => setIsNewOrgModalOpen(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#EFE8DC] border border-[#D5CABB] text-xs font-semibold text-[#433A31] transition-colors flex items-center space-x-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Org</span>
            </button>

            <button
              onClick={() => setIsNewFolderModalOpen(true)}
              className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#3F3730] text-[#FAF6EE] text-xs font-bold hover:bg-[#2C2621] transition-colors shadow-xs flex items-center space-x-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Folder</span>
            </button>

            <button
              onClick={() => setCurrentScreen('auth')}
              className="p-1.5 rounded-lg bg-[#FAF6EE] border border-[#D5CABB] text-[#7A7064] hover:text-[#2C2621] shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tactile Organization Tabs Strip */}
        <div className="bg-[#EAE0D0] border-b border-[#D5CABB] px-4 sm:px-6 py-2 relative z-40">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A7064] mr-1 hidden sm:inline">
                Workspace:
              </span>
              {organizations.map(org => {
                const isActive = org.id === currentOrg.id;
                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => {
                      setCurrentOrg(org);
                      if (org.folders && org.folders.length > 0) {
                        setCurrentFolder(org.folders[0]);
                      }
                    }}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#2E2721] text-[#FAF6EE] border-[#2E2721] shadow-sm'
                        : 'bg-[#FAF6EE] text-[#5A5046] border-[#D5CABB] hover:bg-[#F3ECE1] hover:text-[#2C241E]'
                    }`}
                  >
                    <Building2 className={`w-3.5 h-3.5 ${isActive ? 'text-[#DCD1BC]' : 'text-[#8C7E6C]'}`} />
                    <span className="truncate max-w-[150px]">{org.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold ${
                      isActive ? 'bg-white/20 text-[#FAF6EE]' : 'bg-[#E4DAC7] text-[#554A3E]'
                    }`}>
                      {org.folders ? org.folders.length : 0}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setIsNewOrgModalOpen(true)}
                className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#665B4E] hover:text-[#2C241E] hover:bg-[#DFD4C0] border border-dashed border-[#C5B7A0] transition-colors shrink-0 cursor-pointer"
                title="Create New Organization Workspace"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Folder Grid */}
        <main className="max-w-6xl mx-auto w-full px-6 py-10 flex-1 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-[#DCD1BC]">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#E8DECA] text-[#5A5046] border border-[#D5CABB] text-[11px] font-semibold uppercase tracking-wider mb-2">
                <Building2 className="w-3 h-3 text-amber-700" />
                <span>{currentOrg.name}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C241E] tracking-tight">
                Classified Task Folders
              </h1>
              <p className="text-xs text-[#7A7064] mt-1 max-w-xl">
                {currentOrg.description || 'Each folder contains independent Kanban boards, subtask checklists, and classified notes.'}
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center space-x-2">
              <span className="text-xs text-[#7A7064] font-medium">
                {currentOrg.folders.length} {currentOrg.folders.length === 1 ? 'Folder' : 'Folders'} Available
              </span>
            </div>
          </div>

          {/* Grid of Manila Folders */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentOrg.folders.map(folder => {
              const colorStyle = getColorStyles(folder.color);
              return (
                <div
                  key={folder.id}
                  onClick={() => {
                    setCurrentFolder(folder);
                    setCurrentScreen('app');
                  }}
                  className="group relative cursor-pointer"
                >
                  {/* Folder Tab Cutout on Top Left */}
                  <div className="w-36 h-5 rounded-t-lg bg-[#E2D5BA] group-hover:bg-[#DACBB0] border-t-2 border-l-2 border-r-2 border-[#C6B695] px-3 flex items-center transition-colors">
                    <span className="text-[9px] font-mono font-bold text-[#6B5D48] tracking-widest uppercase">
                      {folder.code}
                    </span>
                  </div>

                  {/* Folder Body Card */}
                  <div className="bg-[#FAF6EE] group-hover:bg-white rounded-b-2xl rounded-tr-2xl border-2 border-[#C6B695] p-5 shadow-sm group-hover:shadow-md transition-all relative overflow-hidden">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-[#EFE8DA] flex items-center justify-center text-[#5C4F3F] group-hover:bg-[#3F3730] group-hover:text-[#FAF6EE] transition-colors border border-[#DCD1BC]">
                        <Folder className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${colorStyle.tagBg} ${colorStyle.tagText}`}>
                        {folder.color}
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-bold text-[#2C241E] group-hover:text-[#1A1410] transition-colors">
                        {folder.name}
                      </h3>
                      <p className="text-xs text-[#7A7064] mt-1 line-clamp-2 leading-relaxed">
                        {folder.description || 'Task management board with interactive checklist physics and pastel palettes.'}
                      </p>
                    </div>

                    {/* Stats & Launch Action */}
                    <div className="mt-6 pt-3 border-t border-[#EAE1D1] flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-xs text-[#6B5F50] font-medium">
                        <Layers className="w-3.5 h-3.5 text-[#8C8072]" />
                        <span>Kanban Board</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs font-bold text-[#3F3730] group-hover:translate-x-1 transition-transform">
                        <span>Open Board</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Add Folder Card */}
            <div
              onClick={() => setIsNewFolderModalOpen(true)}
              className="border-2 border-dashed border-[#CFC0A4] hover:border-[#8E7E65] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F7F1E7]/50 hover:bg-[#F2ECE0] transition-colors min-h-[200px]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8DECA] flex items-center justify-center text-[#5A4E3F] mb-3">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-[#2C241E]">Create New Task Folder</p>
              <p className="text-xs text-[#7A7064] mt-1 max-w-xs">
                Add another folder dossier for a specific project, client, or team sprint.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 bg-[#EFE8DC] border-t border-[#DCD1BC] flex items-center justify-between text-xs text-[#7A7064] relative z-10">
          <span>Archival PM Dossier System • Organization: {currentOrg.name}</span>
          <button
            onClick={() => setCurrentScreen('splash')}
            className="hover:text-[#2C2621] font-semibold underline"
          >
            Replay 3D Opening Animation
          </button>
        </footer>

        {/* Modal: Create Organization */}
        {isNewOrgModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-[#FAF6EE] rounded-2xl border border-[#D5CABB] shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC9]">
                <h3 className="text-base font-bold text-[#2C241E] flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-amber-800" />
                  <span>Create New Organization</span>
                </h3>
                <button onClick={() => setIsNewOrgModalOpen(false)} className="text-[#8C8072] hover:text-[#2C241E]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateOrganization} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">Organization Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Horizon Labs, Nordic Studio..."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-lg text-[#2C2621] placeholder-[#A4988A] focus:outline-none focus:ring-1 focus:ring-[#3F3730]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Focus areas, teams or client scope..."
                    value={newOrgDescription}
                    onChange={(e) => setNewOrgDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-lg text-[#2C2621] placeholder-[#A4988A] focus:outline-none focus:ring-1 focus:ring-[#3F3730]"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewOrgModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#D5CABB] text-xs font-semibold text-[#5A5046] hover:bg-[#EFE8DC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#3F3730] text-[#FAF6EE] text-xs font-bold hover:bg-[#2C2621]"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Task Folder */}
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-[#FAF6EE] rounded-2xl border border-[#D5CABB] shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC9]">
                <h3 className="text-base font-bold text-[#2C241E] flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-amber-800" />
                  <span>Create Task Folder Dossier</span>
                </h3>
                <button onClick={() => setIsNewFolderModalOpen(false)} className="text-[#8C8072] hover:text-[#2C241E]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateFolder} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">Folder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mobile App Redesign, Q3 Marketing..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-lg text-[#2C2621] placeholder-[#A4988A] focus:outline-none focus:ring-1 focus:ring-[#3F3730]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">Dossier Code (Notch Label)</label>
                  <input
                    type="text"
                    placeholder="e.g. DOSSIER-04, PROJ-ALPHA"
                    value={newFolderCode}
                    onChange={(e) => setNewFolderCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-lg text-[#2C2621] placeholder-[#A4988A] focus:outline-none focus:ring-1 focus:ring-[#3F3730]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="What goals are tracked in this folder?"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#D5CABB] rounded-lg text-[#2C2621] placeholder-[#A4988A] focus:outline-none focus:ring-1 focus:ring-[#3F3730]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C2621] mb-1">Folder Theme Color</label>
                  <div className="flex space-x-2">
                    {(['peach', 'mint', 'blue', 'purple', 'coral', 'canary'] as CardColor[]).map(c => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewFolderColor(c)}
                        className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center capitalize text-[10px] font-bold ${
                          newFolderColor === c ? 'border-[#3F3730] scale-110 shadow-xs' : 'border-transparent'
                        }`}
                        style={{
                          backgroundColor:
                            c === 'peach' ? '#FFE2C2' :
                            c === 'mint' ? '#D1F7E2' :
                            c === 'blue' ? '#D6E6FE' :
                            c === 'purple' ? '#E5D7FF' :
                            c === 'coral' ? '#FFE0E0' : '#FEF08A'
                        }}
                      >
                        {newFolderColor === c && '✓'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg border border-[#D5CABB] text-xs font-semibold text-[#5A5046] hover:bg-[#EFE8DC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#3F3730] text-[#FAF6EE] text-xs font-bold hover:bg-[#2C2621]"
                  >
                    Create Task Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Main Application Screen (Board for currentFolder)
  return (
    <div className="h-screen bg-[#FAF6EE] text-[#2C2621] flex flex-col antialiased selection:bg-[#E8DECA] overflow-hidden">
      {/* Top Manila Folder Cutout Tab Header */}
      <header className="bg-[#EFE8DC] border-b border-[#DCD1BC] select-none pt-8 sm:pt-0 relative z-40 shrink-0">
        {/* Upper Row: Breadcrumbs & Utility Actions */}
        <div className="px-2 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between border-b border-[#E4DAC7] gap-2 min-w-0">
          {/* Organization & Active Folder Breadcrumb with Return to Hub */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 flex-1 min-w-0 mr-1 sm:mr-0">
            {/* Mobile Hamburger / Sidebar Toggle */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg bg-[#FAF6EE] hover:bg-[#EAE0CF] active:scale-95 border border-[#D5CABB] text-[#3F3730] shadow-2xs touch-target flex items-center justify-center shrink-0"
              title={isSidebarOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

            {/* Desktop Return to Folder Hub button */}
            <button
              onClick={() => setCurrentScreen('folder_hub')}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#3F3730] hover:bg-[#2B241E] flex items-center justify-center text-[#FAF6EE] shadow-sm transition-transform hover:scale-105 shrink-0 hidden sm:flex"
              title="Return to Folder Hub"
            >
              <Folder className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Organization Dropdown (hidden on small mobile; on mobile, switched from Folder Hub or Sidebar to keep header clean) */}
            <div className="hidden sm:block relative min-w-[150px] max-w-[200px] dropdown-container shrink-0" data-dropdown="true">
              <ArchivalSelect
                value={currentOrg.id}
                onChange={(val) => {
                  const found = organizations.find(o => o.id === val);
                  if (found) {
                    setCurrentOrg(found);
                    if (found.folders && found.folders.length > 0) {
                      setCurrentFolder(found.folders[0]);
                    }
                  }
                }}
                options={organizations.map(org => ({
                  value: org.id,
                  label: org.name,
                  icon: <Building2 className="w-3.5 h-3.5 text-[#8C7E6C]" />
                }))}
                title="Switch Organization"
              />
            </div>

            <span className="text-[#8C8072] text-xs shrink-0 hidden sm:inline">/</span>

            {/* Active Folder Badge / Return to Folder Hub */}
            <button
              onClick={() => setCurrentScreen('folder_hub')}
              className="text-xs font-bold text-[#8A4A1C] bg-[#F4E9D5] hover:bg-[#EBDDC5] px-2.5 py-1.5 rounded-lg border border-[#DFD1B8] shadow-2xs inline-flex items-center space-x-1.5 min-w-0 transition-colors max-w-full"
              title="Switch folder or view Folder Hub"
            >
              <Folder className="w-3.5 h-3.5 text-[#A66030] shrink-0" />
              <span className="truncate">{currentFolder.name}</span>
              <span className="font-mono text-[9px] text-[#A66030] font-extrabold bg-[#DFCFB7] px-1.5 py-0.2 rounded shrink-0 hidden md:inline">
                {formatFolderCode(currentFolder.code)}
              </span>
            </button>
          </div>

          {/* Right Controls: Search, Notifications, Profile */}
          <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
            <div className="relative hidden xs:block sm:block">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D7366]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF6EE] border border-[#D8CDBC] rounded-lg text-[#2C2621] placeholder-[#9E9486] focus:outline-none focus:ring-1 focus:ring-[#8E8070] w-24 sm:w-52 shadow-inner"
              />
            </div>

            <div className="relative dropdown-container" data-dropdown="true">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    setUnreadNotificationsCount(0);
                  }
                }}
                className="p-1 sm:p-1.5 bg-[#FAF6EE] border border-[#D8CDBC] rounded-lg text-[#52493E] hover:bg-[#F2ECE0] relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-600 rounded-full border-2 border-[#FAF6EE] animate-pulse"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FAF6EE] border border-[#D8CDBC] rounded-xl shadow-xl z-50 p-3">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8DEC9]">
                    <span className="text-xs font-bold text-[#2C241E]">Live Events (WebSockets)</span>
                    <button
                      onClick={() => setUnreadNotificationsCount(0)}
                      className="text-[10px] text-[#867B6F] hover:text-[#2C241E] font-medium"
                    >
                      {unreadNotificationsCount > 0 ? `${unreadNotificationsCount} unread` : 'All read'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs p-2 rounded-lg bg-[#F3ECDD] border border-[#E4DAC7]">
                        <p className="text-[#322A23] font-medium leading-snug">{n.text}</p>
                        <span className="text-[10px] text-[#8C8072] mt-0.5 block">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative pl-1 sm:pl-2 border-l border-[#DCD1BC] dropdown-container" data-dropdown="true">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-left hover:opacity-85 transition-opacity"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-[#C5B8A1] object-cover"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-[#2A231D] leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-[#7A7064] leading-tight">{currentUser.email}</p>
                </div>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#FAF6EE] border border-[#D8CDBC] rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-[#E8DEC9] mb-1">
                    <p className="text-xs font-bold text-[#2C241E]">{currentUser.name}</p>
                    <p className="text-[10px] text-[#7A7064] truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentScreen('folder_hub');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#433A31] hover:bg-[#F2ECE0] rounded-lg flex items-center space-x-2 transition-colors font-medium"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#73695F]" />
                    <span>Folder Hub & Organizations</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentScreen('splash');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#433A31] hover:bg-[#F2ECE0] rounded-lg flex items-center space-x-2 transition-colors font-medium mt-0.5"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-[#73695F]" />
                    <span>Replay Folder Opening</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setCurrentScreen('auth');
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-700 hover:bg-[#FBEBE8] rounded-lg flex items-center space-x-2 transition-colors font-medium mt-0.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Row: Full-width Folder Cutout Slips that dock cleanly into the canvas */}
        <div className="px-2 sm:px-6 pt-1.5 sm:pt-2 flex items-center overflow-x-auto no-scrollbar max-w-full">
          <nav className="flex space-x-1 sm:space-x-2 -mb-[1px] min-w-max">
            {[
              { id: 'board' as const, label: 'Kanban Boards', shortLabel: 'Boards', count: currentOrgTasks.length },
              { id: 'products' as const, label: 'Products & Deliverables', shortLabel: 'Products', count: currentOrgProducts.length },
              { id: 'clients' as const, label: 'Client Accounts', shortLabel: 'Clients', count: clients.length },
              { id: 'schedule' as const, label: 'Schedule & Timeline', shortLabel: 'Timeline', count: currentOrgSchedules.length },
              { id: 'notes' as const, label: 'Dossier Notes', shortLabel: 'Notes', count: currentOrgNotes.length },
              { id: 'reports' as const, label: 'Activity Logs', shortLabel: 'Logs' },
              { id: 'team' as const, label: 'Team Members', shortLabel: 'Team', count: teamMembers.length },
              { id: 'settings' as const, label: 'System Settings', shortLabel: 'Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`folder-tab px-3 sm:px-5 py-2 sm:py-2.5 text-xs font-semibold rounded-t-lg border-t border-x transition-all flex items-center space-x-1.5 sm:space-x-2 ${
                  activeTab === tab.id
                    ? 'active bg-[#FAF6EE] text-[#2C241E] border-[#DCD1BC] shadow-sm font-bold'
                    : 'bg-[#E5DCCB]/60 text-[#786D61] border-[#D9CEBC] hover:bg-[#EFE8DC] hover:text-[#3B332B]'
                }`}
              >
                <span className="sm:inline hidden">{tab.label}</span>
                <span className="sm:hidden inline font-bold">{tab.shortLabel}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] rounded-full font-bold leading-none ${
                    activeTab === tab.id ? 'bg-[#3F3730] text-[#FAF6EE]' : 'bg-[#DCD1BC] text-[#554C42]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Body with Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Backdrop Overlay */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-[#2C2621]/40 backdrop-blur-xs z-30 transition-opacity"
            title="Close sidebar"
          />
        )}

        {/* Left Sidebar (Image 1 Style) */}
        <aside
          className={`bg-[#FAF6EE] border-r border-[#DCD1BC] flex flex-col h-full py-4 px-3 select-none transition-all duration-300 ease-in-out z-40 md:z-20 shrink-0 shadow-lg md:shadow-none fixed md:relative inset-y-0 left-0 pt-10 md:pt-4 bottom-0 ${
            isSidebarOpen ? 'w-64 md:w-60 translate-x-0 opacity-100' : 'w-0 p-0 -translate-x-full opacity-0 overflow-hidden border-r-0'
          }`}
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-2 text-[#463D34] shrink-0 mb-4">
            <button
              onClick={() => setCurrentScreen('folder_hub')}
              className="flex items-center space-x-2 text-left hover:text-[#2C241E] group transition-colors"
              title="Return to Folder Hub"
            >
              <div className="p-1 rounded-md bg-[#FAF6EE] border border-[#DCD1BC] group-hover:bg-[#EFE8DC] text-[#463D34] transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-extrabold tracking-tight text-[#2B241E]">Folders Hub</span>
            </button>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#FAF6EE] border border-transparent hover:border-[#DCD1BC] text-[#7A7064] hover:text-[#2C241E] transition-colors"
              title="Hide sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Navigation Body */}
          <div className="flex-1 overflow-y-auto space-y-5 no-scrollbar pr-0.5">
            <div>
              <p className="text-[10px] font-bold text-[#8C8072] tracking-wider px-2 uppercase mb-1.5">Main</p>
              <nav className="space-y-0.5">
                {[
                  { id: 'board', icon: LayoutDashboard, label: 'Dashboard' },
                  { id: 'schedule', icon: CalendarIcon, label: 'Schedule' },
                  { id: 'notes', icon: FileText, label: 'Note' },
                  { id: 'products', icon: Package, label: 'Products' },
                  { id: 'reports', icon: BarChart3, label: 'Report' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#FAF6EE] text-[#2C241E] font-bold shadow-sm border border-[#DCD1BC]'
                          : 'text-[#61574C] hover:bg-[#FAF6EE] hover:text-[#2C241E]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#756A5E]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="text-[10px] font-bold text-[#8C8072] tracking-wider px-2 uppercase mb-1.5">Records</p>
              <nav className="space-y-0.5">
                <button
                  onClick={() => setActiveTab('team')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'team'
                      ? 'bg-[#FAF6EE] text-[#2C241E] font-bold shadow-sm border border-[#DCD1BC]'
                      : 'text-[#61574C] hover:bg-[#FAF6EE] hover:text-[#2C241E]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className="w-4 h-4 text-[#756A5E]" />
                    <span>Team</span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-[#EAE0CF] text-[#554C42]">
                      {teamMembers.length}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#9C9081]" />
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'clients'
                      ? 'bg-[#FAF6EE] text-[#2C241E] font-bold shadow-sm border border-[#DCD1BC]'
                      : 'text-[#61574C] hover:bg-[#FAF6EE] hover:text-[#2C241E]'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Briefcase className="w-4 h-4 text-[#756A5E]" />
                    <span>Clients</span>
                  </div>
                  <span className="flex items-center space-x-1">
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full font-bold bg-[#EAE0CF] text-[#554C42]">
                      {clients.length}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#9C9081]" />
                  </span>
                </button>
              </nav>
            </div>

            {/* Active Project / Folder Live Progress Card */}
            {(() => {
              const activeFolderTasks = currentOrgTasks;
              const totalActiveTasks = activeFolderTasks.length;
              const completedActiveTasks = activeFolderTasks.filter(t => t.columnId === 'inreview' || t.progress === 100).length;
              const liveFolderPercent = totalActiveTasks > 0 ? Math.round((completedActiveTasks / totalActiveTasks) * 100) : 0;

              return (
                <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#DCD1BC] shadow-2xs text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#837666]">Active Folder</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="font-bold text-[#2A231D] text-xs truncate" title={currentFolder.name}>
                    {currentFolder.name}
                  </p>
                  <div className="w-full bg-[#E8DEC9] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#463D34] h-full rounded-full transition-all duration-300"
                      style={{ width: `${liveFolderPercent}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-[#7A7064]">
                    <span>{completedActiveTasks}/{totalActiveTasks} Completed</span>
                    <span className="font-bold text-[#3B322A]">{liveFolderPercent}%</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Pinned Bottom Footer (Uniform & Constant Sequence) */}
          <div className="shrink-0 pt-3 mt-auto border-t border-[#DCD1BC] space-y-0.5">
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#FAF6EE] text-[#2C241E] font-bold shadow-sm border border-[#DCD1BC]'
                  : 'text-[#61574C] hover:bg-[#FAF6EE] hover:text-[#2C241E]'
              }`}
            >
              <Settings className="w-4 h-4 text-[#756A5E]" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                alert('Archival PM System Documentation & Support is active. Contact sys1.admin.system@gmail.com for enterprise inquiries.');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#61574C] hover:bg-[#FAF6EE] transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#756A5E]" />
              <span>Support</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Main View */}
        <main className="flex-1 bg-[#FAF6EE] overflow-y-auto p-4 sm:p-6 flex flex-col relative">
          {/* VIEW 1: KANBAN BOARD */}
          {activeTab === 'board' && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 sm:pb-6 mb-4 sm:mb-6 border-b border-[#E5DBCA] gap-4">
                <div className="flex items-start space-x-3.5">
                  {!isSidebarOpen && (
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="mt-0.5 px-3 py-1.5 rounded-lg bg-[#EFE8DC] hover:bg-[#E8DECA] border border-[#DCD1BC] text-xs font-bold text-[#3F3730] shadow-2xs flex items-center space-x-1.5 transition-all shrink-0 touch-target"
                      title="Show Folders sidebar"
                    >
                      <PanelLeftOpen className="w-4 h-4" />
                      <span className="hidden sm:inline">Show Folders</span>
                    </button>
                  )}
                  <div>
                    <p className="text-xs text-[#7B7062] font-medium flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{getRealTimeDateFormatted()}</span>
                    </p>
                    <h1 className="text-xl sm:text-2xl font-black text-[#26201A] tracking-tight mt-0.5 flex items-center space-x-2">
                      <span>Task Management Board</span>
                      <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F3ECDE] border border-[#D8CEBC] text-[#695D50]">
                        Sprint #3
                      </span>
                    </h1>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex items-center -space-x-1.5 mr-2">
                    {[
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
                      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces'
                    ].map((src, i) => (
                      <img key={i} src={src} alt="collaborator" className="w-7 h-7 rounded-full border-2 border-[#FAF6EE] object-cover shadow-sm" />
                    ))}
                    <span className="w-7 h-7 rounded-full bg-[#E8DFC9] border-2 border-[#FAF6EE] text-[10px] font-bold text-[#574C40] flex items-center justify-center">
                      +3
                    </span>
                  </div>

                  {/* Multi-Product Filter Dropdown */}
                  <div className="relative flex-1 sm:flex-initial min-w-[170px]">
                    <ArchivalSelect
                      value={boardProductFilter}
                      onChange={(val) => setBoardProductFilter(val)}
                      options={[
                        { value: 'all', label: `All Products (${currentOrgTasks.length})`, icon: <Boxes className="w-3.5 h-3.5 text-[#8C7E6C]" /> },
                        ...currentOrgProducts.map(p => ({
                          value: p.name,
                          label: p.name,
                          badge: p.code,
                          icon: <Package className="w-3.5 h-3.5 text-[#8C7E6C]" />
                        }))
                      ]}
                      title="Filter board by specific product deliverable"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setNewTaskTargetColumn('todo');
                      setIsNewTaskModalOpen(true);
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#2E2721] text-[#FAF6EE] text-xs font-bold hover:bg-[#463D34] shadow-md transition-all active:scale-95 touch-target"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Task</span>
                  </button>
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 items-start">
                {columns.map(column => {
                  const columnTasks = filteredTasks.filter(t => t.columnId === column.id);

                  return (
                    <div key={column.id} className="bg-[#F5EFEB]/90 rounded-2xl border border-[#DCD1BC] p-4 flex flex-col shadow-sm">
                      <div className="flex items-center justify-between pb-3.5 mb-1 px-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#8A7D6F]">▸</span>
                          <h2 className="text-sm font-black text-[#2A231D] tracking-tight">{column.title}</h2>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8DECA] font-bold text-[#554B3E]">
                            {column.count}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setNewTaskTargetColumn(column.id as any);
                              setIsNewTaskModalOpen(true);
                            }}
                            className="p-1 rounded-md text-[#786D60] hover:text-[#26201A] hover:bg-[#EAE0CD] transition-colors"
                            title="Add task"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button className="p-1 rounded-md text-[#786D60] hover:text-[#26201A] hover:bg-[#EAE0CD] transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Task Cards */}
                      <div className="space-y-3.5">
                        {columnTasks.map(task => {
                          const style = getColorStyles(task.color);

                          return (
                            <div
                              key={task.id}
                              onClick={() => setSelectedTask(task)}
                              className={`${style.bg} border ${style.border} rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.99] relative ${
                                cardMenuOpenId === task.id ? 'z-40 shadow-lg' : 'z-10'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                                  {task.product_name && (
                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/10 text-[#2B231D] font-mono flex items-center space-x-1" title={`Belongs to product: ${task.product_name}`}>
                                      <Package className="w-2.5 h-2.5 text-[#5C4F41]" />
                                      <span>{task.product_name}</span>
                                    </span>
                                  )}
                                  {task.tags.map((tag, idx) => (
                                    <span key={idx} className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.tagBg} ${style.tagText}`}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                                <div className="flex items-center space-x-1">
                                  {/* Quick Color Swatch changer dot on card */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const order: CardColor[] = ['blue', 'peach', 'purple', 'mint', 'coral', 'canary'];
                                      const nextColor = order[(order.indexOf(task.color) + 1) % order.length];
                                      handleTaskColorChange(task.id, nextColor);
                                    }}
                                    className="p-1 rounded-full hover:bg-black/10 transition-colors"
                                    title="Click to cycle card color"
                                  >
                                    <Palette className="w-3.5 h-3.5 text-[#7A6D5E]" />
                                  </button>
                                  {/* Contextual 3-Dots Dropdown Menu */}
                                  <div className="relative dropdown-container" data-dropdown="true" data-card-menu="true">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCardMenuOpenId(cardMenuOpenId === task.id ? null : task.id);
                                      }}
                                      className="text-[#877969] hover:text-[#2E2721] p-1 rounded-md hover:bg-black/10 transition-colors"
                                      title="Card options"
                                    >
                                      <MoreVertical className="w-3.5 h-3.5" />
                                    </button>

                                    {cardMenuOpenId === task.id && (
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        data-dropdown="true"
                                        data-card-menu="true"
                                        className="dropdown-container absolute right-0 mt-1 w-48 bg-[#FAF6EE] border border-[#D5CABB] rounded-xl shadow-2xl z-50 py-1.5 text-xs animate-in fade-in zoom-in-95 duration-100"
                                      >
                                        {/* Edit / Open */}
                                        <button
                                          type="button"
                                          onMouseDown={(e) => e.stopPropagation()}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTask(task);
                                            setCardMenuOpenId(null);
                                          }}
                                          className="w-full text-left px-3 py-1.5 flex items-center space-x-2 text-[#3A3026] hover:bg-[#EFE8DC] font-medium transition-colors"
                                        >
                                          <Pencil className="w-3.5 h-3.5 text-[#7A6D5E]" />
                                          <span>Edit / Open Details</span>
                                        </button>

                                        {/* Duplicate Card */}
                                        <button
                                          type="button"
                                          onMouseDown={(e) => e.stopPropagation()}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDuplicateTask(task);
                                          }}
                                          className="w-full text-left px-3 py-1.5 flex items-center space-x-2 text-[#3A3026] hover:bg-[#EFE8DC] font-medium transition-colors"
                                        >
                                          <Copy className="w-3.5 h-3.5 text-[#7A6D5E]" />
                                          <span>Duplicate Card</span>
                                        </button>

                                        {/* Move to Column Submenu */}
                                        <div className="px-3 pt-1.5 pb-0.5 border-t border-[#E8DEC9] text-[10px] font-bold text-[#8C7F70] uppercase tracking-wider">
                                          Move To Column
                                        </div>
                                        {(['todo', 'inprogress', 'inreview'] as const).map(col => {
                                          const isCurrent = task.columnId === col;
                                          const labels = { todo: 'Todo list', inprogress: 'In Progress', inreview: 'In Review' };
                                          return (
                                            <button
                                              key={col}
                                              type="button"
                                              disabled={isCurrent}
                                              onMouseDown={(e) => e.stopPropagation()}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                moveTask(task.id, col);
                                              }}
                                              className={`w-full text-left px-3 py-1 flex items-center justify-between text-xs font-medium transition-colors ${
                                                isCurrent
                                                  ? 'opacity-40 cursor-default bg-black/5 text-[#8A7D6F]'
                                                  : 'text-[#3A3026] hover:bg-[#EFE8DC]'
                                              }`}
                                            >
                                              <span>{labels[col]}</span>
                                              {isCurrent ? <span className="text-[10px] font-bold">Active</span> : <ArrowRight className="w-3 h-3 text-[#9C8F7F]" />}
                                            </button>
                                          );
                                        })}

                                        {/* Delete Card Option */}
                                        <div className="border-t border-[#E8DEC9] mt-1 pt-1">
                                          <button
                                            type="button"
                                            onMouseDown={(e) => e.stopPropagation()}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteTask(task.id);
                                            }}
                                            className="w-full text-left px-3 py-1.5 flex items-center space-x-2 text-rose-700 hover:bg-rose-50 font-bold transition-colors"
                                          >
                                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                            <span>Delete Card</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <h3 className={`text-sm font-bold ${style.textColor} leading-snug mb-2`}>
                                {task.title}
                              </h3>

                              {task.note && (
                                <p className="text-[11px] font-medium text-[#7D7060] mb-3 italic">
                                  {task.note}
                                </p>
                              )}

                              {task.subtasks && task.subtasks.length > 0 ? (
                                <div className="space-y-1.5 mb-3 bg-white/50 p-2.5 rounded-xl border border-black/5 shadow-xs">
                                  {task.subtasks.map(st => (
                                    <div
                                      key={st.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSubtask(task.id, st.id);
                                      }}
                                      className="flex items-center space-x-2 text-xs text-[#3E342B] cursor-pointer hover:opacity-80"
                                    >
                                      {st.completed ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                                      ) : (
                                        <Circle className="w-3.5 h-3.5 text-purple-300 hover:text-purple-600 flex-shrink-0" />
                                      )}
                                      <span className={st.completed ? 'line-through text-[#8E8072]' : 'font-medium'}>
                                        {st.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTask(task);
                                  }}
                                  className="mb-2 text-[11px] font-semibold text-[#8C7F70] hover:text-[#2C241E] flex items-center space-x-1 opacity-75 hover:opacity-100 transition-opacity"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add checklist</span>
                                </button>
                              )}

                              {task.hasImagePreview && (
                                <div className="mb-3 rounded-xl overflow-hidden border border-[#E4D1B8] bg-white p-2 shadow-inner">
                                  <div className="h-16 rounded-lg bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center text-[10px] font-bold text-amber-800">
                                    🖼️ Mockup Preview: Wehiu Process Wireframe
                                  </div>
                                </div>
                              )}

                              {/* Progress Dots Indicator */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-[11px] font-bold text-[#6B5E4F] mb-1">
                                  <span>Progress</span>
                                  <span>{task.progress}%</span>
                                </div>
                                <div className="flex items-center space-x-1.5">
                                  {Array.from({ length: 10 }).map((_, dotIdx) => {
                                    const filledCount = Math.round(task.progress / 10);
                                    const isFilled = dotIdx < filledCount;
                                    return (
                                      <span
                                        key={dotIdx}
                                        className={`h-2.5 flex-1 rounded-full transition-all ${
                                          isFilled ? style.dotActive : style.dotInactive
                                        }`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>

                              {/* AI Realistic Deadline & Stopwatch Time Tracker Pill */}
                              <div className="mb-2.5 p-2 bg-white/70 rounded-xl border border-black/5 flex items-center justify-between text-xs shadow-2xs">
                                <div className="flex items-center space-x-1.5">
                                  <button
                                    type="button"
                                    onClick={(e) => handleToggleTimer(task.id, e)}
                                    className={`p-1 rounded-md transition-all flex items-center space-x-1 font-bold ${
                                      task.isTimerRunning
                                        ? 'bg-amber-600 text-white animate-pulse'
                                        : 'bg-[#EAE0D0] text-[#3F362C] hover:bg-[#DCD0BE]'
                                    }`}
                                    title={task.isTimerRunning ? 'Pause tracking' : 'Start stopwatch'}
                                  >
                                    {task.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                                    <span className="text-[10px] font-mono">{formatTimeSpent(task.timeSpent || 0)}</span>
                                  </button>
                                  <span className="text-[10px] text-[#8C7E6C] font-semibold">
                                    / {task.estimatedHours || 4}h est.
                                  </span>
                                </div>

                                {/* AI Risk Badge */}
                                {task.aiRiskScore && (
                                  <span
                                    title={task.aiRiskReason || `Pacing risk: ${task.aiRiskScore}`}
                                    className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md flex items-center space-x-1 ${
                                      task.aiRiskScore === 'High'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : task.aiRiskScore === 'Medium'
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    }`}
                                  >
                                    {task.aiRiskScore === 'High' && <Flame className="w-2.5 h-2.5" />}
                                    {task.aiRiskScore === 'Medium' && <AlertTriangle className="w-2.5 h-2.5" />}
                                    {task.aiRiskScore === 'Low' && <ShieldAlert className="w-2.5 h-2.5" />}
                                    <span>AI: {task.aiRiskScore}</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-[#7B6E5F]">
                                <div className="flex items-center -space-x-1.5 overflow-hidden">
                                  {task.assignees && task.assignees.length > 0 ? (
                                    task.assignees.map((assignee, idx) => (
                                      <img
                                        key={idx}
                                        src={assignee.avatar}
                                        alt={assignee.name}
                                        className="w-5 h-5 rounded-full border border-white object-cover shadow-2xs hover:scale-125 transition-transform"
                                        title={`Assigned: ${assignee.name}`}
                                      />
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-[#9E9080] italic">Unassigned</span>
                                  )}
                                  {task.assignees && task.assignees.length > 0 && (
                                    <span className="ml-2.5 text-[10px] font-bold text-[#6B5E4F] truncate max-w-[80px]" title={task.assignees.map(a => a.name).join(', ')}>
                                      {task.assignees[0].name.split(' ')[0]}
                                      {task.assignees.length > 1 && ` +${task.assignees.length - 1}`}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 text-[11px] font-semibold text-[#665B4E]">
                                  <span className="flex items-center space-x-1">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{task.commentsCount}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>{task.attachmentsCount}</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {columnTasks.length === 0 && (
                          <div className="p-8 text-center border-2 border-dashed border-[#DCD1BC] rounded-xl text-xs text-[#8A7D6E]">
                            No cards in this column
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW 2: SCHEDULE & TIMELINE PAGE (INTERACTIVE GANTT & CALENDAR) */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Top Control Bar (Project Switcher, Week Range, Today, Zoom Controls, View Switch) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#E5DBCA] gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Project / Dossier Selector */}
                  <div className="flex items-center space-x-2 bg-[#F5EFEB] border border-[#DCD1BC] px-3.5 py-1.5 rounded-xl shadow-xs">
                    <Folder className="w-4 h-4 text-[#8C7F70]" />
                    <span className="text-xs font-bold text-[#3B3128]">{currentFolder.name}</span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#E8DEC9] text-[#554A3E]">
                      {currentFolder.code}
                    </span>
                  </div>

                  {/* Date Range & Today Button */}
                  <div className="flex items-center space-x-2 bg-[#F5EFEB] border border-[#DCD1BC] px-2 py-1 rounded-xl shadow-xs">
                    <button
                      onClick={() => {
                        const today = new Date();
                        setCalendarSelectedDate(today);
                        setCalendarViewYear(today.getFullYear());
                        setCalendarViewMonth(today.getMonth());
                        setNotifications(prev => [{ id: Date.now(), text: `Jumped to today: ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`, time: 'Just now' }, ...prev]);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#4B4035] hover:bg-[#EAE1D1] transition-colors"
                      title="Jump to today's date"
                    >
                      Today
                    </button>
                    <div className="h-4 w-px bg-[#D8CDBC]" />
                    <span className="text-xs font-bold text-[#2A221B] px-1.5 flex items-center space-x-1.5">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#7C6F61]" />
                      <span>
                        {new Date(calendarViewYear, calendarViewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </span>
                  </div>

                  {/* Zoom Pills (Week | Month | Quarter) */}
                  <div className="flex items-center bg-[#ECE4D4] p-1 rounded-xl border border-[#DCD1BC] text-xs font-bold text-[#6D6052]">
                    {(['Week', 'Month', 'Quarter'] as const).map(z => (
                      <button
                        key={z}
                        onClick={() => {
                          setTimelineZoom(z);
                          setNotifications(prev => [{ id: Date.now(), text: `Switched calendar & Gantt scope to ${z} view`, time: 'Just now' }, ...prev]);
                        }}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          timelineZoom === z
                            ? 'bg-[#2E2721] text-[#FAF6EE] shadow-xs'
                            : 'hover:text-[#2E2721]'
                        }`}
                      >
                        {z}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right controls: View Toggle (Gantt vs Calendar) & New Event */}
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-[#ECE4D4] p-1 rounded-xl border border-[#DCD1BC] text-xs font-bold">
                    <button
                      onClick={() => setTimelineViewMode('gantt')}
                      className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                        timelineViewMode === 'gantt'
                          ? 'bg-white text-[#2E2721] shadow-xs font-black'
                          : 'text-[#6D6052] hover:text-[#2E2721]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Timeline / Gantt</span>
                    </button>
                    <button
                      onClick={() => setTimelineViewMode('calendar')}
                      className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                        timelineViewMode === 'calendar'
                          ? 'bg-white text-[#2E2721] shadow-xs font-black'
                          : 'text-[#6D6052] hover:text-[#2E2721]'
                      }`}
                    >
                      <CalendarCheck className="w-3.5 h-3.5" />
                      <span>Calendar & Agenda</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      const selStr = `${calendarSelectedDate.getFullYear()}-${String(calendarSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(calendarSelectedDate.getDate()).padStart(2, '0')}`;
                      setNewScheduleDate(selStr);
                      setNewScheduleStartDate(selStr);
                      setNewScheduleEndDate(selStr);
                      setIsNewScheduleModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#2E2721] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#463D34] shadow-sm flex items-center space-x-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Schedule Task</span>
                  </button>
                </div>
              </div>

              {/* TIMELINE / GANTT VIEW MODE (Matches Screenshot 2) */}
              {timelineViewMode === 'gantt' && (() => {
                // Dynamic time unit headers and grid calculations based on timelineZoom
                const curr = new Date(calendarSelectedDate);
                const year = curr.getFullYear();
                const month = curr.getMonth();

                type TimelineUnit = {
                  label: string;
                  sublabel: string;
                  dateStart: Date;
                  dateEnd: Date;
                  isCurrent: boolean;
                };

                let units: TimelineUnit[] = [];
                let gridTemplateClass = 'grid-cols-7';
                let bgSizePercent = '14.285%';

                if (timelineZoom === 'Week') {
                  const first = curr.getDate() - curr.getDay(); // Sunday
                  const today = new Date();
                  gridTemplateClass = 'grid-cols-7';
                  bgSizePercent = '14.285%';
                  units = Array.from({ length: 7 }).map((_, idx) => {
                    const d = new Date(curr.getFullYear(), curr.getMonth(), first + idx);
                    const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
                    const dEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
                    const isToday =
                      d.getDate() === today.getDate() &&
                      d.getMonth() === today.getMonth() &&
                      d.getFullYear() === today.getFullYear();
                    return {
                      label: d.toLocaleDateString('en-US', { weekday: 'short' }),
                      sublabel: String(d.getDate()),
                      dateStart: dStart,
                      dateEnd: dEnd,
                      isCurrent: isToday
                    };
                  });
                } else if (timelineZoom === 'Month') {
                  // Break Month down into 4 or 5 sprint weeks
                  const daysCount = new Date(year, month + 1, 0).getDate();
                  const numWeeks = Math.ceil(daysCount / 7);
                  gridTemplateClass = numWeeks === 5 ? 'grid-cols-5' : 'grid-cols-4';
                  bgSizePercent = `${(100 / numWeeks).toFixed(3)}%`;

                  units = Array.from({ length: numWeeks }).map((_, idx) => {
                    const startDay = idx * 7 + 1;
                    const endDay = Math.min(daysCount, (idx + 1) * 7);
                    const dStart = new Date(year, month, startDay, 0, 0, 0);
                    const dEnd = new Date(year, month, endDay, 23, 59, 59);
                    const isCurr = new Date() >= dStart && new Date() <= dEnd;
                    return {
                      label: `Wk ${idx + 1}`,
                      sublabel: `${startDay} - ${endDay}`,
                      dateStart: dStart,
                      dateEnd: dEnd,
                      isCurrent: isCurr
                    };
                  });
                } else {
                  // Quarter View: 3 Months of the active Quarter
                  const quarter = Math.floor(month / 3);
                  const qStartMonth = quarter * 3;
                  gridTemplateClass = 'grid-cols-3';
                  bgSizePercent = '33.333%';

                  units = [0, 1, 2].map((offset) => {
                    const m = qStartMonth + offset;
                    const mDays = new Date(year, m + 1, 0).getDate();
                    const dStart = new Date(year, m, 1, 0, 0, 0);
                    const dEnd = new Date(year, m, mDays, 23, 59, 59);
                    const isCurr = new Date() >= dStart && new Date() <= dEnd;
                    const mName = dStart.toLocaleDateString('en-US', { month: 'short' });
                    return {
                      label: mName,
                      sublabel: `Q${quarter + 1} • ${mDays}d`,
                      dateStart: dStart,
                      dateEnd: dEnd,
                      isCurrent: isCurr
                    };
                  });
                }

                const rangeStartMs = units[0].dateStart.getTime();
                const rangeEndMs = units[units.length - 1].dateEnd.getTime();
                const totalRangeMs = Math.max(1, rangeEndMs - rangeStartMs);

                return (
                <div className="flex flex-col xl:flex-row items-start gap-5">
                  {/* Left & Center: Phase Tree + Horizontal Timeline Grid */}
                  <div className="flex-1 w-full bg-[#FAF6EE] rounded-2xl border border-[#D5CABB] shadow-sm overflow-x-auto">
                    <div className="min-w-[680px]">
                    {/* Gantt Header: Left Phase label + Dynamic Zoom Columns */}
                    <div className="flex border-b border-[#DCD1BC] bg-[#EFE8DC] text-xs font-bold text-[#554A3D]">
                      <div className="w-72 sm:w-80 flex-shrink-0 px-4 py-3 border-r border-[#DCD1BC] flex items-center justify-between">
                        <span className="uppercase tracking-wider text-[11px] text-[#7A6D5E]">Project Roadmap & Tasks</span>
                        <span className="text-[10px] bg-[#E2D8C6] px-2 py-0.5 rounded-md font-semibold text-[#665A4E]">
                          {currentOrgSchedules.length} Items
                        </span>
                      </div>
                      <div className={`flex-1 grid ${gridTemplateClass} text-center`}>
                        {units.map((unit, idx) => (
                          <div
                            key={idx}
                            onClick={() => setCalendarSelectedDate(unit.dateStart)}
                            className={`py-2 px-1 border-r border-[#E2D8C6] last:border-r-0 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                              unit.isCurrent ? 'bg-[#E5DBC7]/60 font-black text-[#261E18]' : 'hover:bg-white/50 text-[#6D6153]'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold tracking-wider">{unit.label}</span>
                            <span className={`text-xs mt-0.5 ${unit.isCurrent ? 'px-1.5 rounded-full bg-[#2E2721] text-[#FAF6EE]' : ''}`}>
                              {unit.sublabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Phase Groups (Discovery & Research, Design & Planning, Development, Review & QA, Launch) */}
                    <div className="divide-y divide-[#EFE7D8]">
                      {[
                        'Discovery & Research',
                        'Design & Planning',
                        'Development',
                        'Review & QA',
                        'Launch'
                      ].map(phaseName => {
                        const phaseTasks = currentOrgSchedules.filter(s => (s.phase || 'Discovery & Research') === phaseName);
                        const isCollapsed = timelineCollapsedPhases[phaseName];

                        return (
                          <div key={phaseName} className="group">
                            {/* Phase Accordion Title */}
                            <div
                              onClick={() => setTimelineCollapsedPhases(prev => ({ ...prev, [phaseName]: !prev[phaseName] }))}
                              className="px-4 py-2.5 bg-[#F6F0E4] hover:bg-[#EFE8DC] cursor-pointer flex items-center justify-between border-b border-[#E8DEC9] transition-colors"
                            >
                              <div className="flex items-center space-x-2 text-xs font-black text-[#382F26]">
                                <ChevronDown className={`w-3.5 h-3.5 text-[#8A7D6E] transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                                <span className="tracking-wide uppercase text-[11px]">{phaseName}</span>
                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#E5DCC9] text-[#5A4E42]">
                                  {phaseTasks.length}
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold text-[#8C7E70]">
                                {isCollapsed ? 'Click to expand' : 'Click to collapse'}
                              </span>
                            </div>

                            {/* Phase Tasks Rows */}
                            {!isCollapsed && phaseTasks.map(item => {
                              const style = getColorStyles(item.color);
                              const isSelected = selectedScheduleItem?.id === item.id;

                              const itemStart = item.startDate ? new Date(item.startDate + 'T00:00:00').getTime() : new Date((item.date || '2026-10-28') + 'T00:00:00').getTime();
                              const itemEnd = item.endDate ? new Date(item.endDate + 'T23:59:59').getTime() : (itemStart + 86400000 - 1);

                              // Clamp item inside active timeline zoom bounds
                              const clampedStart = Math.max(rangeStartMs, Math.min(rangeEndMs, itemStart));
                              const clampedEnd = Math.max(clampedStart, Math.min(rangeEndMs, itemEnd));

                              const leftPercent = Math.max(0, Math.min(95, ((clampedStart - rangeStartMs) / totalRangeMs) * 100));
                              const widthPercent = Math.max(4, Math.min(100 - leftPercent, ((clampedEnd - clampedStart) / totalRangeMs) * 100));

                              const isVisibleInRange = itemEnd >= rangeStartMs && itemStart <= rangeEndMs;

                              const completedSubs = (item.subtasks || []).filter(st => st.completed).length;
                              const totalSubs = (item.subtasks || []).length;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => setSelectedScheduleItem(item)}
                                  className={`flex hover:bg-[#F8F3EA] cursor-pointer transition-colors border-b border-[#EFE7D8] last:border-b-0 ${
                                    isSelected ? 'bg-[#F2ECE0]' : ''
                                  }`}
                                >
                                  {/* Left: Task row metadata & quick toggle */}
                                  <div className="w-72 sm:w-80 flex-shrink-0 px-4 py-3 border-r border-[#E8DEC9] flex items-center justify-between space-x-2">
                                    <div className="flex items-center space-x-2.5 min-w-0">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextStatus = item.status === 'Done' ? 'In Progress' : 'Done';
                                          setSchedules(prev => prev.map(s => s.id === item.id ? { ...s, status: nextStatus } : s));
                                          if (selectedScheduleItem?.id === item.id) {
                                            setSelectedScheduleItem(prev => prev ? { ...prev, status: nextStatus } : null);
                                          }
                                        }}
                                        className="text-[#998B7B] hover:text-[#2E2721] transition-colors flex-shrink-0"
                                      >
                                        {item.status === 'Done' ? (
                                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                                        ) : item.status === 'In Progress' ? (
                                          <Circle className="w-4 h-4 text-amber-600 fill-amber-100" />
                                        ) : (
                                          <Circle className="w-4 h-4 text-[#B5A998]" />
                                        )}
                                      </button>
                                      <span
                                        className={`text-xs font-bold truncate ${
                                          item.status === 'Done' ? 'line-through text-[#998B7C]' : 'text-[#2C241D]'
                                        }`}
                                        title={item.title}
                                      >
                                        {item.title}
                                      </span>
                                    </div>

                                    {/* Task badges */}
                                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                                      {totalSubs > 0 && (
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8DEC9] text-[#554A3D]">
                                          {completedSubs}/{totalSubs}
                                        </span>
                                      )}
                                      <img
                                        src={item.assigneeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}
                                        alt={item.assignee}
                                        className="w-5 h-5 rounded-full border border-white object-cover"
                                        title={item.assignee}
                                      />
                                    </div>
                                  </div>

                                  {/* Right: Gantt bar spanning calculated days/weeks/months */}
                                  <div
                                    style={{ backgroundSize: `${bgSizePercent} 100%` }}
                                    className="flex-1 relative py-2 px-1 bg-[linear-gradient(to_right,#EFE8DC_1px,transparent_1px)] min-h-[44px] flex items-center overflow-hidden"
                                  >
                                    {isVisibleInRange ? (
                                      <div
                                        style={{
                                          marginLeft: `${leftPercent}%`,
                                          width: `calc(${widthPercent}% - 6px)`
                                        }}
                                        className={`h-9 rounded-2xl border px-2 sm:px-3 flex items-center justify-between shadow-xs transition-all ${style.bg} ${style.border} ${style.textColor} ${
                                          isSelected ? 'ring-2 ring-[#2E2721] shadow-md scale-[1.01]' : 'hover:shadow-sm hover:scale-[1.005]'
                                        }`}
                                      >
                                        <div className="flex flex-col min-w-0 pr-1 sm:pr-2">
                                          <span className="text-[11px] font-black tracking-tight truncate leading-tight">
                                            {item.category || item.title}
                                          </span>
                                          <span className="text-[9px] font-bold opacity-75 truncate leading-tight">
                                            {item.startDate ? `${new Date(item.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date((item.endDate || item.startDate) + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : item.date}
                                          </span>
                                        </div>
                                        <div className="flex items-center flex-shrink-0 ml-1">
                                          <img
                                            src={item.assigneeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}
                                            alt={item.assignee}
                                            className="w-5 h-5 rounded-full border border-white object-cover shadow-xs shrink-0"
                                            title={`Assigned: ${item.assignee}`}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-[#A69989] italic px-3 select-none">
                                        Scheduled outside active {timelineZoom.toLowerCase()} window
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {!isCollapsed && phaseTasks.length === 0 && (
                              <div className="px-6 py-3 text-xs text-[#998B7C] italic">
                                No tasks scheduled under {phaseName}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    </div>
                  </div>

                  {/* Right-Hand Task Detail Drawer (Matching Reference Screenshot 2) */}
                  {selectedScheduleItem ? (
                    <div className="w-full xl:w-96 flex-shrink-0 bg-[#FAF6EE] rounded-2xl border border-[#D5CABB] p-5 shadow-lg space-y-5 animate-in fade-in zoom-in-95 duration-100">
                      {/* Drawer Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC9]">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${getColorStyles(selectedScheduleItem.color).tagBg} ${getColorStyles(selectedScheduleItem.color).tagText}`}>
                            {selectedScheduleItem.phase || 'General'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E8DEC9] text-[#554A3E]">
                            {selectedScheduleItem.status}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedScheduleItem(null)}
                          className="p-1 rounded-lg text-[#887A6B] hover:text-[#261E18] hover:bg-[#EAE0CF] transition-colors"
                          title="Close drawer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5">
                        <h2 className="text-base font-black text-[#28201A] leading-snug">
                          {selectedScheduleItem.title}
                        </h2>
                        <p className="text-xs text-[#6A5E50] leading-relaxed">
                          {selectedScheduleItem.description || 'No detailed scope written for this timeline item.'}
                        </p>
                      </div>

                      {/* Assignee & Dates Widget */}
                      <div className="bg-[#F5EFEB] p-3.5 rounded-xl border border-[#DCD1BC] space-y-3 text-xs">
                        {/* Assignee */}
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#7A6D5E]">Assignee</span>
                          <div className="flex items-center space-x-2">
                            <img
                              src={selectedScheduleItem.assigneeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}
                              alt={selectedScheduleItem.assignee}
                              className="w-5 h-5 rounded-full object-cover border border-[#DCD1BC]"
                            />
                            <div className="text-right">
                              <span className="font-bold text-[#2A211A] block">{selectedScheduleItem.assignee}</span>
                              <span className="text-[10px] text-[#8C7F70]">{selectedScheduleItem.assigneeRole || 'Team Member'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Dates Span */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#E8DEC9]">
                          <span className="font-bold text-[#7A6D5E]">Schedule Span</span>
                          <span className="font-extrabold text-[#2A211A]">
                            {selectedScheduleItem.startDate || selectedScheduleItem.date} → {selectedScheduleItem.endDate || selectedScheduleItem.date}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Checklist (Subtasks) */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-[#554A3E]">
                          <span className="flex items-center space-x-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-[#7A6E5F]" />
                            <span>Checklist</span>
                          </span>
                          <span className="font-black text-[#261E18]">
                            {(selectedScheduleItem.subtasks || []).filter(s => s.completed).length} / {(selectedScheduleItem.subtasks || []).length}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#E5DCC9] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#2E2721] h-full transition-all duration-300 rounded-full"
                            style={{
                              width: `${
                                (selectedScheduleItem.subtasks || []).length > 0
                                  ? Math.round(
                                      ((selectedScheduleItem.subtasks || []).filter(s => s.completed).length /
                                        (selectedScheduleItem.subtasks || []).length) *
                                        100
                                    )
                                  : 0
                              }%`
                            }}
                          />
                        </div>

                        {/* Subtasks List */}
                        <div className="space-y-1.5 pt-1">
                          {(selectedScheduleItem.subtasks || []).map(st => (
                            <div
                              key={st.id}
                              onClick={() => handleToggleScheduleSubtask(selectedScheduleItem.id, st.id)}
                              className="flex items-center space-x-2.5 p-2 rounded-xl bg-white/70 border border-[#E5DBCA] hover:bg-white cursor-pointer transition-colors text-xs"
                            >
                              {st.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-[#A89C8C] hover:text-[#2E2721] flex-shrink-0" />
                              )}
                              <span className={`flex-1 ${st.completed ? 'line-through text-[#998B7C]' : 'font-medium text-[#2C241E]'}`}>
                                {st.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Add Subtask Form */}
                        <div className="flex items-center space-x-1.5 pt-1">
                          <input
                            type="text"
                            value={timelineNewSubtaskInput}
                            onChange={(e) => setTimelineNewSubtaskInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddScheduleSubtask(selectedScheduleItem.id);
                              }
                            }}
                            placeholder="Add subtask and press Enter..."
                            className="flex-1 px-3 py-1.5 rounded-xl border border-[#D5CABB] bg-white text-xs text-[#2A211A] placeholder-[#9C8F80] focus:outline-hidden focus:ring-1 focus:ring-[#2E2721]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddScheduleSubtask(selectedScheduleItem.id)}
                            className="p-1.5 rounded-xl bg-[#2E2721] text-[#FAF6EE] hover:bg-[#463D34] transition-colors"
                            title="Add subtask"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Comments Thread (Matching Reference Screenshot 2) */}
                      <div className="space-y-2.5 pt-2 border-t border-[#E8DEC9]">
                        <div className="flex items-center justify-between text-xs font-bold text-[#554A3E]">
                          <span className="flex items-center space-x-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-[#7A6E5F]" />
                            <span>Discussion ({ (selectedScheduleItem.comments || []).length })</span>
                          </span>
                        </div>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {(selectedScheduleItem.comments || []).map(c => (
                            <div key={c.id} className="p-2.5 bg-white/70 rounded-xl border border-[#E5DBCA] text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1.5">
                                  <img src={c.avatar} alt={c.author} className="w-4 h-4 rounded-full object-cover" />
                                  <span className="font-bold text-[#2A211A]">{c.author}</span>
                                </div>
                                <span className="text-[10px] text-[#8C7F70]">{c.time}</span>
                              </div>
                              <p className="text-[#4E4337] pl-5 leading-relaxed">{c.content}</p>
                            </div>
                          ))}

                          {(selectedScheduleItem.comments || []).length === 0 && (
                            <p className="text-xs text-[#998B7C] italic py-1">No comments posted yet.</p>
                          )}
                        </div>

                        {/* Add Comment Input */}
                        <div className="flex items-center space-x-1.5 pt-1">
                          <input
                            type="text"
                            value={timelineCommentInput}
                            onChange={(e) => setTimelineCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddScheduleComment(selectedScheduleItem.id);
                              }
                            }}
                            placeholder="Add a comment to this schedule item..."
                            className="flex-1 px-3 py-1.5 rounded-xl border border-[#D5CABB] bg-white text-xs text-[#2A211A] placeholder-[#9C8F80] focus:outline-hidden focus:ring-1 focus:ring-[#2E2721]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddScheduleComment(selectedScheduleItem.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#2E2721] text-[#FAF6EE] text-xs font-bold hover:bg-[#463D34] transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden xl:flex w-80 flex-shrink-0 bg-[#F5EFEB] rounded-2xl border border-dashed border-[#D5CABB] p-6 flex-col items-center justify-center text-center text-xs text-[#887A6A] space-y-2">
                      <Layers className="w-8 h-8 text-[#A89B8B]" />
                      <p className="font-bold text-[#3B3127]">No Task Selected</p>
                      <p>Click on any timeline bar or roadmap task row to inspect checklist, dates, and discussions.</p>
                    </div>
                  )}
                </div>
                );
              })()}

              {/* CALENDAR & AGENDA VIEW MODE (Real-time Dynamic Calendar Grid) */}
              {timelineViewMode === 'calendar' && (() => {
                const monthNames = [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ];
                const currentMonthName = monthNames[calendarViewMonth];
                const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();
                const firstDayOfWeek = new Date(calendarViewYear, calendarViewMonth, 1).getDay(); // 0 = Sun
                
                // Helper to check if a day is today
                const isRealToday = (dayNum: number) => {
                  const today = new Date();
                  return (
                    today.getDate() === dayNum &&
                    today.getMonth() === calendarViewMonth &&
                    today.getFullYear() === calendarViewYear
                  );
                };

                // Helper to check if a day is the selected clicked day
                const isSelectedDay = (dayNum: number) => {
                  return (
                    calendarSelectedDate.getDate() === dayNum &&
                    calendarSelectedDate.getMonth() === calendarViewMonth &&
                    calendarSelectedDate.getFullYear() === calendarViewYear
                  );
                };

                // Format day string YYYY-MM-DD
                const getDayStr = (dayNum: number) => {
                  const mStr = String(calendarViewMonth + 1).padStart(2, '0');
                  const dStr = String(dayNum).padStart(2, '0');
                  return `${calendarViewYear}-${mStr}-${dStr}`;
                };

                // Find events on a specific day
                const getEventsOnDay = (dayNum: number) => {
                  const targetStr = getDayStr(dayNum);
                  return currentOrgSchedules.filter(s => {
                    const start = s.startDate || s.date;
                    const end = s.endDate || s.date;
                    return targetStr >= start && targetStr <= end;
                  });
                };

                // Calculate week number of the selected or current date
                const getWeekNumber = (d: Date) => {
                  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
                  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
                  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
                };

                // Selected day string for event filtering
                const selectedDayFormatted = `${calendarSelectedDate.getFullYear()}-${String(calendarSelectedDate.getMonth() + 1).padStart(2, '0')}-${String(calendarSelectedDate.getDate()).padStart(2, '0')}`;
                const eventsForSelectedDay = currentOrgSchedules.filter(s => {
                  const start = s.startDate || s.date;
                  const end = s.endDate || s.date;
                  return selectedDayFormatted >= start && selectedDayFormatted <= end;
                });

                // Display events according to timelineZoom (Week vs Month vs Quarter)
                const displayedSchedules = (() => {
                  if (timelineZoom === 'Week') {
                    // Show events in the 7-day span of the selected day
                    const curr = new Date(calendarSelectedDate);
                    const first = curr.getDate() - curr.getDay();
                    const weekStart = new Date(curr.setDate(first));
                    const weekEnd = new Date(curr.setDate(first + 6));
                    const startStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
                    const endStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`;
                    return currentOrgSchedules.filter(s => {
                      const sStart = s.startDate || s.date;
                      const sEnd = s.endDate || s.date;
                      return sEnd >= startStr && sStart <= endStr;
                    });
                  } else if (timelineZoom === 'Quarter') {
                    const quarter = Math.floor(calendarViewMonth / 3);
                    const qStartMonth = quarter * 3;
                    const qEndMonth = qStartMonth + 2;
                    const qStartStr = `${calendarViewYear}-${String(qStartMonth + 1).padStart(2, '0')}-01`;
                    const qEndDays = new Date(calendarViewYear, qEndMonth + 1, 0).getDate();
                    const qEndStr = `${calendarViewYear}-${String(qEndMonth + 1).padStart(2, '0')}-${qEndDays}`;
                    return currentOrgSchedules.filter(s => {
                      const sStart = s.startDate || s.date;
                      const sEnd = s.endDate || s.date;
                      return sEnd >= qStartStr && sStart <= qEndStr;
                    });
                  } else {
                    // Month View (Default)
                    const mStartStr = `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-01`;
                    const mEndStr = `${calendarViewYear}-${String(calendarViewMonth + 1).padStart(2, '0')}-${daysInMonth}`;
                    return currentOrgSchedules.filter(s => {
                      const sStart = s.startDate || s.date;
                      const sEnd = s.endDate || s.date;
                      return sEnd >= mStartStr && sStart <= mEndStr;
                    });
                  }
                })();

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Real-Time Interactive Month Calendar Grid */}
                    <div className="lg:col-span-5 bg-[#F5EFEB] rounded-2xl border border-[#DCD1BC] p-5 shadow-sm space-y-4">
                      {/* Calendar Navigation Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#DCD1BC]">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              if (calendarViewMonth === 0) {
                                setCalendarViewMonth(11);
                                setCalendarViewYear(calendarViewYear - 1);
                              } else {
                                setCalendarViewMonth(calendarViewMonth - 1);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#EAE0CF] text-[#6E6153] hover:text-[#2C241E] transition-colors"
                            title="Previous Month"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <h2 className="text-sm font-black text-[#2C241E] tracking-tight">
                            {currentMonthName} {calendarViewYear}
                          </h2>
                          <button
                            onClick={() => {
                              if (calendarViewMonth === 11) {
                                setCalendarViewMonth(0);
                                setCalendarViewYear(calendarViewYear + 1);
                              } else {
                                setCalendarViewMonth(calendarViewMonth + 1);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#EAE0CF] text-[#6E6153] hover:text-[#2C241E] transition-colors"
                            title="Next Month"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => {
                              const today = new Date();
                              setCalendarSelectedDate(today);
                              setCalendarViewMonth(today.getMonth());
                              setCalendarViewYear(today.getFullYear());
                            }}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#E4DAC7] hover:bg-[#DACBB4] text-[#4E4133] transition-colors"
                            title="Go to current real date"
                          >
                            Today
                          </button>
                          <span className="text-xs px-2.5 py-0.5 bg-[#E4DAC7] text-[#52473A] font-extrabold rounded-md font-mono">
                            Week {getWeekNumber(calendarSelectedDate)}
                          </span>
                        </div>
                      </div>

                      {/* Day of Week Header */}
                      <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-[#867A6B] uppercase tracking-wider mb-2">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                      </div>

                      {/* Interactive Calendar Days Grid */}
                      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs font-semibold">
                        {/* Empty leading padding slots for day of week offset */}
                        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                          <div key={`empty-${idx}`} className="h-9 sm:h-10 rounded-xl opacity-20 pointer-events-none" />
                        ))}

                        {/* All Month Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const isToday = isRealToday(dayNum);
                          const isSelected = isSelectedDay(dayNum);
                          const dayEvents = getEventsOnDay(dayNum);
                          const hasEvents = dayEvents.length > 0;

                          return (
                            <div
                              key={dayNum}
                              onClick={() => {
                                const newDate = new Date(calendarViewYear, calendarViewMonth, dayNum);
                                setCalendarSelectedDate(newDate);
                              }}
                              className={`h-9 sm:h-10 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer relative group select-none active:scale-95 touch-target ${
                                isSelected
                                  ? 'bg-[#2E2721] text-[#FAF6EE] font-black shadow-md scale-105 ring-2 ring-[#2E2721]/30 z-10'
                                  : isToday
                                  ? 'bg-[#E5DCC9] text-[#2C241E] font-black border-2 border-[#2E2721]'
                                  : hasEvents
                                  ? 'bg-[#EAE0CF] text-[#2C241E] border border-[#D5CABB] hover:bg-[#E3D6C1]'
                                  : 'text-[#695D50] hover:bg-[#EAE0CF]/60'
                              }`}
                              title={
                                hasEvents
                                  ? `${dayEvents.length} event(s): ${dayEvents.map(e => e.title).join(', ')}`
                                  : `${currentMonthName} ${dayNum}, ${calendarViewYear}`
                              }
                            >
                              <span className="leading-none">{dayNum}</span>
                              {hasEvents && (
                                <span className="flex items-center space-x-0.5 mt-0.5">
                                  {dayEvents.slice(0, 3).map((ev, eIdx) => (
                                    <span
                                      key={eIdx}
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        isSelected
                                          ? 'bg-[#EAAADD]'
                                          : ev.priority === 'Urgent'
                                          ? 'bg-rose-600'
                                          : ev.priority === 'High'
                                          ? 'bg-amber-600'
                                          : 'bg-emerald-600'
                                      }`}
                                    />
                                  ))}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Day Selected Scope Banner */}
                      <div className="pt-2 border-t border-[#E2D8C6] flex items-center justify-between text-xs text-[#7A6D5E]">
                        <span className="flex items-center space-x-1.5 font-bold text-[#2C241E]">
                          <CalendarIcon className="w-3.5 h-3.5 text-amber-700" />
                          <span>
                            Selected: {calendarSelectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </span>
                        <span className="text-[11px] font-semibold bg-[#E4DAC7] px-2 py-0.5 rounded-md">
                          {eventsForSelectedDay.length} Scheduled
                        </span>
                      </div>
                    </div>

                    {/* Scheduled Events List for Selected Day or Zoom Period */}
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E5DBCA] gap-2">
                        <div>
                          <h2 className="text-sm font-black text-[#2C241E]">
                            {timelineZoom === 'Week'
                              ? `Sprint Deliverables for Week of ${calendarSelectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                              : timelineZoom === 'Quarter'
                              ? `Quarterly Deliverables (${currentMonthName} Quarter)`
                              : `${currentMonthName} ${calendarViewYear} Deliverables`}
                          </h2>
                          <p className="text-[11px] text-[#7A6D5E] mt-0.5">
                            {displayedSchedules.length} deliverables active in this timeframe • Click date or event to inspect
                          </p>
                        </div>

                        {eventsForSelectedDay.length > 0 && (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-lg self-start sm:self-auto">
                            {eventsForSelectedDay.length} falling on {calendarSelectedDate.getDate()} {currentMonthName.slice(0, 3)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                        {displayedSchedules.map(event => {
                          const style = getColorStyles(event.color);
                          const isFallingOnSelectedDay = (() => {
                            const start = event.startDate || event.date;
                            const end = event.endDate || event.date;
                            return selectedDayFormatted >= start && selectedDayFormatted <= end;
                          })();

                          return (
                            <div
                              key={event.id}
                              onClick={() => {
                                setSelectedScheduleItem(event);
                                setTimelineViewMode('gantt');
                              }}
                              className={`${style.bg} rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                                isFallingOnSelectedDay
                                  ? 'border-2 border-[#2E2721] shadow-md -translate-y-0.5'
                                  : `border ${style.border} shadow-xs hover:shadow-md hover:-translate-y-0.5`
                              }`}
                            >
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.tagBg} ${style.tagText}`}>
                                    {event.category}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/60 text-[#54483C]">
                                    Phase: {event.phase || 'General'}
                                  </span>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                    event.priority === 'Urgent'
                                      ? 'bg-rose-100 text-rose-800'
                                      : event.priority === 'High'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-white/60 text-[#54483C]'
                                  }`}>
                                    {event.priority} Priority
                                  </span>
                                  {isFallingOnSelectedDay && (
                                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#2E2721] text-[#FAF6EE]">
                                      Active on selected date
                                    </span>
                                  )}
                                </div>
                                <h3 className={`text-sm font-bold ${style.textColor} truncate`}>{event.title}</h3>
                                <div className="flex items-center space-x-3 text-xs text-[#7A6D5E] flex-wrap">
                                  <span className="flex items-center space-x-1">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>{event.startDate || event.date} → {event.endDate || event.date}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{event.time}</span>
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 self-end sm:self-center flex-shrink-0">
                                <span className="text-xs px-2.5 py-1 rounded-lg bg-white/70 font-semibold text-[#44382C] border border-black/5 flex items-center space-x-1.5">
                                  <img
                                    src={event.assigneeAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop'}
                                    alt={event.assignee}
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                  <span>{event.assignee}</span>
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {displayedSchedules.length === 0 && (
                          <div className="p-12 text-center bg-[#F5EFEB] rounded-2xl border-2 border-dashed border-[#DCD1BC] text-xs text-[#8A7D6E] space-y-2">
                            <CalendarIcon className="w-8 h-8 text-[#A89C8C] mx-auto" />
                            <p className="font-bold text-[#3B3127]">No Events Scheduled in {currentMonthName}</p>
                            <p>Click on "Schedule Task" above to add deliverables for this date.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW 3: NOTE PAGE (Dossier Notes / Memos) */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E5DBCA] gap-3">
                <div>
                  <p className="text-xs text-[#7B7062] font-medium flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Archival Project Memos & Design Records</span>
                  </p>
                  <h1 className="text-2xl font-black text-[#26201A] tracking-tight mt-0.5">
                    Dossier Notes
                  </h1>
                </div>
                <button
                  onClick={() => setIsNewNoteModalOpen(true)}
                  className="px-4 py-2 bg-[#2E2721] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#463D34] shadow flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Memo</span>
                </button>
              </div>

              {/* Notes Grid (Vintage stationery sticky notes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...notes]
                  .filter(n => (!n.orgId || n.orgId === currentOrg.id) && (!n.folderId || !currentFolder || n.folderId === currentFolder.id))
                  .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
                  .map(note => {
                  const paperClass = getNotePaperColor(note.color);
                  return (
                    <div
                      key={note.id}
                      className={`${paperClass} rounded-2xl border ${
                        note.isPinned ? 'ring-2 ring-amber-700/40 shadow-md -translate-y-0.5' : 'shadow-xs'
                      } p-5 relative group flex flex-col justify-between hover:shadow-md transition-all`}
                    >
                      {/* Note Header: Pin Icon & Category */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            {note.isPinned && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-800 text-[#FAF6EE] shadow-2xs flex items-center space-x-1">
                                <Pin className="w-2.5 h-2.5 fill-current" />
                                <span>Pinned</span>
                              </span>
                            )}
                            {note.tags.map((t, idx) => (
                              <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#5A4F42]">
                                {t}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => togglePinNote(note.id)}
                            className={`p-1.5 rounded-lg transition-all ${
                              note.isPinned
                                ? 'text-amber-800 bg-amber-200/60 shadow-inner'
                                : 'text-[#A09382] hover:text-[#2C241E] hover:bg-black/5'
                            }`}
                            title={note.isPinned ? 'Unpin memo from top' : 'Pin memo to top of dossier'}
                          >
                            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current rotate-45' : 'hover:scale-110'}`} />
                          </button>
                        </div>

                        <h3 className="text-sm font-black text-[#2A231D] mb-2 leading-snug">
                          {note.title}
                        </h3>

                        <p className="text-xs text-[#52473A] whitespace-pre-line leading-relaxed mb-4">
                          {note.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-black/5 text-[10px] text-[#7F7364]">
                        <span className="font-bold">By {note.author}</span>
                        <span>{note.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 4: TEAM MEMBERS & PERMISSIONS */}
          {activeTab === 'team' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Header & Controls matching user mockup */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-1 border-b border-[#E5DBCA] md:border-b-0 pb-3 md:pb-0">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h1 className="text-xl sm:text-2xl font-black text-[#2A231D] tracking-tight">Team members</h1>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EFE8DC] text-[#6B5E4F] border border-[#DCD1BC]">
                      {teamMembers.length}
                    </span>
                  </div>
                  <p className="text-xs text-[#7F7364] mt-0.5">
                    Manage your team, roles, and project assignments. Keep everyone aligned and productive.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {/* Search Bar */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 text-[#8C7E6C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={teamSearchQuery}
                      onChange={(e) => setTeamSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white/90 border border-[#DCD1BC] rounded-xl text-xs text-[#2A231D] placeholder-[#A09383] focus:outline-none focus:border-[#8C7E6C] focus:bg-white sm:w-56 shadow-xs transition-all"
                    />
                  </div>

                  {/* Invite Member CTA */}
                  <button
                    onClick={() => setIsInviteMemberModalOpen(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl shadow hover:bg-[#433931] transition-colors shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Invite Member</span>
                  </button>
                </div>
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 sm:flex-initial min-w-[140px]">
                  <ArchivalSelect
                    value={teamRoleFilter}
                    onChange={(val) => setTeamRoleFilter(val)}
                    options={[
                      { value: 'All Roles', label: 'All Roles', icon: <Users className="w-3.5 h-3.5 text-[#8C7E6C]" /> },
                      { value: 'Product Owner', label: 'Product Owner' },
                      { value: 'Project Manager', label: 'Project Manager' },
                      { value: 'Developer', label: 'Developer' },
                      { value: 'Frontend Engineer', label: 'Frontend Engineer' },
                      { value: 'Backend Engineer', label: 'Backend Engineer' },
                      { value: 'Designer', label: 'Designer' },
                      { value: 'QA Engineer', label: 'QA Engineer' }
                    ]}
                    title="Filter Team by Role"
                  />
                </div>

                <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                  <ArchivalSelect
                    value={teamProjectFilter}
                    onChange={(val) => setTeamProjectFilter(val)}
                    options={[
                      { value: 'All Projects', label: 'All Projects', icon: <Folder className="w-3.5 h-3.5 text-[#8C7E6C]" /> },
                      { value: 'Acme Digital Revamp', label: 'Acme Digital Revamp' },
                      { value: 'CRM Platform', label: 'CRM Platform' },
                      { value: 'Web Platform', label: 'Web Platform' },
                      { value: 'Mobile App', label: 'Mobile App' },
                      { value: 'Brand Refresh', label: 'Brand Refresh' },
                      { value: 'API Integration', label: 'API Integration' }
                    ]}
                    title="Filter Team by Project"
                  />
                </div>

                {(teamRoleFilter !== 'All Roles' || teamProjectFilter !== 'All Projects' || teamSearchQuery) && (
                  <button
                    onClick={() => {
                      setTeamRoleFilter('All Roles');
                      setTeamProjectFilter('All Projects');
                      setTeamSearchQuery('');
                    }}
                    className="text-xs font-bold text-[#8C7E6C] hover:text-[#2A231D] underline px-2 py-1"
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {/* Mobile View: Dedicated Adaptive Cards (hidden on md and up) */}
              <div className="md:hidden space-y-3">
                {teamMembers
                  .filter(m => {
                    const matchesSearch =
                      m.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                      m.email.toLowerCase().includes(teamSearchQuery.toLowerCase());
                    const matchesRole = teamRoleFilter === 'All Roles' || m.role === teamRoleFilter;
                    const matchesProject =
                      teamProjectFilter === 'All Projects' || m.projects.includes(teamProjectFilter);
                    return matchesSearch && matchesRole && matchesProject;
                  })
                  .map(member => (
                    <div
                      key={member.id}
                      className="bg-[#FAF7F2] rounded-2xl border border-[#DCD1BC] p-4 shadow-xs space-y-3"
                    >
                      {/* Name & Role Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#DCD1BC] shrink-0 shadow-2xs"
                          />
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-[#2A231D] truncate">{member.name}</h3>
                            <p className="text-[11px] text-[#7F7364] truncate">{member.email}</p>
                          </div>
                        </div>

                        <span
                          className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getRoleBadgeStyle(
                            member.role
                          )}`}
                        >
                          {member.role}
                        </span>
                      </div>

                      {/* Workload Progress Bar */}
                      <div className="bg-white/70 p-2.5 rounded-xl border border-[#E8DEC9] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#4B3E32]">
                          <span>Workload Capacity</span>
                          <div className="flex items-center space-x-1.5">
                            <span>{member.workload}%</span>
                            {member.workload >= 75 ? (
                              <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                High
                              </span>
                            ) : member.workload <= 50 ? (
                              <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                                Free
                              </span>
                            ) : (
                              <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                Normal
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-full bg-[#E5DBC7] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getWorkloadColor(
                              member.workload
                            )}`}
                            style={{ width: `${Math.min(100, member.workload)}%` }}
                          />
                        </div>
                      </div>

                      {/* Assigned Projects */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-[#8C7E6C] block">Projects:</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {member.projects.map(proj => (
                            <button
                              key={proj}
                              title="Click to toggle assignment"
                              onClick={() => handleToggleProjectAssignment(member.id, proj)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${getProjectTagStyle(
                                proj
                              )}`}
                            >
                              {proj}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Footer: Activity & Actions */}
                      <div className="pt-2 border-t border-[#EAE1D2] flex items-center justify-between text-xs text-[#7F7364]">
                        <span className="flex items-center space-x-1.5 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{member.lastActive}</span>
                        </span>

                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-[11px] font-bold text-rose-700 hover:text-rose-900 flex items-center space-x-1 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Desktop View: Full Data Table (hidden on mobile) */}
              <div className="hidden md:block bg-[#FAF7F2] rounded-2xl border border-[#DCD1BC] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E8DEC9] bg-[#F4EDE2]/80 text-[11px] font-bold text-[#7F7364] uppercase tracking-wider">
                        <th className="py-3 px-6">Name</th>
                        <th className="py-3 px-6">Role</th>
                        <th className="py-3 px-6">Projects</th>
                        <th className="py-3 px-6">Workload</th>
                        <th className="py-3 px-6">Last Active</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFE7D8] text-xs text-[#2A231D]">
                      {teamMembers
                        .filter(m => {
                          const matchesSearch =
                            m.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                            m.email.toLowerCase().includes(teamSearchQuery.toLowerCase());
                          const matchesRole = teamRoleFilter === 'All Roles' || m.role === teamRoleFilter;
                          const matchesProject =
                            teamProjectFilter === 'All Projects' || m.projects.includes(teamProjectFilter);
                          return matchesSearch && matchesRole && matchesProject;
                        })
                        .map(member => (
                          <tr key={member.id} className="hover:bg-[#F3EBDD]/50 transition-colors group">
                            {/* Name & Avatar */}
                            <td className="py-4 px-6">
                              <div className="flex items-center space-x-3">
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-9 h-9 rounded-full object-cover border border-[#DCD1BC] shadow-2xs"
                                />
                                <div>
                                  <div className="font-bold text-[#2A231D] flex items-center space-x-1.5">
                                    <span>{member.name}</span>
                                  </div>
                                  <div className="text-[11px] text-[#7F7364]">{member.email}</div>
                                </div>
                              </div>
                            </td>

                            {/* Role Badge */}
                            <td className="py-4 px-6 whitespace-nowrap">
                              <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getRoleBadgeStyle(
                                  member.role
                                )}`}
                              >
                                {member.role}
                              </span>
                            </td>

                            {/* Assigned Projects */}
                            <td className="py-4 px-6">
                              <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                                {member.projects.map(proj => (
                                  <button
                                    key={proj}
                                    title="Click to toggle project assignment"
                                    onClick={() => handleToggleProjectAssignment(member.id, proj)}
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all hover:opacity-80 ${getProjectTagStyle(
                                      proj
                                    )}`}
                                  >
                                    {proj}
                                  </button>
                                ))}
                                {/* Quick Add Project Dropdown */}
                                <div className="relative inline-block group/add">
                                  <button
                                    type="button"
                                    className="p-1 rounded-full text-[#8C7E6C] hover:bg-[#EAE0D0] hover:text-[#2A231D] transition-colors"
                                    title="Assign another project"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                  <div className="hidden group-hover/add:block absolute left-0 top-full mt-1 w-44 bg-white border border-[#DCD1BC] rounded-xl shadow-lg p-1 z-30">
                                    <div className="text-[10px] font-bold text-[#8C7E6C] px-2 py-1 uppercase">Assign project</div>
                                    {['Acme Digital Revamp', 'CRM Platform', 'Web Platform', 'Mobile App', 'Brand Refresh', 'API Integration'].map(pName => {
                                      const isAssigned = member.projects.includes(pName);
                                      return (
                                        <button
                                          key={pName}
                                          type="button"
                                          onClick={() => handleToggleProjectAssignment(member.id, pName)}
                                          className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between hover:bg-[#F5EFEB] ${
                                            isAssigned ? 'font-bold text-[#2A231D]' : 'text-[#6B5E4F]'
                                          }`}
                                        >
                                          <span>{pName}</span>
                                          {isAssigned && <Check className="w-3 h-3 text-[#10B981]" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Workload Progress Bar & AI Capacity Assumption */}
                            <td className="py-4 px-6 whitespace-nowrap">
                              <div className="w-36 space-y-1">
                                <div className="flex items-center justify-between text-[11px] font-bold text-[#4B3E32]">
                                  <span>{member.workload}%</span>
                                  {member.workload >= 75 ? (
                                    <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                      High Load
                                    </span>
                                  ) : member.workload <= 50 ? (
                                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-200">
                                      Available
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-200">
                                      Balanced
                                    </span>
                                  )}
                                </div>
                                <div className="w-full bg-[#E5DBC7] h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${getWorkloadColor(
                                      member.workload
                                    )}`}
                                    style={{ width: `${Math.min(100, member.workload)}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Last Active & Invitation Status */}
                            <td className="py-4 px-6 whitespace-nowrap">
                              {member.status === 'pending' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>Invite Sent</span>
                                  </span>
                                  {member.inviteLink && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(member.inviteLink || '');
                                        alert(`Copied invite link for ${member.name}:\n${member.inviteLink}`);
                                      }}
                                      className="block text-[10px] text-[#8C7E6C] hover:text-[#2A231D] underline font-semibold"
                                    >
                                      Copy Link
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] font-medium text-[#7F7364] flex items-center space-x-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <span>{member.lastActive}</span>
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-4 px-4 whitespace-nowrap text-right">
                              <div className="relative inline-block group/opt">
                                <button
                                  type="button"
                                  className="p-1.5 rounded-lg text-[#8C7E6C] hover:text-[#2A231D] hover:bg-[#EAE0D0] transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                <div className="hidden group-hover/opt:block absolute right-0 top-full mt-1 w-36 bg-white border border-[#DCD1BC] rounded-xl shadow-lg p-1 z-30">
                                  <button
                                    onClick={() => handleRemoveMember(member.id)}
                                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-1.5"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Remove Member</span>
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination Footer */}
                <div className="px-6 py-3.5 border-t border-[#E8DEC9] bg-[#F7F2E9]/60 flex items-center justify-between text-xs text-[#7F7364]">
                  <span>
                    Showing 1–{teamMembers.length} of {teamMembers.length} members
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      disabled
                      className="p-1 rounded text-[#B5A896] cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="w-6 h-6 rounded-full bg-[#2B231D] text-[#FAF6EE] flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <button
                      disabled
                      className="p-1 rounded text-[#B5A896] cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: ACTIVITY LOGS & ANALYTICS REPORTS */}
          {activeTab === 'reports' && (() => {
            const totalTasksCount = currentOrgTasks.length;
            const completedTasks = currentOrgTasks.filter(t => t.columnId === 'inreview' || t.progress === 100).length;
            const inProgressTasks = currentOrgTasks.filter(t => t.columnId === 'inprogress').length;
            const todoTasks = currentOrgTasks.filter(t => t.columnId === 'todo').length;
            const overallCompletionRate = totalTasksCount > 0 ? Math.round((completedTasks / totalTasksCount) * 100) : 0;
            const totalHoursLogged = currentOrgTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
            
            // Unified Risk Alert Radar: Combines high-risk tasks + products marked 'At Risk' or 'Needs Attention'
            const highRiskTasks = currentOrgTasks.filter(t => t.aiRiskScore === 'High').length;
            const atRiskProducts = currentOrgProducts.filter(p => p.health === 'At Risk' || p.health === 'Needs Attention').length;
            const totalRiskCount = highRiskTasks + atRiskProducts;

            return (
              <div className="space-y-5 sm:space-y-6">
                {/* Header & Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E5DBCA] gap-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#26201A] tracking-tight flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-[#756A5E]" />
                      <span>Activity Logs & Project Reports</span>
                    </h1>
                    <p className="text-xs text-[#7B7062] mt-0.5">
                      Comprehensive sprint analytics, team delivery velocity, risk radar, and audit ledger.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-start sm:self-auto">
                    <button
                      onClick={() => {
                        const reportText = `ARCHIVAL PM - SPRINT REPORT\nOrganization: ${currentOrg.name}\nFolder: ${currentFolder.name}\nCompletion Rate: ${overallCompletionRate}%\nTotal Tasks: ${totalTasksCount}\nCompleted: ${completedTasks}\nLogged Time: ${formatTimeSpent(totalHoursLogged)}\nGenerated: ${new Date().toLocaleString()}`;
                        navigator.clipboard.writeText(reportText);
                        alert('Sprint performance dossier copied to clipboard!');
                      }}
                      className="px-3.5 py-2 bg-[#2B231D] hover:bg-[#433931] text-[#FAF6EE] text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Export Dossier Report</span>
                    </button>
                  </div>
                </div>

                {/* 4 Stat KPI Highlights */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                      <span>Overall Velocity</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl font-black text-[#2A231D]">{overallCompletionRate}%</p>
                    <div className="w-full bg-[#E5DBC7] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div className="bg-emerald-600 h-full rounded-full transition-all duration-300" style={{ width: `${overallCompletionRate}%` }} />
                    </div>
                    <p className="text-[10px] text-[#7A6F62] mt-1.5">{completedTasks} of {totalTasksCount} tasks resolved</p>
                  </div>

                  <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                      <span>Time Invested</span>
                      <Timer className="w-4 h-4 text-[#8C7E6C]" />
                    </div>
                    <p className="text-2xl font-black font-mono text-[#2A231D]">{formatTimeSpent(totalHoursLogged)}</p>
                    <p className="text-[10px] text-amber-800 font-bold mt-1">Logged across sprint tasks</p>
                  </div>

                  <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                      <span>Active Pipeline</span>
                      <Layers className="w-4 h-4 text-[#8C7E6C]" />
                    </div>
                    <p className="text-2xl font-black text-[#2A231D]">{inProgressTasks}</p>
                    <p className="text-[10px] text-[#7A6F62] mt-1">{todoTasks} waiting in queue</p>
                  </div>

                  <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                      <span>Risk Alert Radar</span>
                      <Flame className={`w-4 h-4 ${totalRiskCount > 0 ? 'text-rose-600 animate-pulse' : 'text-[#8C7E6C]'}`} />
                    </div>
                    <p className={`text-2xl font-black ${totalRiskCount > 0 ? 'text-rose-800' : 'text-[#2A231D]'}`}>{totalRiskCount}</p>
                    <p className={`text-[10px] font-bold mt-1 ${totalRiskCount > 0 ? 'text-rose-700' : 'text-[#7A6F62]'}`}>
                      {totalRiskCount > 0 ? `${atRiskProducts} at-risk deliverables, ${highRiskTasks} high-risk tasks` : 'All items pacing healthy'}
                    </p>
                  </div>
                </div>

                {/* Visual Sprint Progress Matrix & Task Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Task Distribution Card */}
                  <div className="bg-[#FAF6EE] border border-[#DCD1BC] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold text-[#2A231D] flex items-center space-x-1.5">
                      <LayoutDashboard className="w-4 h-4 text-[#786C5E]" />
                      <span>Task Stage Distribution</span>
                    </h3>
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#54483B] mb-1">
                          <span>Todo Backlog</span>
                          <span>{todoTasks} cards ({totalTasksCount > 0 ? Math.round((todoTasks / totalTasksCount) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-[#E5DBC7] h-2 rounded-full overflow-hidden">
                          <div className="bg-[#9E8F7E] h-full" style={{ width: `${totalTasksCount > 0 ? (todoTasks / totalTasksCount) * 100 : 0}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#54483B] mb-1">
                          <span>In Progress</span>
                          <span>{inProgressTasks} cards ({totalTasksCount > 0 ? Math.round((inProgressTasks / totalTasksCount) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-[#E5DBC7] h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-600 h-full" style={{ width: `${totalTasksCount > 0 ? (inProgressTasks / totalTasksCount) * 100 : 0}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-semibold text-[#54483B] mb-1">
                          <span>In Review / Done</span>
                          <span>{completedTasks} cards ({totalTasksCount > 0 ? Math.round((completedTasks / totalTasksCount) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-[#E5DBC7] h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full" style={{ width: `${totalTasksCount > 0 ? (completedTasks / totalTasksCount) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Team Workload Allocation */}
                  <div className="bg-[#FAF6EE] border border-[#DCD1BC] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 lg:col-span-2">
                    <h3 className="text-sm font-bold text-[#2A231D] flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-[#786C5E]" />
                      <span>Contributor Allocation & Workload Index</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto no-scrollbar pt-1">
                      {teamMembers.map(member => (
                        <div key={member.id} className="p-2.5 bg-white/70 rounded-xl border border-[#E8DEC9] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 min-w-0">
                              <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover border border-[#DCD1BC]" />
                              <span className="text-xs font-bold text-[#2A231D] truncate">{member.name}</span>
                            </div>
                            <span className="text-[11px] font-mono font-bold text-[#6B5E4F]">{member.workload}%</span>
                          </div>
                          <div className="w-full bg-[#EAE0CE] h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${getWorkloadColor(member.workload)}`} style={{ width: `${Math.min(100, member.workload)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Ledger & Activity Stream */}
                <div className="bg-[#FAF6EE] border border-[#DCD1BC] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E8DEC9] gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#2A231D] flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-800" />
                        <span>Real-Time Audit Ledger & Telemetry Events</span>
                      </h3>
                      <p className="text-[11px] text-[#7A7064]">Full forensic trace of dossier updates, task reassignments, and system broadcasts</p>
                    </div>
                    <span className="text-[10px] font-mono bg-[#EAE0CF] px-2.5 py-1 rounded-lg text-[#554A3E] font-bold self-start sm:self-auto">
                      SQLite Synced • Live WebSockets
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: 1, user: 'Mason Walker', role: 'Admin', action: 'updated task palette to Peach on "Wehiu product task"', time: '2 mins ago', type: 'style' },
                      { id: 2, user: 'Sarah Jenkins', role: 'Designer', action: 'posted new design review comment on "Search inspirations for upcoming project"', time: '14 mins ago', type: 'comment' },
                      { id: 3, user: 'Lucas Wright', role: 'Systems Eng', action: 'marked milestone "API Gateway v2.1" as Completed', time: '1 hour ago', type: 'complete' },
                      { id: 4, user: 'Emma Carter', role: 'Product Owner', action: 'dispatched team invitation to maya@archivalpm.com', time: '3 hours ago', type: 'invite' },
                      { id: 5, user: 'System Telemetry', role: 'Engine', action: 'automated backup generated for Organization Apex Studio Agency', time: '6 hours ago', type: 'system' }
                    ].map(log => (
                      <div
                        key={log.id}
                        className="p-3 bg-white/80 hover:bg-white rounded-xl border border-[#E8DEC9] flex items-start justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-[#EAE0CF] text-[#3F3730] flex items-center justify-center shrink-0 mt-0.5">
                            {log.type === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                            {log.type === 'comment' && <MessageSquare className="w-3.5 h-3.5 text-[#5A4E40]" />}
                            {log.type === 'style' && <Palette className="w-3.5 h-3.5 text-amber-700" />}
                            {log.type === 'invite' && <Mail className="w-3.5 h-3.5 text-blue-700" />}
                            {log.type === 'system' && <ShieldAlert className="w-3.5 h-3.5 text-[#6D6052]" />}
                          </div>
                          <div className="min-w-0 text-xs">
                            <p className="text-[#2C241E] leading-relaxed">
                              <span className="font-bold text-[#1E1712]">{log.user}</span>{' '}
                              <span className="text-[10px] font-semibold text-[#8C7E6C] bg-[#F2EAE0] px-1.5 py-0.2 rounded border border-black/5 mr-1">
                                {log.role}
                              </span>
                              <span>{log.action}</span>
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-[#8C8072] shrink-0 whitespace-nowrap">{log.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* VIEW 7: CLIENT ACCOUNTS & DOSSIERS (Tactile Archival Client Management) */}
          {activeTab === 'clients' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Top Header & Search Bar */}
              <div className="flex flex-col md:flex-row md:items-start justify-between pb-3 sm:pb-4 border-b border-[#E5DBCA] gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4E9D5] text-[#8A4A1C] border border-[#DFD1B8]">
                      Client Relations & Accounts
                    </span>
                    <span className="text-xs text-[#7B7062]">
                      • {clients.length} Active Client Dossiers
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#26201A] tracking-tight mt-1 flex items-center space-x-2">
                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-[#756A5E] shrink-0" />
                    <span>Client Accounts & Dossiers</span>
                  </h1>
                  <p className="text-xs text-[#7B7062] mt-0.5 max-w-xl">
                    Manage key agency clients, enterprise retainers, contact persons, active deliverables, and contract scopes.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7E6C]" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-white/90 border border-[#DCD1BC] rounded-xl text-xs text-[#2A231D] placeholder-[#A09383] focus:outline-none focus:border-[#8C7E6C] focus:bg-white sm:w-56 shadow-xs transition-all"
                    />
                  </div>

                  {/* Add Client Button */}
                  <button
                    onClick={() => {
                      setNewClientName('');
                      setNewClientCompany('');
                      setNewClientContactName('');
                      setNewClientContactEmail('');
                      setNewClientContactPhone('');
                      setNewClientValue('$50,000');
                      setNewClientNotes('');
                      setNewClientWebsite('');
                      setIsNewClientModalOpen(true);
                    }}
                    className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl shadow hover:bg-[#433931] transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Client Dossier</span>
                  </button>
                </div>
              </div>

              {/* Quick Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>Total Accounts</span>
                    <Building2 className="w-3.5 h-3.5 text-[#8C7E6C]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#2A231D]">{clients.length}</p>
                  <p className="text-[9px] sm:text-[10px] text-emerald-700 font-bold mt-0.5 truncate">
                    {clients.filter(c => c.status === 'Active' || c.status === 'Retainer').length} active partnerships
                  </p>
                </div>

                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>Active Retainers</span>
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#2A231D]">
                    {clients.filter(c => c.tier === 'Retainer' || c.status === 'Retainer').length}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#7A6F62] mt-0.5 truncate">Monthly recurring scope</p>
                </div>

                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>Enterprise Tier</span>
                    <Award className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#2A231D]">
                    {clients.filter(c => c.tier === 'Enterprise').length}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-purple-800 font-semibold mt-0.5 truncate">Key Strategic Partners</p>
                </div>

                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>Pipeline Onboarding</span>
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#2A231D]">
                    {clients.filter(c => c.status === 'Onboarding' || c.status === 'In Negotiation').length}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-amber-800 font-semibold mt-0.5 truncate">New client setup in flight</p>
                </div>
              </div>

              {/* Status & Tier Filter Tabs */}
              <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 rounded-xl sm:rounded-2xl space-y-2.5">
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] font-bold text-[#8C7E6C] uppercase shrink-0 mr-1">Status:</span>
                  {['All', 'Active', 'Retainer', 'Onboarding', 'In Negotiation', 'Completed'].map(st => (
                    <button
                      key={st}
                      onClick={() => setClientStatusFilter(st)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                        clientStatusFilter === st
                          ? 'bg-[#2E2721] text-[#FAF6EE] shadow-2xs font-bold'
                          : 'bg-white/80 hover:bg-white text-[#635547] border border-[#DCD1BC]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 border-t border-[#E8DEC9] pt-2">
                  <span className="text-[10px] font-bold text-[#8C7E6C] uppercase shrink-0 mr-1">Tier:</span>
                  {['All', 'Enterprise', 'Retainer', 'Growth', 'Standard'].map(tr => (
                    <button
                      key={tr}
                      onClick={() => setClientTierFilter(tr)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                        clientTierFilter === tr
                          ? 'bg-[#3F3730] text-[#FAF6EE]'
                          : 'bg-white/70 hover:bg-white text-[#635547] border border-[#E3D9C8]'
                      }`}
                    >
                      {tr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clients Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {clients
                  .filter(c => {
                    const matchQuery =
                      c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                      c.company.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                      c.industry.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                      c.contact_name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
                      c.code.toLowerCase().includes(clientSearchQuery.toLowerCase());
                    const matchStatus = clientStatusFilter === 'All' || c.status === clientStatusFilter;
                    const matchTier = clientTierFilter === 'All' || c.tier === clientTierFilter;
                    return matchQuery && matchStatus && matchTier;
                  })
                  .map(client => {
                    return (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className="bg-[#FAF6EE] border border-[#D5CABB] hover:border-[#8C7E6C] rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                      >
                        {/* Manila Folder Subtle Top Indicator */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#D5CABB] group-hover:bg-[#8C7E6C] transition-colors" />

                        <div>
                          {/* Top Tag Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="font-mono text-[10px] font-black text-[#5C4F41] bg-[#EAE0CF] px-2 py-0.5 rounded border border-[#D5CABB]">
                              {client.code}
                            </span>
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                client.tier === 'Enterprise'
                                  ? 'bg-purple-100 text-purple-800 border-purple-200'
                                  : client.tier === 'Retainer'
                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                  : 'bg-[#EAE0CF] text-[#5C4F41] border-[#D5CABB]'
                              }`}>
                                {client.tier}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                client.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : client.status === 'Retainer'
                                  ? 'bg-blue-100 text-blue-800'
                                  : client.status === 'Onboarding'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-zinc-100 text-zinc-700'
                              }`}>
                                {client.status}
                              </span>
                            </div>
                          </div>

                          {/* Client Name & Company */}
                          <div className="flex items-start space-x-3 mb-3">
                            <img
                              src={client.avatar}
                              alt={client.name}
                              className="w-11 h-11 rounded-xl object-cover border border-[#DCD1BC] shrink-0 shadow-2xs"
                            />
                            <div className="min-w-0">
                              <h3 className="text-base font-black text-[#26201A] tracking-tight group-hover:underline truncate">
                                {client.name}
                              </h3>
                              <p className="text-xs text-[#7A6F62] truncate font-medium">
                                {client.company}
                              </p>
                              <span className="text-[10px] font-semibold text-[#8C7E6C] uppercase tracking-wider block mt-0.5">
                                {client.industry}
                              </span>
                            </div>
                          </div>

                          {/* Primary Contact Person Box */}
                          <div className="bg-[#F4ECE1] p-3 rounded-xl border border-[#DFD4C2] mb-3 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#7A6F62] font-semibold">Primary Contact:</span>
                              <span className="font-bold text-[#2A231D]">{client.contact_name}</span>
                            </div>
                            <div className="text-[11px] text-[#635547] flex items-center space-x-1.5 truncate">
                              <Mail className="w-3 h-3 text-[#8C7E6C] shrink-0" />
                              <span className="truncate">{client.contact_email}</span>
                            </div>
                            {client.contact_phone && (
                              <div className="text-[11px] text-[#635547] flex items-center space-x-1.5 truncate">
                                <Phone className="w-3 h-3 text-[#8C7E6C] shrink-0" />
                                <span className="truncate">{client.contact_phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Active Projects Tags */}
                          <div className="mb-3">
                            <span className="text-[10px] font-bold text-[#8C7E6C] uppercase tracking-wider block mb-1">
                              Assigned Dossiers:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {client.active_projects.map((proj, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/80 text-[#43392E] border border-[#D5CABB]"
                                >
                                  {proj}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom: Contract Value & Account Lead */}
                        <div className="pt-3 border-t border-[#E5DBCA] flex items-center justify-between text-xs mt-2">
                          <div>
                            <span className="text-[10px] font-bold text-[#8C7E6C] block uppercase">Scope Value</span>
                            <span className="text-sm font-black text-[#26201A] font-mono">{client.contract_value}</span>
                          </div>

                          <div className="flex items-center space-x-2 text-right">
                            <div>
                              <span className="text-[9px] font-bold text-[#8C7E6C] block uppercase">Lead</span>
                              <span className="text-xs font-bold text-[#3B322A]">{client.lead_owner}</span>
                            </div>
                            <img
                              src={client.lead_avatar}
                              alt={client.lead_owner}
                              className="w-6 h-6 rounded-full object-cover border border-[#D5CABB] shadow-2xs"
                              title={`Account Lead: ${client.lead_owner}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          {activeTab === 'products' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Top Action Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between pb-3 sm:pb-4 border-b border-[#E5DBCA] gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4E9D5] text-[#8A4A1C] border border-[#DFD1B8]">
                      Product Engineering
                    </span>
                    <span className="text-xs text-[#7B7062]">
                      • {currentOrgProducts.length} Active Deliverables
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#26201A] tracking-tight mt-1 flex items-center space-x-2">
                    <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#756A5E] shrink-0" />
                    <span>Products & Deliverables</span>
                  </h1>
                  <p className="text-xs text-[#7B7062] mt-0.5 max-w-xl">
                    Centralized product portfolios, milestone tracking, and task allocations matching your vintage archival dossier system.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C7E6C]" />
                    <input
                      type="text"
                      placeholder="Search deliverables..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-white/90 border border-[#DCD1BC] rounded-xl text-xs text-[#2A231D] placeholder-[#A09383] focus:outline-none focus:border-[#8C7E6C] focus:bg-white sm:w-56 shadow-xs transition-all"
                    />
                  </div>

                  {/* Add Product Button */}
                  <button
                    onClick={() => setIsNewProductModalOpen(true)}
                    className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl shadow hover:bg-[#433931] transition-all active:scale-95 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Product Dossier</span>
                  </button>
                </div>
              </div>

              {/* Quick Stat Highlights - 2 cols on mobile, 4 on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>Deliverables</span>
                    <Boxes className="w-3.5 h-3.5 text-[#8C7E6C]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#2A231D]">{currentOrgProducts.length}</p>
                  <p className="text-[9px] sm:text-[10px] text-emerald-700 font-bold mt-0.5 truncate">100% synced with tasks</p>
                </div>

                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>On Track</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#2A231D]">
                    {currentOrgProducts.filter(p => p.health === 'On Track').length}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#7A6F62] mt-0.5 truncate">Healthy velocity</p>
                </div>

                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>Needs Attention</span>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-amber-800">
                    {currentOrgProducts.filter(p => p.health !== 'On Track').length}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-amber-700 mt-0.5 truncate">Pacing radar alert</p>
                </div>

                <div className="bg-[#FAF6EE] border border-[#DCD1BC] p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7A6F62] font-semibold mb-1">
                    <span>Avg Completion</span>
                    <Gauge className="w-3.5 h-3.5 text-[#8C7E6C]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#2A231D]">
                    {currentOrgProducts.length > 0
                      ? Math.round(currentOrgProducts.reduce((acc, p) => acc + (p.metrics?.completionRate || 0), 0) / currentOrgProducts.length)
                      : 0}%
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-[#7A6F62] mt-0.5 truncate">Across all features</p>
                </div>
              </div>

              {/* Filter Pills: Horizontal scrolling without pushing layout on phone screens */}
              <div className="space-y-2 bg-[#F5EFEB]/90 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border border-[#DCD1BC] overflow-hidden">
                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <span className="text-[10px] font-bold text-[#8C7E6C] uppercase shrink-0 mr-1">Category:</span>
                  {['All', 'Web App', 'Mobile App', 'Design System', 'API & Service'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setProductCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${
                        productCategoryFilter === cat
                          ? 'bg-[#2B231D] text-[#FAF6EE] shadow-xs'
                          : 'bg-white/80 hover:bg-white text-[#635547] border border-[#DCD1BC]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5 border-t border-[#E8DEC9] pt-2">
                  <span className="text-[10px] font-bold text-[#8C7E6C] uppercase shrink-0 mr-1">Stage:</span>
                  {['All', 'Discovery', 'In Development', 'Review & QA', 'Launched'].map(stg => (
                    <button
                      key={stg}
                      onClick={() => setProductStageFilter(stg)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all shrink-0 whitespace-nowrap ${
                        productStageFilter === stg
                          ? 'bg-[#3F3730] text-[#FAF6EE]'
                          : 'bg-white/70 hover:bg-white text-[#635547] border border-[#E3D9C8]'
                      }`}
                    >
                      {stg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {currentOrgProducts
                  .filter(p => {
                    const matchQuery =
                      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.code.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.description.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                      p.lead_name.toLowerCase().includes(productSearchQuery.toLowerCase());
                    const matchCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
                    const matchStage = productStageFilter === 'All' || p.stage === productStageFilter;
                    return matchQuery && matchCategory && matchStage;
                  })
                  .map(product => {
                    const colorStyle = getColorStyles(product.color);
                    const completedFeatures = product.features.filter(f => f.status === 'Completed').length;
                    const totalFeatures = product.features.length;

                    return (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`${colorStyle.bg} border ${colorStyle.border} rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between relative group`}
                      >
                        {/* Top Card Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono bg-black/10 text-[#2B231D]">
                                {product.code}
                              </span>
                              <span className="text-[10px] font-bold text-[#7A6F62] bg-white/70 px-2 py-0.5 rounded-md border border-black/5">
                                {product.version}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1.5">
                              {/* Health Badge */}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center space-x-1 ${
                                product.health === 'On Track'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : product.health === 'At Risk'
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  product.health === 'On Track'
                                    ? 'bg-emerald-600'
                                    : product.health === 'At Risk'
                                    ? 'bg-rose-600'
                                    : 'bg-amber-600'
                                }`}></span>
                                <span>{product.health}</span>
                              </span>

                              {/* Delete button */}
                              <button
                                onClick={(e) => handleDeleteProduct(product.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-[#8C7E6C] hover:text-rose-700 hover:bg-black/5 rounded-md transition-all"
                                title="Archive product dossier"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Title & Category */}
                          <div className="mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A6F62]">
                              {product.category}
                            </span>
                            <h3 className="text-base font-black text-[#26201A] tracking-tight leading-snug group-hover:underline">
                              {product.name}
                            </h3>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-[#524639] line-clamp-2 leading-relaxed mb-4">
                            {product.description}
                          </p>

                          {/* Feature Checkpoints Preview */}
                          <div className="space-y-1.5 mb-4 bg-white/60 p-2.5 rounded-xl border border-black/5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-[#635547] mb-1">
                              <span>Milestone Features</span>
                              <span>{completedFeatures}/{totalFeatures}</span>
                            </div>
                            {product.features.slice(0, 3).map(feature => (
                              <div
                                key={feature.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleProductFeature(product.id, feature.id);
                                }}
                                className="flex items-center space-x-2 text-[11px] text-[#42362A] hover:text-black cursor-pointer group/feat"
                              >
                                {feature.status === 'Completed' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-[#9C8F7E] group-hover/feat:text-amber-700 shrink-0" />
                                )}
                                <span className={feature.status === 'Completed' ? 'line-through opacity-70' : ''}>
                                  {feature.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Bottom Progress & Lead Meta */}
                        <div className="pt-3 border-t border-black/10 space-y-3">
                          {/* Progress Meter */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] font-bold text-[#5C4F41] mb-1">
                              <span>Product Readiness</span>
                              <span>{product.metrics.completionRate}%</span>
                            </div>
                            <div className="w-full bg-black/10 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#2B231D] transition-all duration-300"
                                style={{ width: `${product.metrics.completionRate}%` }}
                              />
                            </div>
                          </div>

                          {/* Footer Info: Lead & Target Date */}
                          <div className="flex items-center justify-between pt-1 text-[11px] text-[#635547]">
                            <div className="flex items-center space-x-2">
                              <img
                                src={product.lead_avatar}
                                alt={product.lead_name}
                                className="w-5 h-5 rounded-full object-cover border border-white"
                              />
                              <span className="font-semibold text-[#2C241E] truncate max-w-[100px]">
                                {product.lead_name}
                              </span>
                            </div>

                            <div className="flex items-center space-x-1 text-[10px] font-medium text-[#7A6F62]">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{product.target_release}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* VIEW 8: SYSTEM & ARCHIVAL SETTINGS (Fully Functional) */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6 max-w-4xl">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between pb-3 sm:pb-4 border-b border-[#E5DBCA] gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4E9D5] text-[#8A4A1C] border border-[#DFD1B8]">
                      Account & Preferences
                    </span>
                    <span className="text-xs text-[#7B7062]">
                      • Workspace: {currentOrg.name}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#26201A] tracking-tight mt-1 flex items-center space-x-2">
                    <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-[#756A5E] shrink-0" />
                    <span>System Settings & Profile</span>
                  </h1>
                  <p className="text-xs text-[#7B7062] mt-0.5 max-w-xl">
                    Configure your user identity, active organization dossiers, notification rules, and archival security credentials.
                  </p>
                </div>

                {settingsSaveMessage && (
                  <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{settingsSaveMessage}</span>
                  </div>
                )}
                {settingsSaveError && (
                  <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{settingsSaveError}</span>
                  </div>
                )}
              </div>

              {/* Subtab Navigation Pills */}
              <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'profile' as const, label: 'Profile & Identity', icon: Users },
                  { id: 'organization' as const, label: 'Organization & Workspace', icon: Building2 },
                  { id: 'notifications' as const, label: 'Alerts & Notifications', icon: Bell },
                  { id: 'security' as const, label: 'Password & Security', icon: Lock },
                  { id: 'integrations' as const, label: 'System & Preferences', icon: ShieldAlert }
                ].map(sub => {
                  const Icon = sub.icon;
                  const isActive = settingsActiveSubtab === sub.id;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setSettingsActiveSubtab(sub.id);
                        setSettingsSaveMessage(null);
                        setSettingsSaveError(null);
                      }}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-[#2E2721] text-[#FAF6EE] shadow-sm'
                          : 'bg-[#FAF6EE] text-[#5C5042] border border-[#DCD1BC] hover:bg-[#F3ECE0]'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#DCD1BC]' : 'text-[#8C7E6C]'}`} />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB 1: PROFILE & IDENTITY */}
              {settingsActiveSubtab === 'profile' && (
                <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-[#2A231D] mb-1">User Profile</h3>
                    <p className="text-xs text-[#7A7064]">Update your avatar, display name, and communication email across all task cards.</p>
                  </div>

                  {/* Avatar Picker */}
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-5 pt-2">
                    <img
                      src={settingsAvatar || currentUser.avatar}
                      alt={settingsName}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#D5CABB] shadow-xs"
                    />
                    <div className="space-y-1.5 flex-1">
                      <label className="block text-[11px] font-bold text-[#7A6E60] uppercase">
                        Avatar Image URL
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="url"
                          value={settingsAvatar}
                          onChange={(e) => setSettingsAvatar(e.target.value)}
                          placeholder="https://..."
                          className="flex-1 px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                        />
                        <button
                          type="button"
                          onClick={() => setSettingsAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop')}
                          className="px-2.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#D5CABB] hover:bg-[#F5EFEB] text-[#5A4E40] shrink-0"
                          title="Reset to default portrait"
                        >
                          Default
                        </button>
                      </div>
                    </div>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSettingsSaveMessage(null);
                      setSettingsSaveError(null);
                      try {
                        const res = await fetch(`${API_BASE}/auth/profile`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            name: settingsName,
                            email: settingsEmail,
                            avatar_url: settingsAvatar
                          })
                        });
                        if (res.ok) {
                          const data = await res.json();
                          setCurrentUser({
                            name: data.user.name,
                            email: data.user.email,
                            avatar: data.user.avatar_url || settingsAvatar
                          });
                          setSettingsSaveMessage('Profile credentials updated and synced successfully.');
                          setTimeout(() => setSettingsSaveMessage(null), 4000);
                        } else {
                          const errData = await res.json();
                          setSettingsSaveError(errData.error || 'Failed to update profile.');
                        }
                      } catch (err: any) {
                        setSettingsSaveError(err.message || 'Network error updating profile.');
                      }
                    }}
                    className="space-y-4 pt-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                          Full Display Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsName}
                          onChange={(e) => setSettingsName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={settingsEmail}
                          onChange={(e) => setSettingsEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                        Professional Title & Department
                      </label>
                      <input
                        type="text"
                        value={settingsRole}
                        onChange={(e) => setSettingsRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl shadow hover:bg-[#433931] transition-all cursor-pointer flex items-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: ORGANIZATION & WORKSPACE */}
              {settingsActiveSubtab === 'organization' && (
                <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-[#2A231D] mb-1">Active Organization Workspace</h3>
                    <p className="text-xs text-[#7A7064]">
                      Edit details for <strong>{currentOrg.name}</strong> ({currentOrg.folders.length} Dossiers).
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSettingsSaveMessage(null);
                      const targetName = settingsOrgName.trim() || currentOrg.name;
                      const targetDesc = settingsOrgDescription.trim() || currentOrg.description;

                      const updatedOrgs = organizations.map(o => {
                        if (o.id === currentOrg.id) {
                          return { ...o, name: targetName, description: targetDesc };
                        }
                        return o;
                      });

                      setOrganizations(updatedOrgs);
                      setCurrentOrg(prev => ({ ...prev, name: targetName, description: targetDesc }));
                      setSettingsSaveMessage(`Workspace "${targetName}" updated successfully.`);
                      setTimeout(() => setSettingsSaveMessage(null), 4000);
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                        Organization Workspace Name
                      </label>
                      <input
                        type="text"
                        placeholder={currentOrg.name}
                        value={settingsOrgName}
                        onChange={(e) => setSettingsOrgName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                        Organization Dossier Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder={currentOrg.description || 'Focus areas and business scope...'}
                        value={settingsOrgDescription}
                        onChange={(e) => setSettingsOrgDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                      />
                    </div>

                    {/* Organization Folders Quick List */}
                    <div className="p-3.5 bg-[#F4ECE1] rounded-xl border border-[#DFD4C2] space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#4F4438]">
                        <span>Dossiers in this Workspace:</span>
                        <span>{currentOrg.folders.length} Active</span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {currentOrg.folders.map(f => (
                          <div key={f.id} className="px-2.5 py-1 bg-white rounded-lg border border-[#D5CABB] text-xs font-medium text-[#2C241E] flex items-center space-x-1.5 shadow-2xs">
                            <Folder className="w-3.5 h-3.5 text-amber-700" />
                            <span>{f.name}</span>
                            <span className="font-mono text-[9px] text-[#A66030] font-bold">({f.code})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl shadow hover:bg-[#433931] transition-all cursor-pointer flex items-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Update Workspace</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 3: ALERTS & NOTIFICATIONS */}
              {settingsActiveSubtab === 'notifications' && (
                <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#2A231D] mb-1">Notification & Event Rules</h3>
                    <p className="text-xs text-[#7A7064]">Choose how real-time WebSocket actions and deadline reminders trigger alerts.</p>
                  </div>

                  <div className="space-y-3 pt-1">
                    {[
                      {
                        title: 'Email Notifications & Daily Summary',
                        desc: 'Send daily digests for critical dossier updates and milestones via SMTP.',
                        checked: settingsEmailAlerts,
                        setter: setSettingsEmailAlerts
                      },
                      {
                        title: 'Task Assignment & Mention Broadcasts',
                        desc: 'Receive live alerts when you are assigned or mentioned on a task card.',
                        checked: settingsTaskAssignedAlerts,
                        setter: setSettingsTaskAssignedAlerts
                      },
                      {
                        title: 'Realistic Deadline & Slip Risk Alerts',
                        desc: 'AI radar warnings for tasks slipping past estimated milestone velocity.',
                        checked: settingsDeadlineReminders,
                        setter: setSettingsDeadlineReminders
                      },
                      {
                        title: 'Audio Feedback & Stopwatch Chimes',
                        desc: 'Play subtle mechanical typewriter / click chimes when toggling timers.',
                        checked: settingsSoundEffects,
                        setter: setSettingsSoundEffects
                      }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          item.setter(!item.checked);
                          setSettingsSaveMessage('Notification preferences updated.');
                          setTimeout(() => setSettingsSaveMessage(null), 3000);
                        }}
                        className="flex items-center justify-between p-3.5 bg-white border border-[#D5CABB] hover:border-[#8C7E6C] rounded-xl cursor-pointer transition-colors shadow-2xs"
                      >
                        <div className="pr-4">
                          <p className="text-xs font-bold text-[#2A231D]">{item.title}</p>
                          <p className="text-[11px] text-[#7A7064] mt-0.5">{item.desc}</p>
                        </div>
                        <div
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                            item.checked ? 'bg-[#2E2721]' : 'bg-[#DCD1BC]'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              item.checked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PASSWORD & SECURITY */}
              {settingsActiveSubtab === 'security' && (
                <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-[#2A231D] mb-1">Password & Authentication Security</h3>
                    <p className="text-xs text-[#7A7064]">Keep your archival account safe with an encrypted bcrypt password.</p>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setSettingsSaveMessage(null);
                      setSettingsSaveError(null);

                      if (settingsNewPassword !== settingsConfirmPassword) {
                        setSettingsSaveError('New password and confirmation do not match.');
                        return;
                      }

                      try {
                        const res = await fetch(`${API_BASE}/auth/password`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            currentPassword: settingsCurrentPassword,
                            newPassword: settingsNewPassword
                          })
                        });

                        if (res.ok) {
                          setSettingsCurrentPassword('');
                          setSettingsNewPassword('');
                          setSettingsConfirmPassword('');
                          setSettingsSaveMessage('Password updated successfully.');
                          setTimeout(() => setSettingsSaveMessage(null), 4000);
                        } else {
                          const errData = await res.json();
                          setSettingsSaveError(errData.error || 'Failed to update password.');
                        }
                      } catch (err: any) {
                        setSettingsSaveError(err.message || 'Network error updating password.');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={settingsCurrentPassword}
                        onChange={(e) => setSettingsCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                          New Password (min 6 chars) *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={settingsNewPassword}
                          onChange={(e) => setSettingsNewPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                          Confirm New Password *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={settingsConfirmPassword}
                          onChange={(e) => setSettingsConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl shadow hover:bg-[#433931] transition-all cursor-pointer flex items-center space-x-1.5"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: SYSTEM & PREFERENCES */}
              {settingsActiveSubtab === 'integrations' && (
                <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                  <div>
                    <h3 className="text-base font-bold text-[#2A231D] mb-1">Display & System Preferences</h3>
                    <p className="text-xs text-[#7A7064]">Fine-tune layout density and view telemetry status.</p>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-[#D5CABB] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-[#2A231D]">Compact Board Density</p>
                        <p className="text-[11px] text-[#7A7064]">Display smaller task cards to fit more columns across the screen.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsCompactMode(!settingsCompactMode);
                          setSettingsSaveMessage(`Compact view ${!settingsCompactMode ? 'enabled' : 'disabled'}.`);
                          setTimeout(() => setSettingsSaveMessage(null), 3000);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          settingsCompactMode ? 'bg-[#2E2721] text-white' : 'bg-[#EAE0CF] text-[#4F4438]'
                        }`}
                      >
                        {settingsCompactMode ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#E8DEC9] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#2A231D]">WebSocket Tunnel Status</p>
                        <p className="text-[11px] text-[#7A7064]">Port 3001 live event synchronization</p>
                      </div>
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping mr-1"></span>
                        Connected
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#E8DEC9] flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#2A231D]">SQLite Storage Database</p>
                        <p className="text-[11px] text-[#7A7064]">Local persistence file at ./backend/app.db</p>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-[#695D50] bg-[#EFE8DC] px-2 py-0.5 rounded">
                        Healthy • Ready
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Task Detail Modal & Live Card Color Changer */}
      {selectedTask && (() => {
        const currentModalTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;
        return (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Drag Handle indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto my-2 shrink-0" />
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#EFE8DC] border-b border-[#DCD1BC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-[#665A4E]" />
                <span className="text-xs font-bold text-[#7A6E60] uppercase tracking-wider">
                  Dossier Card #{currentModalTask.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E5DBC7] font-semibold text-[#4F4437]">
                  Column: {selectedTask.columnId.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-[#786D60] hover:text-[#2A231D] hover:bg-[#E3D8C4] transition-colors touch-target"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
              {/* Title & Priority */}
              <div>
                <div className="flex items-center space-x-1.5 mb-2">
                  {selectedTask.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8DECA] text-[#554A3D]">
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs px-2 py-0.5 rounded-md font-bold text-amber-800 bg-amber-100">
                    Priority: {selectedTask.priority}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#2C241E] leading-snug">
                  {selectedTask.title}
                </h2>
              </div>

              {/* LIVE STOPWATCH TIME TRACKER & REALISTIC DEADLINE (P2 User Request!) */}
              <div className="bg-[#FAF6EE] p-5 rounded-2xl border-2 border-[#DCD1BC] shadow-inner space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8DEC9]">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-[#2B231D] text-[#FAF6EE]">
                      <Timer className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#2B231D]">Stopwatch Time Tracker</h4>
                      <p className="text-[11px] text-[#786D60]">Track real-time effort dedicated to this task dossier</p>
                    </div>
                  </div>

                  {/* AI Risk Score Pill */}
                  <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                    <span className="text-[11px] font-bold text-[#7A6D5E]">Pacing Radar:</span>
                    <span
                      className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full flex items-center space-x-1.5 ${
                        currentModalTask.aiRiskScore === 'High'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : currentModalTask.aiRiskScore === 'Medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {currentModalTask.aiRiskScore === 'High' && <Flame className="w-3.5 h-3.5" />}
                      {currentModalTask.aiRiskScore === 'Medium' && <AlertTriangle className="w-3.5 h-3.5" />}
                      {currentModalTask.aiRiskScore === 'Low' && <ShieldAlert className="w-3.5 h-3.5" />}
                      <span>{currentModalTask.aiRiskScore || 'Low'} Risk</span>
                    </span>
                  </div>
                </div>

                {/* Big Stopwatch Display & Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-[#D5CABB] shadow-2xs gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8A7D6F]">Time Spent on Task</span>
                    <div className="text-3xl font-black font-mono text-[#2B231D] tracking-tight flex items-baseline space-x-1">
                      <span>{formatTimeSpent(currentModalTask.timeSpent || 0)}</span>
                      <span className="text-xs font-sans font-bold text-[#8C7E6C]">
                        / {currentModalTask.estimatedHours || 4}h target
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleTimer(currentModalTask.id)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow flex items-center space-x-2 transition-all ${
                        currentModalTask.isTimerRunning
                          ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse'
                          : 'bg-[#2B231D] hover:bg-[#43382F] text-[#FAF6EE]'
                      }`}
                    >
                      {currentModalTask.isTimerRunning ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>Pause Timer</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Start Stopwatch</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetTimer(currentModalTask.id)}
                      className="p-2.5 rounded-xl border border-[#DCD1BC] hover:bg-[#EFE8DC] text-[#7A6D5E] transition-colors"
                      title="Reset stopwatch to 0"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Realistic Assumption Insights & Target Estimator */}
                <div className="p-3 bg-[#EFE8DC] rounded-xl border border-[#DCD1BC] text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#3B3228] flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#B26B00]" />
                      <span>AI Realistic Capacity Assumption</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] text-[#7F7263]">Target Hours:</span>
                      <input
                        type="number"
                        min="0.5"
                        max="80"
                        step="0.5"
                        value={selectedTask.estimatedHours || 4}
                        onChange={(e) => handleSetEstimatedHours(selectedTask.id, parseFloat(e.target.value) || 1)}
                        className="w-14 px-1.5 py-0.5 text-center bg-white border border-[#DCD1BC] rounded-lg font-bold text-[#2A231D] text-xs"
                      />
                      <span className="text-[11px] font-bold text-[#6B5E4F]">hrs</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#635749] leading-relaxed">
                    {selectedTask.aiRiskReason || 'AI analysis: Sprint pacing is within expected productivity bounds.'}
                  </p>
                </div>
              </div>

              {/* PRODUCT DELIVERABLE ASSIGNMENT: Dropdown Selector */}
              <div className="bg-[#F5EFEB] p-4 rounded-xl border border-[#DCD1BC] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#5A4F42]">
                  <span className="flex items-center space-x-1.5">
                    <Package className="w-4 h-4 text-[#7A6E60]" />
                    <span>Product Deliverable Association</span>
                  </span>
                  <span className="font-semibold text-[#8C8072]">
                    {selectedTask.product_name || 'Standalone Task'}
                  </span>
                </div>

                <ArchivalSelect
                  value={selectedTask.product_id || ''}
                  onChange={(val) => handleTaskProductChange(selectedTask.id, val)}
                  placeholder="Assign to Product Deliverable"
                  options={[
                    { value: '', label: 'None (Standalone Deliverable)', icon: <Layers className="w-3.5 h-3.5 text-[#8C7E6C]" /> },
                    ...products.map(p => ({
                      value: p.id,
                      label: `${p.name} (${p.code})`,
                      badge: p.stage,
                      icon: <Package className="w-3.5 h-3.5 text-[#8C7E6C]" />
                    }))
                  ]}
                  title="Link this card to a Product Deliverable"
                />
              </div>

              {/* CARD COLOR CHANGER: Rich Custom Interactive Dropdown Menu */}
              <div className="bg-[#F5EFEB] p-4 rounded-xl border border-[#DCD1BC] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#5A4F42]">
                  <span className="flex items-center space-x-1.5">
                    <Palette className="w-4 h-4 text-[#7A6E60]" />
                    <span>Card Color Theme</span>
                  </span>
                  <span className="capitalize font-semibold text-[#8C8072]">Active: {selectedTask.color}</span>
                </div>

                <div className="relative dropdown-container" data-dropdown="true">
                  <button
                    type="button"
                    onClick={() => setIsDetailColorDropdownOpen(!isDetailColorDropdownOpen)}
                    className="w-full bg-white border border-[#D5CABB] hover:border-[#8C7E6C] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A231D] flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-4 h-4 rounded-full border border-black/15 shadow-xs shrink-0 ${getColorStyles(selectedTask.color).bg}`} />
                      <span className="capitalize font-extrabold text-[#2C241E]">
                        {selectedTask.color === 'peach' ? 'Peach Warmth' :
                         selectedTask.color === 'blue' ? 'Archival Blue' :
                         selectedTask.color === 'mint' ? 'Mint Herbal' :
                         selectedTask.color === 'purple' ? 'Lavender Purple' :
                         selectedTask.color === 'coral' ? 'Coral Flame' : 'Canary Yellow'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#8C7E6C] transition-transform duration-200 ${isDetailColorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Rich Custom Dropdown Menu with Color Swatches */}
                  {isDetailColorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { id: 'peach' as CardColor, label: 'Peach Warmth', desc: 'Warm archival hue' },
                        { id: 'blue' as CardColor, label: 'Archival Blue', desc: 'Classic dossier tone' },
                        { id: 'mint' as CardColor, label: 'Mint Herbal', desc: 'Refreshing focus green' },
                        { id: 'purple' as CardColor, label: 'Lavender Purple', desc: 'Creative design tint' },
                        { id: 'coral' as CardColor, label: 'Coral Flame', desc: 'Urgent priority tone' },
                        { id: 'canary' as CardColor, label: 'Canary Yellow', desc: 'Noticeable highlight' }
                      ].map(({ id, label, desc }) => {
                        const st = getColorStyles(id);
                        const isSelected = selectedTask.color === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              handleTaskColorChange(selectedTask.id, id);
                              setIsDetailColorDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                              isSelected
                                ? 'bg-[#EAE0CF] text-[#2C241E] font-bold shadow-2xs'
                                : 'hover:bg-white text-[#4A3F33]'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-5 h-5 rounded-full border border-black/15 shadow-xs shrink-0 ${st.bg}`} />
                              <div className="text-left">
                                <p className="font-bold leading-tight">{label}</p>
                                <p className="text-[10px] text-[#8C7E6C]">{desc}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#2C241E] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ASSIGNED TEAM MEMBERS: Space-Saving Custom Dropdown Selector */}
              <div className="bg-[#F5EFEB] p-4 rounded-xl border border-[#DCD1BC] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#5A4F42]">
                  <span className="flex items-center space-x-1.5">
                    <Users className="w-4 h-4 text-[#7A6E60]" />
                    <span>Assigned Team Members</span>
                  </span>
                  <span className="text-[11px] text-[#8C7E6C] font-semibold">
                    {selectedTask.assignees.length} assigned
                  </span>
                </div>

                {/* Selected Member Badges with 1-Click Remove */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[30px]">
                  {selectedTask.assignees.map((assignee, idx) => {
                    const memberObj = teamMembers.find(m => m.name === assignee.name);
                    return (
                      <div
                        key={idx}
                        className="inline-flex items-center space-x-1.5 bg-white pl-1.5 pr-2 py-0.5 rounded-full border border-[#DCD1BC] shadow-2xs text-xs font-bold text-[#2A231D]"
                      >
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-4 h-4 rounded-full object-cover border border-[#DCD1BC]"
                        />
                        <span>{assignee.name}</span>
                        {selectedTask.assignees.length > 1 && memberObj && (
                          <button
                            type="button"
                            onClick={() => handleToggleTaskAssignee(selectedTask.id, memberObj)}
                            className="text-[#9C8F80] hover:text-red-700 ml-0.5"
                            title={`Unassign ${assignee.name}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Dropdown Toggle matching the Color Theme Aesthetic */}
                <div className="relative dropdown-container" data-dropdown="true">
                  <button
                    type="button"
                    onClick={() => setIsDetailMemberDropdownOpen(!isDetailMemberDropdownOpen)}
                    className="w-full bg-white border border-[#D5CABB] hover:border-[#8C7E6C] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2A231D] flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-[#8C7E6C]" />
                      <span>Assign / Manage Contributors ({teamMembers.length} available)</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#8C7E6C] transition-transform duration-200 ${isDetailMemberDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Rich Popover Menu with live team members & instant updates */}
                  {isDetailMemberDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto no-scrollbar">
                      <div className="p-1.5 text-[10px] font-bold uppercase text-[#8C7E6C] tracking-wider border-b border-[#E8DEC9] mb-1">
                        Select contributors to toggle assignment:
                      </div>
                      {teamMembers.map(member => {
                        const isAssigned = (selectedTask.assignees || []).some(a => a.name === member.name);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => handleToggleTaskAssignee(selectedTask.id, member)}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                              isAssigned
                                ? 'bg-[#EAE0CF] text-[#2C241E] font-bold shadow-2xs'
                                : 'hover:bg-white text-[#4A3F33]'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-6 h-6 rounded-full object-cover border border-[#DCD1BC] shrink-0"
                              />
                              <div className="text-left min-w-0">
                                <p className="font-bold leading-tight truncate">{member.name}</p>
                                <p className="text-[10px] text-[#8C7E6C] truncate">{member.role}</p>
                              </div>
                            </div>
                            {isAssigned && <Check className="w-4 h-4 text-[#2C241E] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress & Subtasks */}
              <div className="bg-[#F5EFEB] p-5 rounded-2xl border border-[#DCD1BC] space-y-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#5A4F42]">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#7A6E60]" />
                    <span>Checklist & Progress</span>
                  </span>
                  <span className="font-extrabold text-[#2C241E]">
                    {selectedTask.progress}% Complete
                    {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
                      <span className="text-[#877A6C] font-normal ml-1.5">
                        ({selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length} done)
                      </span>
                    )}
                  </span>
                </div>

                <div className="w-full bg-[#DCD1BC] h-2.5 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="bg-[#3D342C] h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>

                {/* Checklist Container matching reference */}
                <div className="bg-white/80 rounded-xl p-3 border border-[#E3D8C4] space-y-2">
                  {selectedTask.subtasks && selectedTask.subtasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedTask.subtasks.map(st => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between group p-1.5 rounded-lg hover:bg-black/5 transition-colors"
                        >
                          <div
                            onClick={() => toggleSubtask(selectedTask.id, st.id)}
                            className="flex items-center space-x-2.5 text-xs text-[#322A22] cursor-pointer flex-1"
                          >
                            {st.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-purple-300 hover:text-purple-600 flex-shrink-0" />
                            )}
                            <span className={st.completed ? 'line-through text-[#8D7F6E]' : 'font-medium'}>
                              {st.text}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(st.id)}
                            className="opacity-0 group-hover:opacity-100 text-[#9E9080] hover:text-red-700 p-1 transition-opacity"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8C7F70] italic py-2 text-center">
                      No todo checklist items yet. Add tasks below to start tracking progress!
                    </p>
                  )}

                  {/* Add Subtask Input Form */}
                  <form onSubmit={handleAddSubtaskToSelectedTask} className="flex space-x-2 pt-2 border-t border-[#E8DEC9]">
                    <input
                      type="text"
                      placeholder="Add a todo item (e.g. Make wireframe, Setup database)..."
                      value={newSubtaskInput}
                      onChange={(e) => setNewSubtaskInput(e.target.value)}
                      className="flex-1 bg-white border border-[#D5CABB] rounded-xl px-3 py-1.5 text-xs text-[#2A231D] placeholder-[#9D9181] focus:outline-none focus:ring-1 focus:ring-[#7D6F5E]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#2E2721] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#463D34] transition-colors"
                    >
                      Add
                    </button>
                  </form>
                </div>
              </div>

              {/* Move Column Selector */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-[#6E6152]">Move To Column:</span>
                {(['todo', 'inprogress', 'inreview'] as const).map(col => (
                  <button
                    key={col}
                    onClick={() => moveTask(selectedTask.id, col)}
                    className={`px-3 py-1 rounded-lg font-bold border transition-colors ${
                      selectedTask.columnId === col
                        ? 'bg-[#2E2721] text-[#FAF6EE] border-[#2E2721]'
                        : 'bg-[#EFE8DC] text-[#554A3D] border-[#DCD1BC] hover:bg-[#E4DAC7]'
                    }`}
                  >
                    {col === 'todo' ? 'Todo list' : col === 'inprogress' ? 'In Progress' : 'In Review'}
                  </button>
                ))}
              </div>

              {/* Discussion & Comments */}
              <div className="pt-4 border-t border-[#E5DBCA]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#2E2721] flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Card Discussion & Real-Time Comments ({selectedTask.comments.length})</span>
                  </h3>
                  <span className="text-[11px] text-[#86796A] font-medium">Broadcasts via WebSockets</span>
                </div>

                <form onSubmit={handleAddComment} className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    placeholder="Write a comment to the team..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-white border border-[#D5CABB] rounded-xl px-3.5 py-2 text-xs text-[#2A231D] placeholder-[#9D9181] focus:outline-none focus:ring-2 focus:ring-[#7D6F5E]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#2D2620] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#463D34] flex items-center space-x-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>

                <div className="space-y-3">
                  {selectedTask.comments.map(c => (
                    <div key={c.id} className="p-3 bg-[#F4EDE0] rounded-xl border border-[#E3D7C3] flex items-start space-x-3">
                      <img src={c.avatar} alt={c.author} className="w-7 h-7 rounded-full border border-[#D0C3AD] object-cover flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2A231D]">{c.author}</span>
                          <span className="text-[10px] text-[#8C8072]">{c.time}</span>
                        </div>
                        <p className="text-xs text-[#453C32] leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Modal: Create Task Card */}
      {isNewTaskModalOpen && (() => {
        const modalColorStyles = getColorStyles(newTaskColor);
        return (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className={`border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 pb-8 sm:pb-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200 transition-colors ${modalColorStyles.bg}`}>
            {/* Mobile Drag Handle indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DEC9]">
              <div className="flex items-center space-x-2">
                <span className={`w-3.5 h-3.5 rounded-full border border-black/15 shadow-xs shrink-0 ${modalColorStyles.bg}`} />
                <h3 className="text-base font-bold text-[#2C241E]">Create New Task Card</h3>
              </div>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-[#786D60] hover:text-[#2A231D] p-1 rounded-lg touch-target flex items-center justify-center">
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              {/* Live Preview Card Banner */}
              <div className={`p-3.5 rounded-2xl border ${modalColorStyles.border} bg-white/70 shadow-xs transition-all`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${modalColorStyles.tagBg} ${modalColorStyles.tagText}`}>
                    {newTaskTag}
                  </span>
                  <span className="text-[10px] font-bold text-[#6D6052]">
                    {newTaskPriority} Priority
                  </span>
                </div>
                <p className="text-xs font-black text-[#26201A] truncate">
                  {newTaskTitle.trim() || 'Untitled Task (Live Preview)'}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-black/5 text-[10px] text-[#7A6D5E]">
                  <span>Column: {newTaskTargetColumn.toUpperCase()}</span>
                  <span>{newTaskAssignees.length} assigned</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design onboarding responsive screens"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none focus:ring-1 focus:ring-[#7D6F5E]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Column</label>
                <ArchivalSelect
                  value={newTaskTargetColumn}
                  onChange={(val) => setNewTaskTargetColumn(val as any)}
                  options={[
                    { value: 'todo', label: 'Todo list', badge: 'Draft' },
                    { value: 'inprogress', label: 'In Progress', badge: 'Active' },
                    { value: 'inreview', label: 'In Review', badge: 'QA' }
                  ]}
                  title="Select Column"
                />
              </div>

              {/* Product Deliverable Link */}
              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Product Deliverable (Optional)</label>
                <ArchivalSelect
                  value={newTaskProductId}
                  onChange={(val) => setNewTaskProductId(val)}
                  placeholder="Select Product Deliverable"
                  options={[
                    { value: '', label: 'None (Standalone Deliverable)', icon: <Layers className="w-3.5 h-3.5 text-[#8C7E6C]" /> },
                    ...products.map(p => ({
                      value: p.id,
                      label: `${p.name} (${p.code})`,
                      badge: p.stage,
                      icon: <Package className="w-3.5 h-3.5 text-[#8C7E6C]" />
                    }))
                  ]}
                  title="Assign to Product Deliverable"
                />
              </div>

              {/* Card Color Selector: Rich Custom Interactive Dropdown Menu */}
              <div className="relative">
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Card Color Theme</label>
                <div className="relative dropdown-container" data-dropdown="true">
                  <button
                    type="button"
                    onClick={() => setIsTaskColorDropdownOpen(!isTaskColorDropdownOpen)}
                    className="w-full bg-white border border-[#D5CABB] hover:border-[#8C7E6C] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A231D] flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-4 h-4 rounded-full border border-black/15 shadow-xs shrink-0 ${modalColorStyles.bg}`} />
                      <span className="capitalize font-extrabold text-[#2C241E]">
                        {newTaskColor === 'peach' ? 'Peach Warmth' :
                         newTaskColor === 'blue' ? 'Archival Blue' :
                         newTaskColor === 'mint' ? 'Mint Herbal' :
                         newTaskColor === 'purple' ? 'Lavender Purple' :
                         newTaskColor === 'coral' ? 'Coral Flame' : 'Canary Yellow'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#8C7E6C] transition-transform duration-200 ${isTaskColorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Rich Custom Dropdown Menu with Color Swatches */}
                  {isTaskColorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { id: 'peach' as CardColor, label: 'Peach Warmth', desc: 'Warm archival hue' },
                        { id: 'blue' as CardColor, label: 'Archival Blue', desc: 'Classic dossier tone' },
                        { id: 'mint' as CardColor, label: 'Mint Herbal', desc: 'Refreshing focus green' },
                        { id: 'purple' as CardColor, label: 'Lavender Purple', desc: 'Creative design tint' },
                        { id: 'coral' as CardColor, label: 'Coral Flame', desc: 'Urgent priority tone' },
                        { id: 'canary' as CardColor, label: 'Canary Yellow', desc: 'Noticeable highlight' }
                      ].map(({ id, label, desc }) => {
                        const st = getColorStyles(id);
                        const isSelected = newTaskColor === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setNewTaskColor(id);
                              setIsTaskColorDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                              isSelected
                                ? 'bg-[#EAE0CF] text-[#2C241E] font-bold shadow-2xs'
                                : 'hover:bg-white text-[#4A3F33]'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-4 h-4 rounded-full border border-black/15 shadow-xs shrink-0 ${st.bg}`} />
                              <div className="text-left">
                                <p className="font-bold leading-tight">{label}</p>
                                <p className="text-[10px] text-[#8C7E6C]">{desc}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#2C241E] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Tag / Category</label>
                <ArchivalSelect
                  value={newTaskTag}
                  onChange={(val) => setNewTaskTag(val)}
                  options={[
                    { value: '#client', label: '#client' },
                    { value: '#website', label: '#website' },
                    { value: '#mobile app', label: '#mobile app' },
                    { value: '#product', label: '#product' },
                    { value: '#development', label: '#development' }
                  ]}
                  title="Select Tag / Category"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Priority</label>
                <ArchivalSelect
                  value={newTaskPriority}
                  onChange={(val) => setNewTaskPriority(val as any)}
                  options={[
                    { value: 'Low', label: 'Low Priority' },
                    { value: 'Medium', label: 'Medium Priority' },
                    { value: 'High', label: 'High Priority', badge: 'Important' },
                    { value: 'Urgent', label: 'Urgent Priority', badge: 'Critical' }
                  ]}
                  title="Select Priority"
                />
              </div>

              {/* Optional Checklist / Todo Tasks */}
              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Checklist / Todo Tasks (Optional)</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Create user flow, Make wireframe..."
                    value={createTaskSubtaskInput}
                    onChange={(e) => setCreateTaskSubtaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (createTaskSubtaskInput.trim()) {
                          setCreateTaskSubtasks(prev => [...prev, createTaskSubtaskInput.trim()]);
                          setCreateTaskSubtaskInput('');
                        }
                      }
                    }}
                    className="flex-1 bg-white border border-[#D5CABB] rounded-xl px-3 py-1.5 text-xs text-[#2A231D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (createTaskSubtaskInput.trim()) {
                        setCreateTaskSubtasks(prev => [...prev, createTaskSubtaskInput.trim()]);
                        setCreateTaskSubtaskInput('');
                      }
                    }}
                    className="px-3 py-1.5 bg-[#E4DAC7] text-[#3A3026] text-xs font-bold rounded-xl hover:bg-[#D8CDBC]"
                  >
                    Add
                  </button>
                </div>

                {createTaskSubtasks.length > 0 && (
                  <div className="space-y-1 bg-white/70 p-2 rounded-xl border border-[#D5CABB] max-h-28 overflow-y-auto">
                    {createTaskSubtasks.map((st, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 px-1.5 bg-white rounded-lg border border-black/5">
                        <span className="text-[#322A22] font-medium">• {st}</span>
                        <button
                          type="button"
                          onClick={() => setCreateTaskSubtasks(prev => prev.filter((_, idx) => idx !== i))}
                          className="text-[#9E9080] hover:text-red-700"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assign Team Members: Space-Saving Dropdown */}
              <div className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#5C5042]">Assign Team Members</label>
                  <span className="text-[11px] text-[#8C7E6C] font-semibold">
                    {newTaskAssignees.length} assigned
                  </span>
                </div>

                {/* Selected Member Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[26px]">
                  {newTaskAssignees.map((assignee, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center space-x-1.5 bg-white pl-1.5 pr-2 py-0.5 rounded-full border border-[#DCD1BC] shadow-2xs text-xs font-bold text-[#2A231D]"
                    >
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-4 h-4 rounded-full object-cover border border-[#DCD1BC]"
                      />
                      <span>{assignee.name}</span>
                      {newTaskAssignees.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setNewTaskAssignees(newTaskAssignees.filter(a => a.name !== assignee.name))}
                          className="text-[#9C8F80] hover:text-red-700 ml-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Custom Popover Dropdown Button */}
                <div className="relative dropdown-container" data-dropdown="true">
                  <button
                    type="button"
                    onClick={() => setIsTaskMemberDropdownOpen(!isTaskMemberDropdownOpen)}
                    className="w-full bg-white border border-[#D5CABB] hover:border-[#8C7E6C] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2A231D] flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-[#8C7E6C]" />
                      <span>Select Contributors ({teamMembers.length} available)</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#8C7E6C] transition-transform duration-200 ${isTaskMemberDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover Dropdown List */}
                  {isTaskMemberDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto no-scrollbar">
                      <div className="p-1.5 text-[10px] font-bold uppercase text-[#8C7E6C] tracking-wider border-b border-[#E8DEC9] mb-1">
                        Select contributors to toggle assignment:
                      </div>
                      {teamMembers.map(member => {
                        const isAssigned = newTaskAssignees.some(a => a.name === member.name);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => {
                              if (isAssigned) {
                                if (newTaskAssignees.length > 1) {
                                  setNewTaskAssignees(newTaskAssignees.filter(a => a.name !== member.name));
                                }
                              } else {
                                setNewTaskAssignees([...newTaskAssignees, { name: member.name, avatar: member.avatar }]);
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                              isAssigned
                                ? 'bg-[#EAE0CF] text-[#2C241E] font-bold shadow-2xs'
                                : 'hover:bg-white text-[#4A3F33]'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-6 h-6 rounded-full object-cover border border-[#DCD1BC] shrink-0"
                              />
                              <div className="text-left min-w-0">
                                <p className="font-bold leading-tight truncate">{member.name}</p>
                                <p className="text-[10px] text-[#8C7E6C] truncate">{member.role}</p>
                              </div>
                            </div>
                            {isAssigned && <Check className="w-4 h-4 text-[#2C241E] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B5E4F] hover:bg-[#EAE0CD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2D2620] text-[#FAF6EE] hover:bg-[#463D34]"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
        );
      })()}

      {/* Modal: Create Dossier Note */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 pb-8 sm:pb-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Drag Handle indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DEC9]">
              <h3 className="text-base font-bold text-[#2C241E]">Create Dossier Memo</h3>
              <button onClick={() => setIsNewNoteModalOpen(false)} className="text-[#786D60] hover:text-[#2A231D] p-1 rounded-lg touch-target flex items-center justify-center">
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Memo Title</label>
                <input
                  type="text"
                  placeholder="e.g. Typography & Spacing Guidelines"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Content</label>
                <textarea
                  rows={4}
                  placeholder="Type memo notes or action items here..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Paper Tone</label>
                  <ArchivalSelect
                    value={newNoteColor}
                    onChange={(val) => setNewNoteColor(val as any)}
                    options={[
                      { value: 'cream', label: 'Cream Paper', icon: <span className="w-2.5 h-2.5 rounded-full bg-[#FAF6EE] border border-[#D5CABB]" /> },
                      { value: 'sand', label: 'Warm Sand', icon: <span className="w-2.5 h-2.5 rounded-full bg-[#EFE8DC] border border-[#D5CABB]" /> },
                      { value: 'mint', label: 'Mint Herb', icon: <span className="w-2.5 h-2.5 rounded-full bg-[#E5F0E8] border border-[#BED7C6]" /> },
                      { value: 'rose', label: 'Dusty Rose', icon: <span className="w-2.5 h-2.5 rounded-full bg-[#FCECE9] border border-[#ECCECE]" /> }
                    ]}
                    title="Select Paper Tone"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Tag</label>
                  <input
                    type="text"
                    value={newNoteTag}
                    onChange={(e) => setNewNoteTag(e.target.value)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={newNotePinned}
                  onChange={(e) => setNewNotePinned(e.target.checked)}
                  className="rounded text-amber-700 focus:ring-0"
                />
                <label htmlFor="pinNote" className="text-xs font-semibold text-[#524638] cursor-pointer">
                  Pin to Top of Notes
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewNoteModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B5E4F] hover:bg-[#EAE0CD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2D2620] text-[#FAF6EE] hover:bg-[#463D34]"
                >
                  Save Memo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Schedule Event */}
      {isNewScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 pb-8 sm:pb-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Drag Handle indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DEC9]">
              <h3 className="text-base font-bold text-[#2C241E]">Schedule Deliverable or Event</h3>
              <button onClick={() => setIsNewScheduleModalOpen(false)} className="text-[#786D60] hover:text-[#2A231D] p-1 rounded-lg touch-target flex items-center justify-center">
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Design Critique & Stakeholder Review"
                  value={newScheduleTitle}
                  onChange={(e) => setNewScheduleTitle(e.target.value)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Date</label>
                  <input
                    type="date"
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 02:00 PM"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Roadmap Phase</label>
                <ArchivalSelect
                  value={newSchedulePhase}
                  onChange={(val) => setNewSchedulePhase(val)}
                  options={[
                    { value: 'Discovery & Research', label: 'Discovery & Research' },
                    { value: 'Design & Planning', label: 'Design & Planning' },
                    { value: 'Development', label: 'Development' },
                    { value: 'Review & QA', label: 'Review & QA' },
                    { value: 'Launch', label: 'Launch' }
                  ]}
                  title="Select Roadmap Phase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newScheduleStartDate}
                    onChange={(e) => setNewScheduleStartDate(e.target.value)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">End Date</label>
                  <input
                    type="date"
                    value={newScheduleEndDate}
                    onChange={(e) => setNewScheduleEndDate(e.target.value)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Category</label>
                  <ArchivalSelect
                    value={newScheduleCategory}
                    onChange={(val) => setNewScheduleCategory(val as any)}
                    options={[
                      { value: 'Sprint', label: 'Sprint' },
                      { value: 'Milestone', label: 'Milestone' },
                      { value: 'Review', label: 'Review' },
                      { value: 'Deadline', label: 'Deadline' },
                      { value: 'Research', label: 'Research' }
                    ]}
                    title="Select Event Category"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Priority</label>
                  <ArchivalSelect
                    value={newSchedulePriority}
                    onChange={(val) => setNewSchedulePriority(val as any)}
                    options={[
                      { value: 'Low', label: 'Low Priority' },
                      { value: 'Medium', label: 'Medium Priority' },
                      { value: 'High', label: 'High Priority', badge: 'Important' },
                      { value: 'Urgent', label: 'Urgent Priority', badge: 'Critical' }
                    ]}
                    title="Select Priority"
                  />
                </div>
              </div>

              {/* Schedule Card Color Selector: Rich Custom Interactive Dropdown Menu */}
              <div className="relative">
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Card Color Theme</label>
                <div className="relative dropdown-container" data-dropdown="true">
                  <button
                    type="button"
                    onClick={() => setIsScheduleColorDropdownOpen(!isScheduleColorDropdownOpen)}
                    className="w-full bg-white border border-[#D5CABB] hover:border-[#8C7E6C] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#2A231D] flex items-center justify-between shadow-2xs transition-all"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-4 h-4 rounded-full border border-black/15 shadow-xs shrink-0 ${getColorStyles(newScheduleColor).bg}`} />
                      <span className="capitalize font-extrabold text-[#2C241E]">
                        {newScheduleColor === 'peach' ? 'Peach Warmth' :
                         newScheduleColor === 'blue' ? 'Archival Blue' :
                         newScheduleColor === 'mint' ? 'Mint Herbal' :
                         newScheduleColor === 'purple' ? 'Lavender Purple' :
                         newScheduleColor === 'coral' ? 'Coral Flame' : 'Canary Yellow'}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#8C7E6C] transition-transform duration-200 ${isScheduleColorDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Rich Custom Dropdown Menu with Color Swatches */}
                  {isScheduleColorDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      {[
                        { id: 'peach' as CardColor, label: 'Peach Warmth', desc: 'Warm archival hue' },
                        { id: 'blue' as CardColor, label: 'Archival Blue', desc: 'Classic dossier tone' },
                        { id: 'mint' as CardColor, label: 'Mint Herbal', desc: 'Refreshing focus green' },
                        { id: 'purple' as CardColor, label: 'Lavender Purple', desc: 'Creative design tint' },
                        { id: 'coral' as CardColor, label: 'Coral Flame', desc: 'Urgent priority tone' },
                        { id: 'canary' as CardColor, label: 'Canary Yellow', desc: 'Noticeable highlight' }
                      ].map(({ id, label, desc }) => {
                        const st = getColorStyles(id);
                        const isSelected = newScheduleColor === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setNewScheduleColor(id);
                              setIsScheduleColorDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all ${
                              isSelected
                                ? 'bg-[#EAE0CF] text-[#2C241E] font-bold shadow-2xs'
                                : 'hover:bg-white text-[#4A3F33]'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-4 h-4 rounded-full border border-black/15 shadow-xs shrink-0 ${st.bg}`} />
                              <div className="text-left">
                                <p className="font-bold leading-tight">{label}</p>
                                <p className="text-[10px] text-[#8C7E6C]">{desc}</p>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#2C241E] shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B5E4F] hover:bg-[#EAE0CD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2D2620] text-[#FAF6EE] hover:bg-[#463D34]"
                >
                  Schedule Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Team Member Modal */}
      {isInviteMemberModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden pb-8 sm:pb-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Drag Handle indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto my-2" />
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#EFE8DC] border-b border-[#DCD1BC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-[#665A4E]" />
                <h3 className="text-sm font-bold text-[#2A231D]">Invite Team Member</h3>
              </div>
              <button
                onClick={() => setIsInviteMemberModalOpen(false)}
                className="p-1.5 rounded-lg text-[#786D60] hover:text-[#2A231D] hover:bg-[#E3D8C4] transition-colors touch-target"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] placeholder-[#A09383] focus:outline-none focus:border-[#8C7E6C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya@archivalpm.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] placeholder-[#A09383] focus:outline-none focus:border-[#8C7E6C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Role</label>
                  <ArchivalSelect
                    value={newMemberRole}
                    onChange={(val) => setNewMemberRole(val)}
                    options={[
                      { value: 'Product Owner', label: 'Product Owner' },
                      { value: 'Project Manager', label: 'Project Manager' },
                      { value: 'Developer', label: 'Developer' },
                      { value: 'Frontend Engineer', label: 'Frontend Engineer' },
                      { value: 'Backend Engineer', label: 'Backend Engineer' },
                      { value: 'Designer', label: 'Designer' },
                      { value: 'QA Engineer', label: 'QA Engineer' }
                    ]}
                    title="Select Member Role"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">
                    Initial Workload ({newMemberWorkload}%)
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={newMemberWorkload}
                    onChange={(e) => setNewMemberWorkload(Number(e.target.value))}
                    className="w-full accent-[#2B231D] mt-2 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1.5">Assign Projects</label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-white/60 border border-[#DCD1BC] rounded-xl">
                  {['Acme Digital Revamp', 'CRM Platform', 'Web Platform', 'Mobile App', 'Brand Refresh', 'API Integration'].map((proj) => {
                    const isSelected = newMemberProjects.includes(proj);
                    return (
                      <label
                        key={proj}
                        className={`flex items-center space-x-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#EFE8DC] border-[#8C7E6C] font-bold text-[#2A231D]'
                            : 'bg-white border-[#E8DEC9] text-[#6B5E4F] hover:bg-[#FAF6EE]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              if (newMemberProjects.length > 1) {
                                setNewMemberProjects(newMemberProjects.filter((p) => p !== proj));
                              }
                            } else {
                              setNewMemberProjects([...newMemberProjects, proj]);
                            }
                          }}
                          className="accent-[#2B231D] rounded"
                        />
                        <span className="truncate">{proj}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsInviteMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B5E4F] hover:bg-[#EAE0CD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2D2620] text-[#FAF6EE] hover:bg-[#463D34] flex items-center space-x-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Work Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ClickUp-Style Invitation Email Sent Modal */}
      {showInviteSuccessModal && lastCreatedInvite && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden pb-8 sm:pb-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Drag Handle indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto my-2" />
            {/* Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#EFE8DC] border-b border-[#DCD1BC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-[#2A231D]">Work Email Invitation Dispatched!</h3>
              </div>
              <button
                onClick={() => setShowInviteSuccessModal(false)}
                className="p-1.5 rounded-lg text-[#786D60] hover:text-[#2A231D] hover:bg-[#E3D8C4] transition-colors touch-target"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Notification Banner */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">An invitation email was sent to {lastCreatedInvite.email}</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    When they open the email and accept, they will automatically join{' '}
                    <span className="font-semibold">{lastCreatedInvite.organization_name}</span> with immediate access to folders & boards.
                  </p>
                  {lastCreatedInvite.email_preview_url && (
                    <div className="mt-2 pt-2 border-t border-emerald-200">
                      <a
                        href={lastCreatedInvite.email_preview_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] shadow-xs"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>View Sent Email in Live Web Inbox &rarr;</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* ClickUp Email Preview Card */}
              <div className="bg-white rounded-xl border border-[#DCD1BC] p-4 shadow-inner space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2 text-[11px] text-[#7F7364]">
                  <span>From: <strong className="text-[#2A231D]">Archival PM &lt;invites@archivalpm.com&gt;</strong></span>
                  <span>To: <strong className="text-[#2A231D]">{lastCreatedInvite.email}</strong></span>
                </div>

                <div className="py-2 text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#EFE8DC] text-[#2A231D] font-black text-sm border border-[#DCD1BC]">
                    AP
                  </div>
                  <h4 className="text-sm font-bold text-[#2A231D]">
                    {currentUser.name} invited you to join {lastCreatedInvite.organization_name}
                  </h4>
                  <p className="text-xs text-[#6B5E4F] max-w-sm mx-auto">
                    Collaborate on confidential project dossiers, interactive schedules, and sprint boards on Archival PM.
                  </p>

                  <div className="pt-2">
                    <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#2B231D]/80 text-[#FAF6EE] text-xs font-bold rounded-xl shadow-xs select-none cursor-default">
                      <span>Accept Invitation & Join &rarr;</span>
                    </div>
                    <p className="text-[10px] text-[#8C7E6C] mt-1.5 italic">
                      (Preview of the button {lastCreatedInvite.email} clicks inside their email)
                    </p>
                  </div>
                </div>
              </div>

              {/* Shareable Invite URL */}
              <div>
                <label className="block text-[11px] font-bold text-[#7F7364] uppercase mb-1">
                  Or share this private invitation link directly:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    readOnly
                    value={lastCreatedInvite.invite_url}
                    className="flex-1 bg-white border border-[#DCD1BC] rounded-xl px-3 py-1.5 text-xs text-[#2A231D] font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lastCreatedInvite.invite_url);
                      alert('Invitation link copied to clipboard!');
                    }}
                    className="px-3 py-1.5 bg-[#EFE8DC] hover:bg-[#E5DBC7] border border-[#DCD1BC] rounded-xl text-xs font-bold text-[#2A231D] flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowInviteSuccessModal(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2D2620] text-[#FAF6EE] hover:bg-[#463D34]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (() => {
        const completedFeatures = selectedProduct.features.filter(f => f.status === 'Completed').length;
        const totalFeatures = selectedProduct.features.length;

        return (
          <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[90vh] pb-safe animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
              {/* Mobile Drag Handle indicator */}
              <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto my-2 shrink-0" />
              {/* Modal Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-[#EFE8DC] border-b border-[#DCD1BC] flex items-center justify-between">
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                  <Package className="w-4 h-4 text-[#665A4E]" />
                  <span className="text-xs font-bold text-[#7A6E60] uppercase tracking-wider font-mono">
                    {selectedProduct.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#E5DBC7] font-semibold text-[#4F4437]">
                    {selectedProduct.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedProduct.health === 'On Track'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedProduct.health}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 rounded-lg text-[#786D60] hover:text-[#2A231D] hover:bg-[#E3D8C4] transition-colors touch-target"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-[#26201A] tracking-tight">
                      {selectedProduct.name}
                    </h2>
                    <span className="text-xs font-mono font-bold text-[#7A6F62] bg-[#EFE8DC] px-2.5 py-1 rounded-lg border border-[#DCD1BC]">
                      {selectedProduct.version}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C4F41] mt-2 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* KPI Metrics Matrix */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-white/70 rounded-xl border border-[#DCD1BC]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C7E6C] block">Readiness</span>
                    <span className="text-lg font-black text-[#26201A]">{selectedProduct.metrics.completionRate}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C7E6C] block">Milestones</span>
                    <span className="text-lg font-black text-[#26201A]">{completedFeatures} / {totalFeatures}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C7E6C] block">Target Release</span>
                    <span className="text-xs font-bold text-[#26201A] mt-1 block">{selectedProduct.target_release}</span>
                  </div>
                </div>

                {/* Interactive Milestone Checkpoints */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A6F62] flex items-center space-x-1.5">
                      <Target className="w-3.5 h-3.5" />
                      <span>Product Roadmap & Key Deliverables</span>
                    </h4>
                    <span className="text-[11px] text-[#8C7E6C]">
                      Click to toggle status
                    </span>
                  </div>

                  <div className="space-y-2">
                    {selectedProduct.features.map(feat => (
                      <div
                        key={feat.id}
                        onClick={() => handleToggleProductFeature(selectedProduct.id, feat.id)}
                        className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#DCD1BC] hover:border-[#8C7E6C] cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-2.5">
                          {feat.status === 'Completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                          ) : feat.status === 'In Progress' ? (
                            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#A89A89] shrink-0" />
                          )}
                          <span className={`text-xs font-medium text-[#2C241E] ${
                            feat.status === 'Completed' ? 'line-through opacity-70' : ''
                          }`}>
                            {feat.title}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          feat.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800'
                            : feat.status === 'In Progress'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {feat.status}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add New Milestone Input */}
                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      type="text"
                      placeholder="Add product feature milestone..."
                      value={newFeatureInput}
                      onChange={(e) => setNewFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddProductFeature(selectedProduct.id);
                        }
                      }}
                      className="flex-1 bg-white border border-[#DCD1BC] rounded-xl px-3 py-1.5 text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddProductFeature(selectedProduct.id)}
                      className="px-3 py-1.5 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#433931]"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Lead Engineer & Folder Anchor */}
                <div className="p-3 bg-[#EFE8DC]/60 rounded-xl border border-[#DCD1BC] flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={selectedProduct.lead_avatar}
                      alt={selectedProduct.lead_name}
                      className="w-7 h-7 rounded-full object-cover border border-[#DCD1BC]"
                    />
                    <div>
                      <p className="font-bold text-[#2A231D] leading-tight">{selectedProduct.lead_name}</p>
                      <p className="text-[10px] text-[#7A6F62]">Product Technical Lead</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setActiveTab('board');
                    }}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#DCD1BC] font-bold text-xs text-[#2A231D] hover:bg-[#FAF6EE]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#7A6F62]" />
                    <span>View Kanban Tasks</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3 bg-[#EFE8DC] border-t border-[#DCD1BC] flex items-center justify-between">
                <button
                  onClick={() => handleDeleteProduct(selectedProduct.id)}
                  className="text-xs font-bold text-rose-700 hover:underline flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Archive Deliverable</span>
                </button>

                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-1.5 bg-[#2B231D] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#433931]"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* New Client Dossier Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DEC9] mb-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-[#8C7E6C]" />
                <h3 className="text-lg font-bold text-[#2A231D]">New Client Dossier</h3>
              </div>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7C6F61] hover:bg-[#EAE0CD]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newClientName.trim()) return;

                const clientPayload = {
                  name: newClientName.trim(),
                  code: newClientCode.trim() || `CL-${Math.floor(10 + Math.random() * 90)}`,
                  company: newClientCompany.trim() || newClientName.trim(),
                  industry: newClientIndustry.trim() || 'Technology',
                  contact_name: newClientContactName.trim() || 'Primary Contact',
                  contact_email: newClientContactEmail.trim() || 'contact@client.com',
                  contact_phone: newClientContactPhone.trim() || '+1 (555) 000-0000',
                  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop',
                  status: newClientStatus,
                  contract_value: newClientValue.trim() || '$50,000',
                  tier: newClientTier,
                  lead_owner: newClientLead,
                  lead_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop',
                  active_projects: ['Client Deliverables'],
                  deliverables_count: 1,
                  notes: newClientNotes.trim() || 'Account dossier initialized.',
                  website: newClientWebsite.trim() || '',
                  organization_id: currentOrg.id.replace('org-', '')
                };

                const optimisticClient: ClientItem = {
                  id: `cl-${Date.now()}`,
                  ...clientPayload,
                  organization_id: currentOrg.id
                };

                setClients(prev => [optimisticClient, ...prev]);
                setIsNewClientModalOpen(false);

                try {
                  const res = await fetch(`${API_BASE}/clients`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(clientPayload)
                  });
                  if (res.ok) {
                    const saved = await res.json();
                    setClients(prev => prev.map(c => c.id === optimisticClient.id ? { ...saved, id: `cl-${saved.id}` } : c));
                  }
                } catch (err) {
                  console.error('Failed to save client:', err);
                }
              }}
              className="space-y-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Global"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Dossier Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CL-05"
                    value={newClientCode}
                    onChange={(e) => setNewClientCode(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Company Legal Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp Ltd."
                    value={newClientCompany}
                    onChange={(e) => setNewClientCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Industry Domain
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FinTech / SaaS"
                    value={newClientIndustry}
                    onChange={(e) => setNewClientIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                  />
                </div>
              </div>

              {/* Contact Person Details */}
              <div className="p-3 bg-[#F4ECE1] rounded-xl border border-[#DFD4C2] space-y-2.5">
                <span className="text-[10px] font-bold text-[#7A6E60] uppercase block">
                  Primary Contact Person
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={newClientContactName}
                    onChange={(e) => setNewClientContactName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-[#D5CABB] rounded-lg text-xs text-[#2A231D]"
                  />
                  <input
                    type="email"
                    placeholder="Contact Email"
                    value={newClientContactEmail}
                    onChange={(e) => setNewClientContactEmail(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-[#D5CABB] rounded-lg text-xs text-[#2A231D]"
                  />
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={newClientContactPhone}
                    onChange={(e) => setNewClientContactPhone(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-[#D5CABB] rounded-lg text-xs text-[#2A231D]"
                  />
                </div>
              </div>

              {/* Status, Tier, and Contract Scope */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Partnership Tier
                  </label>
                  <select
                    value={newClientTier}
                    onChange={(e) => setNewClientTier(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D]"
                  >
                    <option value="Enterprise">Enterprise</option>
                    <option value="Retainer">Retainer</option>
                    <option value="Growth">Growth</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={newClientStatus}
                    onChange={(e) => setNewClientStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D]"
                  >
                    <option value="Active">Active</option>
                    <option value="Retainer">Retainer</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="In Negotiation">In Negotiation</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Contract Value
                  </label>
                  <input
                    type="text"
                    placeholder="$120,000"
                    value={newClientValue}
                    onChange={(e) => setNewClientValue(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                  Account Lead
                </label>
                <select
                  value={newClientLead}
                  onChange={(e) => setNewClientLead(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D]"
                >
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.name}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                  Dossier Notes & Retainer Scope
                </label>
                <textarea
                  rows={2}
                  placeholder="Key milestones, SLA details, and account background..."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5CABB] rounded-xl text-xs text-[#2A231D]"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B5E4F] hover:bg-[#EAE0CD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2B231D] text-[#FAF6EE] hover:bg-[#433931]"
                >
                  Create Client Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Detail View Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-4 border-b border-[#E8DEC9] mb-4">
              <div className="flex items-start space-x-3.5">
                <img
                  src={selectedClient.avatar}
                  alt={selectedClient.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#DCD1BC] shadow-xs"
                />
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-mono text-[10px] font-black text-[#5C4F41] bg-[#EAE0CF] px-2 py-0.5 rounded border border-[#D5CABB]">
                      {selectedClient.code}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      {selectedClient.tier}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {selectedClient.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[#26201A]">{selectedClient.name}</h2>
                  <p className="text-xs text-[#7A6F62] font-medium">{selectedClient.company} • {selectedClient.industry}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 rounded-lg text-[#7C6F61] hover:bg-[#EAE0CD]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Primary Contact & Scope */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F4ECE1] p-3.5 rounded-xl border border-[#DFD4C2] space-y-1">
                  <span className="text-[10px] font-bold text-[#7A6F62] uppercase block">Direct Contact</span>
                  <p className="font-bold text-[#2A231D] text-sm">{selectedClient.contact_name}</p>
                  <p className="text-[#635547] flex items-center space-x-1.5 pt-0.5">
                    <Mail className="w-3.5 h-3.5 text-[#8C7E6C]" />
                    <span>{selectedClient.contact_email}</span>
                  </p>
                  {selectedClient.contact_phone && (
                    <p className="text-[#635547] flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#8C7E6C]" />
                      <span>{selectedClient.contact_phone}</span>
                    </p>
                  )}
                </div>

                <div className="bg-[#F4ECE1] p-3.5 rounded-xl border border-[#DFD4C2] space-y-1">
                  <span className="text-[10px] font-bold text-[#7A6F62] uppercase block">Engagement Scope</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl font-black font-mono text-[#26201A]">{selectedClient.contract_value}</span>
                    <span className="text-[10px] font-bold text-emerald-700">Contract Value</span>
                  </div>
                  <div className="flex items-center space-x-2 pt-1">
                    <img
                      src={selectedClient.lead_avatar}
                      alt={selectedClient.lead_owner}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-[#635547]">Lead: <strong className="text-[#2A231D]">{selectedClient.lead_owner}</strong></span>
                  </div>
                </div>
              </div>

              {/* Dossier Notes */}
              <div>
                <span className="text-[10px] font-bold text-[#7A6F62] uppercase block mb-1">
                  Dossier Notes & Scope Specs
                </span>
                <p className="p-3 bg-white/80 rounded-xl border border-[#D5CABB] text-[#43392E] leading-relaxed">
                  {selectedClient.notes || 'No confidential dossier notes recorded.'}
                </p>
              </div>

              {/* Active Assigned Dossiers */}
              <div>
                <span className="text-[10px] font-bold text-[#7A6F62] uppercase block mb-1.5">
                  Assigned Project Dossiers
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedClient.active_projects.map((proj, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#D5CABB] font-bold text-[#3B322A] flex items-center space-x-1.5 shadow-2xs"
                    >
                      <Folder className="w-3.5 h-3.5 text-amber-700" />
                      <span>{proj}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#E8DEC9] flex items-center justify-between">
                <button
                  type="button"
                  onClick={async () => {
                    const confirmDel = window.confirm(`Remove client dossier for "${selectedClient.name}"?`);
                    if (!confirmDel) return;
                    setClients(prev => prev.filter(c => c.id !== selectedClient.id));
                    setSelectedClient(null);
                    try {
                      const numId = selectedClient.id.replace('cl-', '');
                      await fetch(`${API_BASE}/clients/${numId}`, { method: 'DELETE' });
                    } catch (err) {
                      console.error('Delete failed:', err);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                >
                  Delete Dossier
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2B231D] text-[#FAF6EE] hover:bg-[#433931]"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isNewProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden pb-8 sm:pb-6 max-h-[88vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-200">
            {/* Mobile Drag Handle indicator */}
            <div className="sm:hidden w-12 h-1.5 bg-[#D5CABB] rounded-full mx-auto my-2" />
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-[#EFE8DC] border-b border-[#DCD1BC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-[#665A4E]" />
                <h3 className="text-sm font-bold text-[#2A231D]">Catalog New Product Deliverable</h3>
              </div>
              <button
                onClick={() => setIsNewProductModalOpen(false)}
                className="p-1.5 rounded-lg text-[#786D60] hover:text-[#2A231D] hover:bg-[#E3D8C4] transition-colors touch-target"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                  Product / Deliverable Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Mobile Checkout"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full bg-white border border-[#DCD1BC] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Product Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PRD-05"
                    value={newProductCode}
                    onChange={(e) => setNewProductCode(e.target.value)}
                    className="w-full bg-white border border-[#DCD1BC] rounded-xl px-3 py-2 text-xs text-[#2A231D] font-mono uppercase focus:outline-none focus:border-[#8C7E6C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    placeholder="v1.0.0"
                    value={newProductVersion}
                    onChange={(e) => setNewProductVersion(e.target.value)}
                    className="w-full bg-white border border-[#DCD1BC] rounded-xl px-3 py-2 text-xs text-[#2A231D] font-mono focus:outline-none focus:border-[#8C7E6C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Category
                  </label>
                  <ArchivalSelect
                    value={newProductCategory}
                    onChange={(val) => setNewProductCategory(val)}
                    options={[
                      { value: 'Web App', label: 'Web App' },
                      { value: 'Mobile App', label: 'Mobile App' },
                      { value: 'Design System', label: 'Design System' },
                      { value: 'API & Service', label: 'API & Service' },
                      { value: 'Hardware', label: 'Hardware' }
                    ]}
                    title="Select Category"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Lifecycle Stage
                  </label>
                  <ArchivalSelect
                    value={newProductStage}
                    onChange={(val) => setNewProductStage(val as any)}
                    options={[
                      { value: 'Discovery', label: 'Discovery' },
                      { value: 'In Development', label: 'In Development' },
                      { value: 'Review & QA', label: 'Review & QA' },
                      { value: 'Launched', label: 'Launched' }
                    ]}
                    title="Select Lifecycle Stage"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Health Status
                  </label>
                  <ArchivalSelect
                    value={newProductHealth}
                    onChange={(val) => setNewProductHealth(val as any)}
                    options={[
                      { value: 'On Track', label: 'On Track' },
                      { value: 'Needs Attention', label: 'Needs Attention' },
                      { value: 'At Risk', label: 'At Risk' }
                    ]}
                    title="Select Health Status"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                  Deliverable Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize product purpose, scope, and technical stack..."
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  className="w-full bg-white border border-[#DCD1BC] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Target Release Date
                  </label>
                  <input
                    type="date"
                    value={newProductRelease}
                    onChange={(e) => setNewProductRelease(e.target.value)}
                    className="w-full bg-white border border-[#DCD1BC] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none focus:border-[#8C7E6C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1">
                    Lead Contributor
                  </label>
                  <ArchivalSelect
                    value={newProductLead}
                    onChange={(val) => setNewProductLead(val)}
                    options={[
                      { value: 'Mason Walker', label: 'Mason Walker (Admin)' },
                      { value: 'Emma Carter', label: 'Emma Carter (Lead Dev)' },
                      { value: 'Sophia Bennett', label: 'Sophia Bennett (Product Owner)' },
                      { value: 'Lucas Wright', label: 'Lucas Wright (Systems Eng)' }
                    ]}
                    title="Select Lead Contributor"
                  />
                </div>
              </div>

              {/* Color Code Swatch */}
              <div>
                <label className="block text-[11px] font-bold text-[#7A6E60] uppercase mb-1.5">
                  Dossier Card Swatch
                </label>
                <div className="flex items-center space-x-2">
                  {(['peach', 'blue', 'mint', 'purple', 'coral', 'canary'] as CardColor[]).map((clr) => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => setNewProductColor(clr)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        newProductColor === clr ? 'scale-110 border-[#2A231D]' : 'border-transparent hover:scale-105'
                      } ${getColorStyles(clr).bg}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-[#6B5E4F] hover:bg-[#EAE0CD]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#2B231D] text-[#FAF6EE] hover:bg-[#433931]"
                >
                  Create Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
