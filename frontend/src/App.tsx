import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
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
  ChevronRight
} from 'lucide-react';

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
  color: 'blue' | 'peach' | 'purple' | 'mint' | 'coral';
  note?: string;
  progress: number; // 0 - 100
  subtasks?: Subtask[];
  hasImagePreview?: boolean;
  assignees: { name: string; avatar: string }[];
  commentsCount: number;
  attachmentsCount: number;
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  comments: Comment[];
}

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    columnId: 'todo',
    title: 'Search inspirations for upcoming project',
    tags: ['#website', '#client'],
    color: 'blue',
    note: 'Note: They like our behance project Mise',
    progress: 40,
    assignees: [
      { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces' },
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 12,
    attachmentsCount: 8,
    dueDate: 'May 18, 2026',
    priority: 'Medium',
    comments: [
      { id: 'c1', author: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces', time: '2 hours ago', content: 'Collected 14 clean moodboards from Dribbble and Behance.' },
      { id: 'c2', author: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces', time: '35 mins ago', content: 'The typography palette in Mise matches client expectations closely.' }
    ]
  },
  {
    id: 't-2',
    columnId: 'todo',
    title: 'Ginko mobile app design',
    tags: ['#mobile app', '#client'],
    color: 'purple',
    note: 'Note: We have a meeting 2:34 AM',
    progress: 15,
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
    comments: [
      { id: 'c3', author: 'Marcus W.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces', time: 'Yesterday', content: 'Wireframes review scheduled right after breakfast.' }
    ]
  },
  {
    id: 't-3',
    columnId: 'inprogress',
    title: 'Wehiu product task and the task process pages',
    tags: ['#dribbble shot', '#product'],
    color: 'peach',
    note: 'Have to finish this before weekend',
    progress: 90,
    hasImagePreview: true,
    assignees: [
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 6,
    attachmentsCount: 1,
    dueDate: 'May 14, 2026',
    priority: 'Urgent',
    comments: [
      { id: 'c4', author: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces', time: '10 mins ago', content: 'Finalized the responsive navigation breakpoints.' }
    ]
  },
  {
    id: 't-4',
    columnId: 'inprogress',
    title: 'Design CRM shop product page responsive website',
    tags: ['#products', '#client'],
    color: 'mint',
    progress: 40,
    assignees: [
      { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces' },
      { name: 'Alex T.', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 12,
    attachmentsCount: 8,
    dueDate: 'May 22, 2026',
    priority: 'Medium',
    comments: []
  },
  {
    id: 't-5',
    columnId: 'inreview',
    title: 'Orypto product landing page create in webflow',
    tags: ['#development', '#client'],
    color: 'coral',
    progress: 60,
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
    columnId: 'inreview',
    title: 'Natverk video platform web app design and develop',
    tags: ['#product', '#client'],
    color: 'blue',
    progress: 80,
    assignees: [
      { name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces' }
    ],
    commentsCount: 12,
    attachmentsCount: 8,
    dueDate: 'May 16, 2026',
    priority: 'Medium',
    comments: []
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('board');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTargetColumn, setNewTaskTargetColumn] = useState<'todo' | 'inprogress' | 'inreview' | 'done'>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskColor, setNewTaskColor] = useState<'blue' | 'peach' | 'purple' | 'mint' | 'coral'>('blue');
  const [newTaskTag, setNewTaskTag] = useState('#client');
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Sophia Bennett assigned you to Dossier #4092', time: '5m ago' },
    { id: 2, text: 'Mason Walker commented on Ginko mobile app', time: '14m ago' },
    { id: 3, text: 'WebSocket Sync: In Progress updated', time: 'Just now' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

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
      return updatedTask;
    }));
  };

  // Add comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTask) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: 'Mason Walker',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
      time: 'Just now',
      content: newCommentText.trim()
    };

    const updatedTask = {
      ...selectedTask,
      comments: [newComment, ...selectedTask.comments],
      commentsCount: selectedTask.commentsCount + 1
    };

    setTasks(prev => prev.map(t => t.id === selectedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
    setNewCommentText('');

    // Trigger fake live websocket toast
    setNotifications(prev => [
      { id: Date.now(), text: `New comment posted on "${selectedTask.title.slice(0, 24)}..."`, time: 'Just now' },
      ...prev
    ]);
  };

  // Move task to next or specific column
  const moveTask = (taskId: string, targetCol: 'todo' | 'inprogress' | 'inreview' | 'done') => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, columnId: targetCol } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, columnId: targetCol } : null);
    }
  };

  // Create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `t-${Date.now()}`,
      columnId: newTaskTargetColumn,
      title: newTaskTitle.trim(),
      tags: [newTaskTag],
      color: newTaskColor,
      progress: 0,
      assignees: [
        { name: 'Mason Walker', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces' }
      ],
      commentsCount: 0,
      attachmentsCount: 0,
      dueDate: 'May 30, 2026',
      priority: 'Medium',
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');
  };

  // Color mappings matching vintage pastel scheme
  const getColorStyles = (color: Task['color']) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-[#EBF2FE]',
          border: 'border-[#CADCFE]',
          tagBg: 'bg-[#D6E6FE]',
          tagText: 'text-[#1E429F]',
          dotActive: 'bg-[#2B6CB0]',
          dotInactive: 'bg-[#CBD5E1]',
          textColor: 'text-[#1E293B]'
        };
      case 'peach':
        return {
          bg: 'bg-[#FFF3E5]',
          border: 'border-[#FDD9B5]',
          tagBg: 'bg-[#FFE2C2]',
          tagText: 'text-[#9A3412]',
          dotActive: 'bg-[#D97706]',
          dotInactive: 'bg-[#FED7AA]',
          textColor: 'text-[#431407]'
        };
      case 'purple':
        return {
          bg: 'bg-[#F3EEFF]',
          border: 'border-[#E2D5FF]',
          tagBg: 'bg-[#E5D7FF]',
          tagText: 'text-[#6B21A8]',
          dotActive: 'bg-[#7C3AED]',
          dotInactive: 'bg-[#DDD6FE]',
          textColor: 'text-[#3B0764]'
        };
      case 'mint':
        return {
          bg: 'bg-[#E8FAF0]',
          border: 'border-[#C2F0D5]',
          tagBg: 'bg-[#D1F7E2]',
          tagText: 'text-[#065F46]',
          dotActive: 'bg-[#059669]',
          dotInactive: 'bg-[#A7F3D0]',
          textColor: 'text-[#064E3B]'
        };
      case 'coral':
        return {
          bg: 'bg-[#FFF0F0]',
          border: 'border-[#FED3D3]',
          tagBg: 'bg-[#FFE0E0]',
          tagText: 'text-[#991B1B]',
          dotActive: 'bg-[#DC2626]',
          dotInactive: 'bg-[#FECACA]',
          textColor: 'text-[#450A0A]'
        };
    }
  };

  const columns = [
    { id: 'todo', title: 'Todo list', count: tasks.filter(t => t.columnId === 'todo').length },
    { id: 'inprogress', title: 'In Progress', count: tasks.filter(t => t.columnId === 'inprogress').length },
    { id: 'inreview', title: 'In Review', count: tasks.filter(t => t.columnId === 'inreview').length },
  ];

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#2C2621] flex flex-col antialiased selection:bg-[#E8DECA]">
      {/* Top Manila Folder Cutout Tab Header (Image 2 Inspiration) */}
      <header className="px-6 pt-4 pb-0 bg-[#EFE8DC] border-b border-[#DCD1BC] flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Logo / Brand */}
          <div className="flex items-center space-x-2.5 pb-3">
            <div className="w-8 h-8 rounded-lg bg-[#3F3730] flex items-center justify-center text-[#FAF6EE] shadow-sm">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#2B241F]">Archival PM</span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded bg-[#E4DAC7] text-[#5A5046] font-medium border border-[#D5CABB]">
                Dossier v1.0
              </span>
            </div>
          </div>

          {/* Vintage Folder Navigation Tabs */}
          <nav className="flex space-x-1 -mb-[1px]">
            {[
              { id: 'board', label: 'Kanban Boards', count: tasks.length },
              { id: 'schedule', label: 'Timeline & Schedule' },
              { id: 'notes', label: 'Dossier Notes' },
              { id: 'reports', label: 'Activity Logs' },
              { id: 'team', label: 'Team Members', count: 4 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`folder-tab px-4 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'active bg-[#FAF6EE] text-[#2C241E] border-[#DCD1BC] shadow-sm'
                    : 'bg-[#E7DFC/90] text-[#786D61] border-transparent hover:bg-[#EFE8DC] hover:text-[#3B332B]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 text-[11px] rounded-full font-bold ${
                    activeTab === tab.id ? 'bg-[#3F3730] text-[#FAF6EE]' : 'bg-[#DCD1BC] text-[#554C42]'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Search, WebSocket Indicator, Notifications, and Profile (Image 2 style) */}
        <div className="flex items-center space-x-3 pb-3">
          {/* Real-time WebSocket Status Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#E5DCBE]/60 border border-[#D4C8A8] text-xs font-medium text-[#4D4439]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>WebSocket Live</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#7D7366]" />
            <input
              type="text"
              placeholder="Search dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF6EE] border border-[#D8CDBC] rounded-lg text-[#2C2621] placeholder-[#9E9486] focus:outline-none focus:ring-1 focus:ring-[#8E8070] w-48 shadow-inner"
            />
          </div>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 bg-[#FAF6EE] border border-[#D8CDBC] rounded-lg text-[#52493E] hover:bg-[#F2ECE0] relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-600 rounded-full border-2 border-[#FAF6EE]"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-[#FAF6EE] border border-[#D8CDBC] rounded-xl shadow-xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8DEC9]">
                  <span className="text-xs font-bold text-[#2C241E]">Live Events (WebSockets)</span>
                  <span className="text-[11px] text-[#867B6F]">3 unread</span>
                </div>
                <div className="space-y-2">
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

          {/* User Profile Pill (Mason Walker from jewelry inspo) */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#DCD1BC]">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces"
              alt="Mason Walker"
              className="w-7 h-7 rounded-full border border-[#C5B8A1] object-cover"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-[#2A231D] leading-none">Mason Walker</p>
              <p className="text-[10px] text-[#7A7064] leading-tight">Lead Architect</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Body with Sidebar + Folder Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Image 1 Style) */}
        <aside className="w-60 bg-[#EFE8DC]/80 border-r border-[#DCD1BC] flex flex-col justify-between py-4 px-3 select-none">
          <div className="space-y-6">
            {/* Header: Back & Activities */}
            <div className="flex items-center space-x-2 px-2 text-[#463D34]">
              <button className="p-1.5 rounded-lg hover:bg-[#E4DAC7] text-[#463D34] transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold tracking-tight text-[#2B241E]">Activities</span>
            </div>

            {/* MAIN Section */}
            <div>
              <p className="text-[10px] font-bold text-[#8C8072] tracking-wider px-2 uppercase mb-1.5">Main</p>
              <nav className="space-y-0.5">
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', active: true },
                  { icon: Calendar, label: 'Schedule' },
                  { icon: FileText, label: 'Note' },
                  { icon: Package, label: 'Products' },
                  { icon: BarChart3, label: 'Report' },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        item.active
                          ? 'bg-[#FAF6EE] text-[#2C241E] font-bold shadow-sm border border-[#DCD1BC]'
                          : 'text-[#61574C] hover:bg-[#E9E0CE] hover:text-[#2C241E]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#756A5E]" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* RECORDS Section */}
            <div>
              <p className="text-[10px] font-bold text-[#8C8072] tracking-wider px-2 uppercase mb-1.5">Records</p>
              <nav className="space-y-0.5">
                {[
                  { icon: Users, label: 'Team', hasChevron: true },
                  { icon: Briefcase, label: 'Clients' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#61574C] hover:bg-[#E9E0CE] hover:text-[#2C241E] transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="w-4 h-4 text-[#756A5E]" />
                        <span>{item.label}</span>
                      </div>
                      {item.hasChevron && <ChevronRight className="w-3.5 h-3.5 text-[#9C9081]" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Project Quick Dossier Metadata Box */}
            <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#DCD1BC] shadow-inner text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-[#837666]">Active Project</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="font-bold text-[#2A231D] text-xs">Acme Digital Revamp</p>
              <div className="w-full bg-[#E5DCBE] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#463D34] h-full rounded-full" style={{ width: '68%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-[#7A7064]">
                <span>Progress</span>
                <span className="font-bold text-[#3B322A]">68%</span>
              </div>
            </div>
          </div>

          {/* Bottom Settings & Support */}
          <div className="space-y-0.5 pt-4 border-t border-[#DCD1BC]">
            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#61574C] hover:bg-[#E9E0CE] transition-all">
              <Settings className="w-4 h-4 text-[#756A5E]" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#61574C] hover:bg-[#E9E0CE] transition-all">
              <HelpCircle className="w-4 h-4 text-[#756A5E]" />
              <span>Support</span>
            </button>
          </div>
        </aside>

        {/* Main Folder Paper Canvas */}
        <main className="flex-1 bg-[#FAF6EE] overflow-y-auto p-6 flex flex-col">
          {/* Subheader: Project Title, Date & Action Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[#E5DBCA] gap-4">
            <div>
              <p className="text-xs text-[#7B7062] font-medium flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Today is Wednesday, May 10th, 2026</span>
              </p>
              <h1 className="text-2xl font-black text-[#26201A] tracking-tight mt-0.5 flex items-center space-x-2">
                <span>Task Management Board</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#F3ECDE] border border-[#D8CEBC] text-[#695D50]">
                  Sprint #3
                </span>
              </h1>
            </div>

            {/* Action Buttons: New Task & Collaborators */}
            <div className="flex items-center space-x-3">
              {/* Collaborators Stack */}
              <div className="flex items-center -space-x-1.5 mr-2">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces'
                ].map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="collaborator"
                    className="w-7 h-7 rounded-full border-2 border-[#FAF6EE] object-cover shadow-sm"
                  />
                ))}
                <span className="w-7 h-7 rounded-full bg-[#E8DFC9] border-2 border-[#FAF6EE] text-[10px] font-bold text-[#574C40] flex items-center justify-center">
                  +3
                </span>
              </div>

              {/* Add Task Button */}
              <button
                onClick={() => {
                  setNewTaskTargetColumn('todo');
                  setIsNewTaskModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#2E2721] text-[#FAF6EE] text-xs font-bold hover:bg-[#463D34] shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            </div>
          </div>

          {/* Kanban Columns (Todo list, In Progress, In Review) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1 items-start">
            {columns.map(column => {
              const columnTasks = filteredTasks.filter(t => t.columnId === column.id);

              return (
                <div
                  key={column.id}
                  className="bg-[#F5EFEB]/90 rounded-2xl border border-[#DCD1BC] p-4 flex flex-col shadow-sm"
                >
                  {/* Column Header (Image 1 style with title, +, 3-dots) */}
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
                        title="Add task to column"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1 rounded-md text-[#786D60] hover:text-[#26201A] hover:bg-[#EAE0CD] transition-colors"
                        title="Column options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Task Cards Container */}
                  <div className="space-y-3.5">
                    {columnTasks.map(task => {
                      const style = getColorStyles(task.color);

                      return (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`${style.bg} border ${style.border} rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.99] group`}
                        >
                          {/* Tags & Action menu */}
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              {task.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${style.tagBg} ${style.tagText}`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextCols: Record<string, 'todo' | 'inprogress' | 'inreview'> = {
                                  todo: 'inprogress',
                                  inprogress: 'inreview',
                                  inreview: 'todo'
                                };
                                moveTask(task.id, nextCols[task.columnId]);
                              }}
                              className="text-[#877969] hover:text-[#2E2721] p-1 rounded-md hover:bg-black/5 text-[10px] font-bold"
                              title="Advance task"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Task Title */}
                          <h3 className={`text-sm font-bold ${style.textColor} leading-snug mb-2`}>
                            {task.title}
                          </h3>

                          {/* Note Snippet (Image 1 style) */}
                          {task.note && (
                            <p className="text-[11px] font-medium text-[#7D7060] mb-3 italic">
                              {task.note}
                            </p>
                          )}

                          {/* Interactive Checklist (Ginko mobile app card style) */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="space-y-1.5 mb-3 bg-white/40 p-2.5 rounded-xl border border-black/5">
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
                                    <Circle className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                                  )}
                                  <span className={st.completed ? 'line-through text-[#8E8072]' : 'font-medium'}>
                                    {st.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Image Preview Mockup (Wehiu product card style) */}
                          {task.hasImagePreview && (
                            <div className="mb-3 rounded-xl overflow-hidden border border-[#E4D1B8] bg-white p-2 shadow-inner">
                              <div className="h-16 rounded-lg bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 flex items-center justify-center text-[10px] font-bold text-amber-800">
                                🖼️ Mockup Preview: Wehiu Process Wireframe
                              </div>
                            </div>
                          )}

                          {/* Progress Dots Indicator (Image 1 feature: 10 rounded dots) */}
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

                          {/* Card Footer: Assignee Avatars, Comments Count, Paperclip Attachments */}
                          <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-[#7B6E5F]">
                            {/* Collaborator Avatars */}
                            <div className="flex items-center -space-x-1.5">
                              {task.assignees.map((assignee, idx) => (
                                <img
                                  key={idx}
                                  src={assignee.avatar}
                                  alt={assignee.name}
                                  className="w-5 h-5 rounded-full border border-white object-cover"
                                  title={assignee.name}
                                />
                              ))}
                            </div>

                            {/* Counters */}
                            <div className="flex items-center space-x-3 text-[11px] font-semibold text-[#665B4E]">
                              <span className="flex items-center space-x-1" title="Comments">
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{task.commentsCount}</span>
                              </span>
                              <span className="flex items-center space-x-1" title="Attachments">
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
        </main>
      </div>

      {/* Task Detail Modal & Live Comment Thread (Core Task 3 Requirement!) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#EFE8DC] border-b border-[#DCD1BC] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-[#665A4E]" />
                <span className="text-xs font-bold text-[#7A6E60] uppercase tracking-wider">
                  Dossier Card #{selectedTask.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E5DBC7] font-semibold text-[#4F4437]">
                  Column: {selectedTask.columnId.toUpperCase()}
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-1.5 rounded-lg text-[#786D60] hover:text-[#2A231D] hover:bg-[#E3D8C4] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Title & Tags */}
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

              {/* Progress Bar & Subtasks */}
              <div className="bg-[#F5EFEB] p-4 rounded-xl border border-[#DCD1BC] space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#5A4F42]">
                  <span>Checklist & Progress</span>
                  <span>{selectedTask.progress}% Complete</span>
                </div>
                <div className="w-full bg-[#DCD1BC] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#3D342C] h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedTask.progress}%` }}
                  />
                </div>

                {selectedTask.subtasks && (
                  <div className="space-y-2 pt-2">
                    {selectedTask.subtasks.map(st => (
                      <div
                        key={st.id}
                        onClick={() => toggleSubtask(selectedTask.id, st.id)}
                        className="flex items-center space-x-2.5 text-xs text-[#322A22] cursor-pointer hover:bg-black/5 p-1 rounded-md"
                      >
                        {st.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#A89C8B] flex-shrink-0" />
                        )}
                        <span className={st.completed ? 'line-through text-[#8D7F6E]' : 'font-medium'}>
                          {st.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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

              {/* Live Comments & Collaboration Section (Screenshot Core Task 3) */}
              <div className="pt-4 border-t border-[#E5DBCA]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[#2E2721] flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Card Discussion & Real-Time Comments ({selectedTask.comments.length})</span>
                  </h3>
                  <span className="text-[11px] text-[#86796A] font-medium">Broadcasts to team via WebSockets</span>
                </div>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    placeholder="Write a comment or update to the team..."
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

                {/* Comments List */}
                <div className="space-y-3">
                  {selectedTask.comments.map(c => (
                    <div key={c.id} className="p-3 bg-[#F4EDE0] rounded-xl border border-[#E3D7C3] flex items-start space-x-3">
                      <img
                        src={c.avatar}
                        alt={c.author}
                        className="w-7 h-7 rounded-full border border-[#D0C3AD] object-cover flex-shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#2A231D]">{c.author}</span>
                          <span className="text-[10px] text-[#8C8072]">{c.time}</span>
                        </div>
                        <p className="text-xs text-[#453C32] leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}

                  {selectedTask.comments.length === 0 && (
                    <p className="text-xs text-[#908373] text-center py-4 italic">
                      No comments yet. Start the conversation with your team!
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DEC9]">
              <h3 className="text-base font-bold text-[#2C241E]">Create New Task Card</h3>
              <button onClick={() => setIsNewTaskModalOpen(false)} className="text-[#786D60] hover:text-[#2A231D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
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
                <select
                  value={newTaskTargetColumn}
                  onChange={(e) => setNewTaskTargetColumn(e.target.value as any)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                >
                  <option value="todo">Todo list</option>
                  <option value="inprogress">In Progress</option>
                  <option value="inreview">In Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Tag / Category</label>
                <select
                  value={newTaskTag}
                  onChange={(e) => setNewTaskTag(e.target.value)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                >
                  <option value="#client">#client</option>
                  <option value="#website">#website</option>
                  <option value="#mobile app">#mobile app</option>
                  <option value="#product">#product</option>
                  <option value="#development">#development</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Color Theme (Pastel)</label>
                <div className="flex space-x-2">
                  {[
                    { id: 'blue', label: 'Blue', colorClass: 'bg-[#D6E6FE]' },
                    { id: 'peach', label: 'Peach', colorClass: 'bg-[#FFE2C2]' },
                    { id: 'purple', label: 'Purple', colorClass: 'bg-[#E5D7FF]' },
                    { id: 'mint', label: 'Mint', colorClass: 'bg-[#D1F7E2]' },
                    { id: 'coral', label: 'Coral', colorClass: 'bg-[#FFE0E0]' },
                  ].map(c => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setNewTaskColor(c.id as any)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-bold border ${c.colorClass} ${
                        newTaskColor === c.id ? 'ring-2 ring-[#322A22] border-transparent' : 'border-black/10'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
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
      )}
    </div>
  );
}
