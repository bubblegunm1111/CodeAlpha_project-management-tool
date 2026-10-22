import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectStore, Task, Column } from '../store/projectStore';
import { ArrowLeft, Plus, X, Send, MessageSquare, Clock, AlertCircle } from 'lucide-react';

export default function Board() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const currentProject = useProjectStore((state) => state.currentProject);
  const fetchProjectDetail = useProjectStore((state) => state.fetchProjectDetail);
  const createTask = useProjectStore((state) => state.createTask);
  const updateTask = useProjectStore((state) => state.updateTask);
  const deleteTask = useProjectStore((state) => state.deleteTask);
  const addComment = useProjectStore((state) => state.addComment);
  const isLoading = useProjectStore((state) => state.isLoading);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newTaskColumn, setNewTaskColumn] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail(parseInt(projectId));
    }
  }, [projectId]);

  const handleCreateTask = async (columnId: number) => {
    if (newTaskTitle.trim()) {
      await createTask(columnId, newTaskTitle, '', newTaskPriority);
      setNewTaskTitle('');
      setNewTaskColumn(null);
    }
  };

  const handleAddComment = async () => {
    if (selectedTask && newCommentContent.trim()) {
      await addComment(selectedTask.id, newCommentContent);
      setNewCommentContent('');
      // Refresh task
      if (currentProject?.columns) {
        for (const col of currentProject.columns) {
          const task = col.tasks?.find((t) => t.id === selectedTask.id);
          if (task) {
            setSelectedTask(task);
            break;
          }
        }
      }
    }
  };

  const handleTaskUpdate = async (updates: Partial<Task>) => {
    if (selectedTask) {
      await updateTask(selectedTask.id, updates);
      // Refresh selected task
      if (currentProject?.columns) {
        for (const col of currentProject.columns) {
          const task = col.tasks?.find((t) => t.id === selectedTask.id);
          if (task) {
            setSelectedTask({ ...task, ...updates });
            break;
          }
        }
      }
    }
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = async (columnId: number) => {
    if (draggedTask && draggedTask.column_id !== columnId) {
      await updateTask(draggedTask.id, { column_id: columnId });
      setDraggedTask(null);
    }
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-amber-700">Loading project...</p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-amber-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 hover:bg-amber-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-amber-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-amber-900">{currentProject.title}</h1>
            {currentProject.description && (
              <p className="text-sm text-amber-700">{currentProject.description}</p>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentProject.columns?.map((column: Column) => (
            <div
              key={column.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnColumn(column.id)}
              className="bg-white/60 backdrop-blur rounded-lg border-2 border-dashed border-amber-200 p-4 min-h-96"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-amber-900">{column.title}</h2>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
                  {column.tasks?.length || 0}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-3 mb-4">
                {column.tasks?.map((task: Task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    onClick={() => setSelectedTask(task)}
                    className="bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-amber-900 flex-1 line-clamp-2 group-hover:text-orange-700">
                        {task.title}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTask(task.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-200 rounded transition"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>

                    {task.priority && (
                      <div className="mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </div>
                    )}

                    {task.due_date && (
                      <div className="flex items-center gap-1 text-xs text-amber-700 mb-2">
                        <Clock className="w-3 h-3" />
                        {task.due_date}
                      </div>
                    )}

                    {task.assignee && (
                      <div className="flex items-center gap-2 pt-2 border-t border-amber-300">
                        {task.assignee.avatar_url && (
                          <img
                            src={task.assignee.avatar_url}
                            alt={task.assignee.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-xs text-amber-800">{task.assignee.name}</span>
                      </div>
                    )}

                    {task.comments && task.comments.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-amber-700 mt-2">
                        <MessageSquare className="w-3 h-3" />
                        {task.comments.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Task Button */}
              {newTaskColumn === column.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50"
                    autoFocus
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50 text-sm"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCreateTask(column.id)}
                      disabled={isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2 px-3 rounded-lg text-sm transition"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setNewTaskColumn(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-3 rounded-lg text-sm transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setNewTaskColumn(column.id)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-amber-700 hover:text-orange-700 font-bold transition border-2 border-dashed border-amber-300 rounded-lg hover:border-orange-400"
                >
                  <Plus className="w-5 h-5" />
                  Add Task
                </button>
              )}
            </div>
          ))}
        </div>
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-amber-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-amber-900">{selectedTask.title}</h3>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-amber-100 rounded-lg transition"
              >
                <X className="w-6 h-6 text-amber-700" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Task Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-2">Priority</label>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => handleTaskUpdate({ priority: e.target.value })}
                    className={`w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${getPriorityColor(selectedTask.priority)}`}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={selectedTask.due_date || ''}
                    onChange={(e) => handleTaskUpdate({ due_date: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {selectedTask.description && (
                <div>
                  <label className="block text-sm font-bold text-amber-900 mb-2">Description</label>
                  <p className="text-amber-800">{selectedTask.description}</p>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Comments
                </h4>

                <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
                  {selectedTask.comments?.map((comment) => (
                    <div key={comment.id} className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        {comment.avatar_url && (
                          <img
                            src={comment.avatar_url}
                            alt={comment.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="font-bold text-amber-900 text-sm">{comment.name}</span>
                        <span className="text-xs text-amber-600">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-amber-800 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCommentContent}
                    onChange={(e) => setNewCommentContent(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 px-3 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isLoading || !newCommentContent.trim()}
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
