import React, { Suspense } from 'react';
import Link from 'next/link';
import {
  IconArrowLeft,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconDotsVertical,
  IconPlus,
  IconSearch,
  IconUserPlus,
} from '@tabler/icons-react';

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

async function ProjectIdDisplay({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  return <span className="text-xs text-zinc-400 font-mono">ID: {id}</span>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {

  // Static mock task data for design phase (matching seed data)
  const mockTasks = [
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
  ];

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Back Link */}
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#c1fbd4] text-zinc-900">
                Owner
              </span>
              <Suspense fallback={<span className="text-xs text-zinc-400 font-mono">ID: ...</span>}>
                <ProjectIdDisplay params={params} />
              </Suspense>
            </div>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
              Core platform infrastructure, access management, and multi-tenant task orchestration.
            </p>
          </div>

          {/* Action Buttons (Pill styling matching DESIGN.md) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white py-2 px-4 text-xs sm:text-sm font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer"
            >
              <IconUserPlus className="h-4 w-4 text-zinc-600" size={16} />
              <span>Manage Members (3)</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-black py-2 px-5 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <IconPlus className="h-4 w-4" size={16} />
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-100 text-sm">
          <button
            type="button"
            className="pb-3 border-b-2 border-black font-semibold text-zinc-900 flex items-center gap-2"
          >
            <span>Tasks</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 text-xs font-medium">
              4
            </span>
          </button>
          <button
            type="button"
            className="pb-3 border-b-2 border-transparent font-medium text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-2"
          >
            <span>Members</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 text-xs font-medium">
              3
            </span>
          </button>
          <button
            type="button"
            className="pb-3 border-b-2 border-transparent font-medium text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Task Filters & Search Bar (AGENTS.md Section 7) */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative md:col-span-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <IconSearch className="h-4 w-4" size={16} />
            </div>
            <input
              type="text"
              placeholder="Search tasks by title..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900">
              <option value="">All Statuses</option>
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900">
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Sort Control */}
          <div>
            <select className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-xs sm:text-sm text-zinc-700 outline-none focus:border-zinc-900">
              <option value="dueDate:asc">Due Date (Asc)</option>
              <option value="dueDate:desc">Due Date (Desc)</option>
              <option value="createdAt:desc">Created Date (Newest)</option>
              <option value="createdAt:asc">Created Date (Oldest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List Table */}
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
              {mockTasks.map((task) => {
                // Status Pills
                const statusStyles: Record<string, string> = {
                  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
                  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200/60',
                  Todo: 'bg-zinc-100 text-zinc-700 border-zinc-200/60',
                };

                // Priority Pills
                const priorityStyles: Record<string, string> = {
                  High: 'bg-red-50 text-red-700 border-red-200/60',
                  Medium: 'bg-amber-50 text-amber-700 border-amber-200/60',
                  Low: 'bg-zinc-100 text-zinc-600 border-zinc-200/60',
                };

                return (
                  <tr key={task.id} className="hover:bg-zinc-50/50 transition-colors">
                    {/* Title & Description */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-medium text-zinc-900">{task.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                        {task.description}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          statusStyles[task.status] || 'bg-zinc-100 text-zinc-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          priorityStyles[task.priority] || 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Assignee */}
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

                    {/* Due Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-zinc-500">
                      <div className="inline-flex items-center gap-1">
                        <IconCalendar className="h-3.5 w-3.5 text-zinc-400" size={14} />
                        <span>{task.dueDate}</span>
                      </div>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        type="button"
                        aria-label="Task options"
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                      >
                        <IconDotsVertical className="h-4 w-4" size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar (AGENTS.md Section 7) */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-4 sm:px-6 py-3.5 text-xs text-zinc-500">
          <div>
            Showing <span className="font-semibold text-zinc-700">1</span> to{' '}
            <span className="font-semibold text-zinc-700">4</span> of{' '}
            <span className="font-semibold text-zinc-700">4</span> tasks
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
    </div>
  );
}
