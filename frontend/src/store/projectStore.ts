import { create } from 'zustand';
import { projectAPI, taskAPI, commentAPI } from '../api/client';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Comment {
  id: number;
  task_id: number;
  user_id: number;
  content: string;
  created_at: string;
  name: string;
  avatar_url?: string;
}

export interface Task {
  id: number;
  column_id: number;
  project_id: number;
  title: string;
  description?: string;
  assigned_to?: number;
  priority: string;
  due_date?: string;
  position: number;
  created_at: string;
  updated_at: string;
  assignee?: User;
  comments?: Comment[];
}

export interface Column {
  id: number;
  project_id: number;
  title: string;
  position: number;
  tasks?: Task[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  title: string;
  description?: string;
  owner_id: number;
  is_private: boolean;
  columns?: Column[];
  members?: any[];
  created_at: string;
  updated_at: string;
}

interface ProjectStore {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Project actions
  fetchProjects: () => Promise<void>;
  createProject: (title: string, description?: string) => Promise<void>;
  fetchProjectDetail: (id: number) => Promise<void>;

  // Task actions
  createTask: (columnId: number, title: string, description?: string, priority?: string, due_date?: string) => Promise<void>;
  updateTask: (taskId: number, data: any) => Promise<void>;
  moveTask: (taskId: number, columnId: number, position: number) => Promise<void>;
  deleteTask: (taskId: number) => Promise<void>;

  // Comment actions
  fetchComments: (taskId: number) => Promise<Comment[]>;
  addComment: (taskId: number, content: string) => Promise<void>;

  // Local state helpers
  getTask: (taskId: number) => Task | undefined;
  getColumn: (columnId: number) => Column | undefined;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectAPI.list();
      set({ projects: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  createProject: async (title, description) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectAPI.create(title, description);
      set((state) => ({
        projects: [response.data, ...state.projects],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchProjectDetail: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await projectAPI.getDetail(id);
      set({ currentProject: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch project',
        isLoading: false,
      });
    }
  },

  createTask: async (columnId, title, description, priority, due_date) => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ isLoading: true, error: null });
    try {
      await taskAPI.create(currentProject.id, columnId, title, description, priority, due_date);
      await get().fetchProjectDetail(currentProject.id);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create task',
        isLoading: false,
      });
    }
  },

  updateTask: async (taskId, data) => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ isLoading: true, error: null });
    try {
      await taskAPI.update(taskId, data);
      await get().fetchProjectDetail(currentProject.id);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to update task',
        isLoading: false,
      });
    }
  },

  moveTask: async (taskId, columnId, position) => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ isLoading: true, error: null });
    try {
      await taskAPI.move(taskId, columnId, position);
      await get().fetchProjectDetail(currentProject.id);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to move task',
        isLoading: false,
      });
    }
  },

  deleteTask: async (taskId) => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ isLoading: true, error: null });
    try {
      await taskAPI.delete(taskId);
      await get().fetchProjectDetail(currentProject.id);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to delete task',
        isLoading: false,
      });
    }
  },

  fetchComments: async (taskId) => {
    try {
      const response = await commentAPI.list(taskId);
      return response.data;
    } catch (error) {
      return [];
    }
  },

  addComment: async (taskId, content) => {
    const { currentProject } = get();
    if (!currentProject) return;

    try {
      await commentAPI.create(taskId, content);
      await get().fetchProjectDetail(currentProject.id);
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to add comment',
      });
    }
  },

  getTask: (taskId) => {
    const { currentProject } = get();
    if (!currentProject?.columns) return undefined;
    for (const col of currentProject.columns) {
      const task = col.tasks?.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  },

  getColumn: (columnId) => {
    const { currentProject } = get();
    return currentProject?.columns?.find((c) => c.id === columnId);
  },
}));
