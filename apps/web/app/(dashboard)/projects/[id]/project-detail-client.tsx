'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconCalendar,
  IconChecklist,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react';
import { PriorityBadge, RoleBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High';
  assignee: string;
  dueDate: string;
}

interface MemberItem {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Member';
  joinedDate: string;
}

export default function ProjectDetailClient({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'members' | 'settings'>('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  // Mock Data matching seed scenario
  const [tasks] = useState<TaskItem[]>([
    {
      id: 'task-01',
      title: 'Database migrations & schema optimization',
      description: 'Define Prisma schema, indexes, and composite constraints for project isolation.',
      status: 'Done',
      priority: 'High',
      assignee: 'Member User 2',
      dueDate: 'Oct 14, 2026',
    },
    {
      id: 'task-02',
      title: 'Configure JWT authentication strategy',
      description: 'Implement Passport JWT strategy, bcrypt hashing, and protected route guards.',
      status: 'In Progress',
      priority: 'High',
      assignee: 'Member User 1',
      dueDate: 'Oct 16, 2026',
    },
    {
      id: 'task-03',
      title: 'Implement task filtering & pagination queries',
      description: 'Build backend query handling for search, status, priority, and sorting.',
      status: 'Todo',
      priority: 'Medium',
      assignee: 'Unassigned',
      dueDate: 'Oct 20, 2026',
    },
    {
      id: 'task-04',
      title: 'Add dashboard aggregation metrics',
      description: 'Compile project counts, active project stats, and task completion summaries.',
      status: 'Todo',
      priority: 'Low',
      assignee: 'Member User 1',
      dueDate: 'Oct 25, 2026',
    },
  ]);

  const [members] = useState<MemberItem[]>([
    {
      id: 'user-01',
      name: 'Owner User',
      email: 'owner@example.com',
      role: 'Owner',
      joinedDate: 'Oct 01, 2026',
    },
    {
      id: 'user-02',
      name: 'Member User 1',
      email: 'member1@example.com',
      role: 'Member',
      joinedDate: 'Oct 03, 2026',
    },
    {
      id: 'user-03',
      name: 'Member User 2',
      email: 'member2@example.com',
      role: 'Member',
      joinedDate: 'Oct 05, 2026',
    },
  ]);

  // Filtering
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPriority = !priorityFilter || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCreateTaskModal = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: TaskItem) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 hover:text-zinc-900 transition-colors"
        >
          <IconArrowLeft className="h-3.5 w-3.5" size={14} />
          <span>Projects</span>
        </Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium">Project Alpha</span>
      </div>

      {/* Project Header Card */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-950">
                Project Alpha
              </h1>
              <RoleBadge role="Owner" />
              <span className="text-xs text-zinc-400 font-mono">ID: {id}</span>
            </div>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
              Core platform infrastructure, access management, and multi-tenant task orchestration.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setIsMemberModalOpen(true)}>
              <IconUserPlus className="h-4 w-4 text-zinc-600" size={16} />
              <span>Manage Members ({members.length})</span>
            </Button>

            <Button size="sm" onClick={openCreateTaskModal}>
              <IconPlus className="h-4 w-4" size={16} />
              <span>New Task</span>
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-100 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-b-2 border-black text-zinc-900'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Tasks</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className={`pb-3 font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'members'
                ? 'border-b-2 border-black font-semibold text-zinc-900'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Members</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
              {members.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-3 font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-b-2 border-black font-semibold text-zinc-900'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* TAB 1: Tasks View */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Query Toolbar */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-3 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {/* Keyword Search */}
              <div className="relative md:col-span-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <IconSearch className="h-4 w-4" size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks by title or details..."
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900"
                >
                  <option value="">All Statuses</option>
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Sort Selector */}
              <div>
                <select className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900">
                  <option value="dueDate:asc">Due Date (Asc)</option>
                  <option value="dueDate:desc">Due Date (Desc)</option>
                  <option value="createdAt:desc">Created Date (Newest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Task Table or Empty State */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={IconChecklist}
              title="No tasks match your filters"
              description="Try adjusting your status, priority, or search query to find tasks."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('');
                    setPriorityFilter('');
                  }}
                >
                  Reset Filters
                </Button>
              }
            />
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-200/80 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="border-b border-zinc-200/80 bg-zinc-50/60 text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
                    <tr>
                      <th className="py-3 px-4 sm:px-6">Task Title</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-800">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="font-medium text-zinc-900">{task.title}</div>
                          <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={task.status} />
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <PriorityBadge priority={task.priority} />
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs">
                          {task.assignee === 'Unassigned' ? (
                            <span className="text-zinc-400 italic">Unassigned</span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-bold flex items-center justify-center">
                                {task.assignee.charAt(0)}
                              </div>
                              <span className="text-zinc-800 font-medium">{task.assignee}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-xs text-zinc-500">
                          <div className="inline-flex items-center gap-1">
                            <IconCalendar className="h-3.5 w-3.5 text-zinc-400" size={14} />
                            <span>{task.dueDate}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditTaskModal(task)}
                              title="Edit task"
                              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <IconEdit className="h-4 w-4" size={16} />
                            </button>
                            <button
                              type="button"
                              title="Delete task"
                              className="p-1 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <IconTrash className="h-4 w-4" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="flex items-center justify-between border-t border-zinc-100 px-4 sm:px-6 py-3.5 text-xs text-zinc-500">
                <div>
                  Showing <span className="font-semibold text-zinc-700">1</span> to{' '}
                  <span className="font-semibold text-zinc-700">{filteredTasks.length}</span> of{' '}
                  <span className="font-semibold text-zinc-700">{tasks.length}</span> tasks
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled
                    aria-label="Previous page"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
                  >
                    <IconChevronLeft className="h-4 w-4" size={16} />
                  </button>
                  <span className="px-2 text-zinc-700 font-medium">Page 1 of 1</span>
                  <button
                    type="button"
                    disabled
                    aria-label="Next page"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed"
                  >
                    <IconChevronRight className="h-4 w-4" size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Members View */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-100 pb-5">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Project Members</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Manage user access, role assignments, and collaboration rights.
              </p>
            </div>

            <Button size="sm" onClick={() => setIsMemberModalOpen(true)}>
              <IconUserPlus className="h-4 w-4" size={16} />
              <span>Add Member</span>
            </Button>
          </div>

          {/* Members Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-zinc-100 text-zinc-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-zinc-800">
                {members.map((member) => {
                  const isOwner = member.role === 'Owner';
                  return (
                    <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-xs">
                            {member.name.charAt(0)}
                          </div>
                          <span className="font-medium text-zinc-900">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">{member.email}</td>
                      <td className="py-3.5 px-4">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="py-3.5 px-4 text-zinc-500">{member.joinedDate}</td>
                      <td className="py-3.5 px-4 text-right">
                        {isOwner ? (
                          <span className="text-[11px] text-zinc-400 font-medium">Project Owner</span>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Settings View */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-base font-semibold text-zinc-900">Project Settings</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Update project name, description, and workspace metadata.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Project settings updated (mock)');
              }}
              className="space-y-4 max-w-xl"
            >
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Project Title
                </label>
                <input
                  type="text"
                  defaultValue="Project Alpha"
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Description
                </label>
                <textarea
                  rows={3}
                  defaultValue="Core platform infrastructure, access management, and multi-tenant task orchestration."
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 rounded-2xl border border-red-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
            <div>
              <h3 className="text-base font-semibold text-red-900">Danger Zone</h3>
              <p className="text-xs text-red-700 mt-0.5">
                Deleting this project will permanently remove all associated tasks and member records.
              </p>
            </div>

            <Button variant="danger" size="sm">
              <IconTrash className="h-4 w-4" size={16} />
              <span>Delete Project</span>
            </Button>
          </div>
        </div>
      )}

      {/* Task Dialog (Create / Edit) */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            <DialogDescription>
              {selectedTask
                ? 'Update task details, assignment, and completion status.'
                : 'Add a new task deliverable to this workspace.'}
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsTaskModalOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Task Title
              </label>
              <input
                type="text"
                required
                defaultValue={selectedTask?.title || ''}
                placeholder="e.g. Implement user authentication"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Description
              </label>
              <textarea
                rows={3}
                defaultValue={selectedTask?.description || ''}
                placeholder="Detailed task description..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Status
                </label>
                <select
                  defaultValue={selectedTask?.status || 'Todo'}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Priority
                </label>
                <select
                  defaultValue={selectedTask?.priority || 'Medium'}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Assignee
                </label>
                <select
                  defaultValue={selectedTask?.assignee || 'Unassigned'}
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900"
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Owner User">Owner User</option>
                  <option value="Member User 1">Member User 1</option>
                  <option value="Member User 2">Member User 2</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Due Date
                </label>
                <input
                  type="date"
                  defaultValue="2026-10-20"
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsTaskModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {selectedTask ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Member</DialogTitle>
            <DialogDescription>
              Invite an active user to collaborate on tasks in this workspace.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setIsMemberModalOpen(false);
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                User Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. member@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMemberModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
