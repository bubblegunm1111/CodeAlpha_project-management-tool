import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProjectStore } from '../store/projectStore';
import { Plus, Folder, Users, LogOut, Settings } from 'lucide-react';

export default function Projects() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const projects = useProjectStore((state) => state.projects);
  const fetchProjects = useProjectStore((state) => state.fetchProjects);
  const createProject = useProjectStore((state) => state.createProject);
  const isLoading = useProjectStore((state) => state.isLoading);

  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchProjects();
    }
  }, [user, navigate]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectTitle.trim()) {
      try {
        await createProject(newProjectTitle, newProjectDescription);
        setNewProjectTitle('');
        setNewProjectDescription('');
        setShowNewProjectForm(false);
        await fetchProjects();
      } catch (err) {
        // Error handled by store
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Project Hub</h1>
            <p className="text-sm text-amber-700 mt-1">Welcome, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/settings')}
              className="p-2 hover:bg-amber-100 rounded-lg transition"
              title="Settings"
            >
              <Settings className="w-6 h-6 text-amber-700" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-100 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-6 h-6 text-red-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* New Project Button */}
        <div className="mb-8">
          {!showNewProjectForm && (
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              New Project
            </button>
          )}

          {showNewProjectForm && (
            <div className="bg-white/80 backdrop-blur rounded-lg shadow-lg p-6 border border-amber-100 max-w-md">
              <h3 className="text-xl font-bold text-amber-900 mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProjectTitle}
                    onChange={(e) => setNewProjectTitle(e.target.value)}
                    placeholder="My Project"
                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    placeholder="Describe your project..."
                    rows={3}
                    className="w-full px-4 py-2 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-amber-50/50"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading || !newProjectTitle.trim()}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewProjectForm(false)}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-bold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        <div>
          <h2 className="text-2xl font-bold text-amber-900 mb-6">Your Projects</h2>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-700 text-lg">No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/board/${project.id}`)}
                  className="bg-white/80 backdrop-blur rounded-lg shadow-lg p-6 border border-amber-100 hover:shadow-xl hover:border-amber-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <Folder className="w-8 h-8 text-amber-600 group-hover:text-orange-600 transition" />
                    {project.is_private && (
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded">
                        Private
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-amber-900 mb-2 group-hover:text-orange-700 transition">
                    {project.title}
                  </h3>

                  {project.description && (
                    <p className="text-amber-700 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-amber-600 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{project.members?.length || 1} member(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
