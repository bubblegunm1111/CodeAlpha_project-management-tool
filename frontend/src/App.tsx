import React, { useState, useEffect } from 'react';
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
  Pin,
  CalendarCheck,
  Palette,
  Check
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
}

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string;
  category: 'Milestone' | 'Review' | 'Sprint' | 'Deadline';
  color: CardColor;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: string;
  status: 'Scheduled' | 'Completed';
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
      { name: 'David K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces' }
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

const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'n-1',
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
  {
    id: 's-1',
    title: 'Client Design Review & Demo',
    date: '2026-05-11',
    time: '10:00 AM',
    category: 'Review',
    color: 'blue',
    priority: 'High',
    assignee: 'Mason Walker',
    status: 'Scheduled'
  },
  {
    id: 's-2',
    title: 'Sprint #3 Mid-Point Check-in',
    date: '2026-05-13',
    time: '02:30 PM',
    category: 'Sprint',
    color: 'purple',
    priority: 'Medium',
    assignee: 'Elena R.',
    status: 'Scheduled'
  },
  {
    id: 's-3',
    title: 'Wehiu Task Wireframe Final Handoff',
    date: '2026-05-14',
    time: '05:00 PM',
    category: 'Deadline',
    color: 'peach',
    priority: 'Urgent',
    assignee: 'David K.',
    status: 'Scheduled'
  },
  {
    id: 's-4',
    title: 'Frontend & API Integration Milestone',
    date: '2026-05-18',
    time: '11:00 AM',
    category: 'Milestone',
    color: 'mint',
    priority: 'High',
    assignee: 'Team',
    status: 'Scheduled'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'board' | 'schedule' | 'notes' | 'reports' | 'team'>('board');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_NOTES);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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
  const [newScheduleCategory, setNewScheduleCategory] = useState<'Milestone' | 'Review' | 'Sprint' | 'Deadline'>('Sprint');
  const [newScheduleColor, setNewScheduleColor] = useState<CardColor>('peach');
  const [newSchedulePriority, setNewSchedulePriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Backend connected to SQLite API server', time: 'Just now' },
    { id: 2, text: 'Sophia Bennett assigned you to Dossier #4092', time: '5m ago' },
    { id: 3, text: 'Mason Walker commented on Ginko mobile app', time: '14m ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Load from backend API if available
  useEffect(() => {
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
            status: (d.status as any) || 'Scheduled'
          }));
          setSchedules(prev => [...apiSchedules, ...prev.filter(p => !apiSchedules.some(a => a.id === p.id))]);
        }
      })
      .catch(() => {});
  }, []);

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

    const numId = selectedTask.id.replace('t-', '');
    fetch(`${API_BASE}/tasks/${numId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment.content })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Comment broadcasted to team on "${selectedTask.title.slice(0, 20)}..."`, time: 'Just now' },
      ...prev
    ]);
  };

  // Move task to next column
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
      priority: newTaskPriority,
      comments: []
    };

    setTasks(prev => [newTask, ...prev]);
    setIsNewTaskModalOpen(false);
    setNewTaskTitle('');

    // Persist to backend
    fetch(`${API_BASE}/projects/1/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        column_id: newTaskTargetColumn === 'todo' ? 1 : newTaskTargetColumn === 'inprogress' ? 2 : 3,
        title: newTask.title,
        priority: newTask.priority,
        color: newTask.color,
        tags: newTask.tags
      })
    }).catch(() => {});

    setNotifications(prev => [
      { id: Date.now(), text: `Task created: "${newTask.title}" in ${newTaskTargetColumn}`, time: 'Just now' },
      ...prev
    ]);
  };

  // Create new Note
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
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

  // Toggle Pin Note
  const togglePinNote = (noteId: string) => {
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, isPinned: !n.isPinned } : n));
  };

  // Create Schedule Item
  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleTitle.trim()) return;

    const newEvent: ScheduleItem = {
      id: `s-${Date.now()}`,
      title: newScheduleTitle.trim(),
      date: newScheduleDate,
      time: newScheduleTime,
      category: newScheduleCategory,
      color: newScheduleColor,
      priority: newSchedulePriority,
      assignee: 'Mason Walker',
      status: 'Scheduled'
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
        time: newEvent.time,
        category: newEvent.category,
        color: newEvent.color,
        priority: newEvent.priority,
        assignee: newEvent.assignee
      })
    }).catch(() => {});
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

          {/* Vintage Folder Navigation Tabs (Switches Views: Board, Schedule, Notes) */}
          <nav className="flex space-x-1 -mb-[1px]">
            {[
              { id: 'board' as const, label: 'Kanban Boards', count: tasks.length },
              { id: 'schedule' as const, label: 'Schedule & Timeline', count: schedules.length },
              { id: 'notes' as const, label: 'Dossier Notes', count: notes.length },
              { id: 'reports' as const, label: 'Activity Logs' },
              { id: 'team' as const, label: 'Team Members', count: 4 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`folder-tab px-4 py-2 text-xs font-semibold rounded-t-lg border-t border-x transition-all flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'active bg-[#FAF6EE] text-[#2C241E] border-[#DCD1BC] shadow-sm font-bold'
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

        {/* Right Controls: Search, WebSockets, Notifications, Profile */}
        <div className="flex items-center space-x-3 pb-3">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#E5DCBE]/60 border border-[#D4C8A8] text-xs font-medium text-[#4D4439]">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>API & WebSockets Connected</span>
          </div>

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

      {/* Main Body with Sidebar + Active View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Image 1 Style) */}
        <aside className="w-60 bg-[#EFE8DC]/80 border-r border-[#DCD1BC] flex flex-col justify-between py-4 px-3 select-none">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 px-2 text-[#463D34]">
              <button className="p-1.5 rounded-lg hover:bg-[#E4DAC7] text-[#463D34] transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold tracking-tight text-[#2B241E]">Activities</span>
            </div>

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
                        if (item.id === 'board' || item.id === 'schedule' || item.id === 'notes' || item.id === 'reports') {
                          setActiveTab(item.id as any);
                        }
                      }}
                      className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
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

        {/* Dynamic Main View */}
        <main className="flex-1 bg-[#FAF6EE] overflow-y-auto p-6 flex flex-col">

          {/* VIEW 1: KANBAN BOARD */}
          {activeTab === 'board' && (
            <>
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

                <div className="flex items-center space-x-3">
                  <div className="flex items-center -space-x-1.5 mr-2">
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
                              className={`${style.bg} border ${style.border} rounded-2xl p-4 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-[0.99] relative`}
                            >
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
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
                                    title="Advance task column"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
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

                              <div className="flex items-center justify-between pt-2 border-t border-black/5 text-xs text-[#7B6E5F]">
                                <div className="flex items-center -space-x-1.5">
                                  {task.assignees.map((assignee, idx) => (
                                    <img key={idx} src={assignee.avatar} alt={assignee.name} className="w-5 h-5 rounded-full border border-white object-cover" title={assignee.name} />
                                  ))}
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

          {/* VIEW 2: SCHEDULE & TIMELINE PAGE */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#E5DBCA] gap-3">
                <div>
                  <p className="text-xs text-[#7B7062] font-medium flex items-center space-x-1.5">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Sprint #3 Deliverables & Milestones Schedule</span>
                  </p>
                  <h1 className="text-2xl font-black text-[#26201A] tracking-tight mt-0.5">
                    Project Timeline & Deadlines
                  </h1>
                </div>
                <button
                  onClick={() => setIsNewScheduleModalOpen(true)}
                  className="px-4 py-2 bg-[#2E2721] text-[#FAF6EE] text-xs font-bold rounded-xl hover:bg-[#463D34] shadow flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Schedule Event</span>
                </button>
              </div>

              {/* Calendar & Timeline Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* May 2026 Calendar Grid (Vintage Paper Stationery Theme) */}
                <div className="bg-[#F5EFEB] rounded-2xl border border-[#DCD1BC] p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DCD1BC]">
                    <h2 className="text-sm font-black text-[#2C241E]">May 2026</h2>
                    <span className="text-xs px-2.5 py-0.5 bg-[#E4DAC7] text-[#52473A] font-bold rounded-md">
                      Week 19
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#867A6B] mb-2">
                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-semibold">
                    {Array.from({ length: 31 }).map((_, i) => {
                      const day = i + 1;
                      const isToday = day === 10;
                      const hasEvent = [11, 13, 14, 18, 20].includes(day);
                      return (
                        <div
                          key={day}
                          className={`h-9 flex flex-col items-center justify-center rounded-xl transition-all cursor-pointer ${
                            isToday
                              ? 'bg-[#2E2721] text-[#FAF6EE] font-black shadow-sm'
                              : hasEvent
                              ? 'bg-[#EAE0CF] text-[#2C241E] border border-[#D5CABB]'
                              : 'text-[#695D50] hover:bg-[#EAE0CF]/50'
                          }`}
                        >
                          <span>{day}</span>
                          {hasEvent && !isToday && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 -mt-0.5"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduled Events List */}
                <div className="lg:col-span-2 space-y-3">
                  <h2 className="text-sm font-black text-[#2C241E] px-1">Upcoming Deliverables & Events ({schedules.length})</h2>
                  <div className="space-y-3">
                    {schedules.map(event => {
                      const style = getColorStyles(event.color);
                      return (
                        <div
                          key={event.id}
                          className={`${style.bg} border ${style.border} rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.tagBg} ${style.tagText}`}>
                                {event.category}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/60 text-[#54483C]">
                                Priority: {event.priority}
                              </span>
                            </div>
                            <h3 className={`text-sm font-bold ${style.textColor}`}>{event.title}</h3>
                            <div className="flex items-center space-x-3 text-xs text-[#7A6D5E]">
                              <span className="flex items-center space-x-1">
                                <CalendarIcon className="w-3.5 h-3.5" />
                                <span>{event.date}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{event.time}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 self-end sm:self-center">
                            <span className="text-xs px-2.5 py-1 rounded-lg bg-white/70 font-semibold text-[#44382C] border border-black/5">
                              👤 {event.assignee}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
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
                  <span>+ New Memo</span>
                </button>
              </div>

              {/* Notes Grid (Vintage stationery sticky notes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {notes.map(note => {
                  const paperClass = getNotePaperColor(note.color);
                  return (
                    <div
                      key={note.id}
                      className={`${paperClass} rounded-2xl border p-5 shadow-sm relative group flex flex-col justify-between hover:shadow-md transition-all`}
                    >
                      {/* Note Header: Pin Icon & Category */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex space-x-1">
                            {note.tags.map((t, idx) => (
                              <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 text-[#5A4F42]">
                                {t}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => togglePinNote(note.id)}
                            className={`p-1 rounded-full transition-colors ${
                              note.isPinned ? 'text-amber-800' : 'text-[#A09382] hover:text-[#2C241E]'
                            }`}
                            title={note.isPinned ? 'Pinned note' : 'Pin note'}
                          >
                            <Pin className="w-4 h-4 fill-current" />
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

          {/* VIEW 4: ACTIVITY LOGS & REPORTS */}
          {(activeTab === 'reports' || activeTab === 'team') && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#2A231D]">
                {activeTab === 'reports' ? 'Activity Logs & System Telemetry' : 'Team Members & Permissions'}
              </h2>
              <div className="bg-[#F5EFEB] rounded-2xl border border-[#DCD1BC] p-6 space-y-3">
                <p className="text-xs text-[#6A5E51]">
                  All database activities, user permissions, and real-time events are tracked via the backend API.
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-[#DCD1BC] text-xs">
                    <span className="font-bold text-[#2A231D]">Mason Walker</span> (Admin) updated task color to Peach on "Wehiu product task"
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-[#DCD1BC] text-xs">
                    <span className="font-bold text-[#2A231D]">Sarah L.</span> posted a new discussion comment on "Search inspirations for upcoming project"
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Task Detail Modal & Live Card Color Changer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
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

            <div className="p-6 overflow-y-auto space-y-6">
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

              {/* CARD COLOR CHANGER SWATCHES (Core User Requirement!) */}
              <div className="bg-[#F5EFEB] p-4 rounded-xl border border-[#DCD1BC] space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#5A4F42]">
                  <span className="flex items-center space-x-1.5">
                    <Palette className="w-4 h-4 text-[#7A6E60]" />
                    <span>Card Color Theme (Click to Change)</span>
                  </span>
                  <span className="capitalize font-semibold text-[#8C8072]">Active: {selectedTask.color}</span>
                </div>
                <div className="flex items-center space-x-2.5 pt-1">
                  {(['blue', 'peach', 'purple', 'mint', 'coral', 'canary'] as CardColor[]).map((c) => {
                    const st = getColorStyles(c);
                    const isSelected = selectedTask.color === c;
                    return (
                      <button
                        key={c}
                        onClick={() => handleTaskColorChange(selectedTask.id, c)}
                        className={`h-8 px-3 rounded-xl border flex items-center space-x-1.5 text-xs font-bold transition-all ${st.bg} ${st.border} ${st.textColor} ${
                          isSelected ? 'ring-2 ring-[#2E2721] scale-105 shadow-sm' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span className="capitalize">{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Progress & Subtasks */}
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
      )}

      {/* Modal: Create Task Card */}
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

              {/* Card Color Selector */}
              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Card Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['blue', 'peach', 'purple', 'mint', 'coral', 'canary'] as CardColor[]).map(c => {
                    const st = getColorStyles(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewTaskColor(c)}
                        className={`px-3 py-1.5 text-xs rounded-xl font-bold border ${st.bg} ${st.textColor} ${
                          newTaskColor === c ? 'ring-2 ring-[#322A22] border-transparent shadow-xs' : 'border-black/10'
                        }`}
                      >
                        <span className="capitalize">{c}</span>
                      </button>
                    );
                  })}
                </div>
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
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
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

      {/* Modal: Create Dossier Note */}
      {isNewNoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#29221C]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DEC9]">
              <h3 className="text-base font-bold text-[#2C241E]">Create Dossier Memo</h3>
              <button onClick={() => setIsNewNoteModalOpen(false)} className="text-[#786D60] hover:text-[#2A231D]">
                <X className="w-4 h-4" />
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
                  <select
                    value={newNoteColor}
                    onChange={(e) => setNewNoteColor(e.target.value as any)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  >
                    <option value="cream">Cream Paper</option>
                    <option value="sand">Warm Sand</option>
                    <option value="mint">Mint Herb</option>
                    <option value="rose">Dusty Rose</option>
                  </select>
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
        <div className="fixed inset-0 z-50 bg-[#29221C]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF6EE] border border-[#D5CABB] rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E8DEC9]">
              <h3 className="text-base font-bold text-[#2C241E]">Schedule Deliverable or Event</h3>
              <button onClick={() => setIsNewScheduleModalOpen(false)} className="text-[#786D60] hover:text-[#2A231D]">
                <X className="w-4 h-4" />
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Category</label>
                  <select
                    value={newScheduleCategory}
                    onChange={(e) => setNewScheduleCategory(e.target.value as any)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  >
                    <option value="Sprint">Sprint</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Review">Review</option>
                    <option value="Deadline">Deadline</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#5C5042] mb-1">Priority</label>
                  <select
                    value={newSchedulePriority}
                    onChange={(e) => setNewSchedulePriority(e.target.value as any)}
                    className="w-full bg-white border border-[#D5CABB] rounded-xl px-3 py-2 text-xs text-[#2A231D] focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5C5042] mb-1">Card Color Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['blue', 'peach', 'purple', 'mint', 'coral', 'canary'] as CardColor[]).map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewScheduleColor(c)}
                      className={`px-3 py-1.5 text-xs rounded-xl font-bold border ${
                        newScheduleColor === c ? 'bg-[#2E2721] text-[#FAF6EE]' : 'bg-[#EFE8DC] text-[#4E4438]'
                      }`}
                    >
                      <span className="capitalize">{c}</span>
                    </button>
                  ))}
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
    </div>
  );
}
