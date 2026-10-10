import React from 'react';
import Link from 'next/link';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconChecklist,
  IconCircleCheck,
  IconClock,
  IconFolderCheck,
  IconFolders,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';

export default function DashboardPage() {
  // Static mock stats matching backend /api/dashboard/stats & seed data
  const stats = {
    projects: {
      total: 2,
      active: 2,
    },
    tasks: {
      total: 17,
      completed: 11,
      pending: 6,
      highPriority: 3,
    },
  };

  const urgentTasks = [
    {
      id: 'task-01',
      title: 'Database migrations & schema optimization',
      project: 'Project Alpha',
      projectId: 'proj-alpha-001',
      priority: 'High',
      status: 'Done',
      dueDate: 'Oct 14, 2026',
    },
    {
      id: 'task-02',
      title: 'Configure JWT authentication strategy',
      project: 'Project Alpha',
      projectId: 'proj-alpha-001',
      priority: 'High',
      status: 'In Progress',
      dueDate: 'Oct 16, 2026',
    },
    {
      id: 'task-05',
      title: 'Setup role-based access control guards',
      project: 'Project Beta',
      projectId: 'proj-beta-002',
      priority: 'High',
      status: 'In Progress',
      dueDate: 'Oct 18, 2026',
    },
  ];

  const recentProjects = [
    {
      id: 'proj-alpha-001',
      name: 'Project Alpha',
      role: 'Owner',
      totalTasks: 12,
      completedTasks: 8,
      members: 3,
    },
    {
      id: 'proj-beta-002',
      name: 'Project Beta',
      role: 'Member',
      totalTasks: 5,
      completedTasks: 3,
      members: 2,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-normal tracking-tight text-zinc-950">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-zinc-500">
            Live overview of project health, member allocation, and pending task deliverables.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white py-2 px-4 text-xs sm:text-sm font-medium text-zinc-800 shadow-2xs hover:bg-zinc-50 hover:border-zinc-300 transition-colors"
          >
            <span>View All Projects</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-full bg-black py-2 px-5 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-neutral-800 transition-colors"
          >
            <IconPlus className="h-4 w-4" size={16} />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid (6 Core Cards required in AGENTS.md Section 9) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Projects */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Total
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <IconFolders className="h-4 w-4" size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {stats.projects.total}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Projects Enrolled</p>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Active
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#c1fbd4]/60 flex items-center justify-center text-emerald-900">
              <IconFolderCheck className="h-4 w-4" size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {stats.projects.active}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">In Progress</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Tasks
            </span>
            <div className="h-8 w-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700">
              <IconChecklist className="h-4 w-4" size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {stats.tasks.total}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Assigned Deliverables</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Done
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <IconCircleCheck className="h-4 w-4" size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {stats.tasks.completed}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Resolved Tasks</p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Pending
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <IconClock className="h-4 w-4" size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {stats.tasks.pending}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">Awaiting Action</p>
          </div>
        </div>

        {/* High Priority */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
              Urgent
            </span>
            <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <IconAlertTriangle className="h-4 w-4" size={18} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950">
              {stats.tasks.highPriority}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">High Priority</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Projects Progress & High-Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Active Projects Status */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-base font-medium text-zinc-900">Active Workspaces</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Current progress across your enrolled projects
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-black"
            >
              <span>All Projects</span>
              <IconArrowRight className="h-3.5 w-3.5" size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {recentProjects.map((project) => {
              const isOwner = project.role === 'Owner';
              const percentage = Math.round((project.completedTasks / project.totalTasks) * 100);

              return (
                <div
                  key={project.id}
                  className="rounded-xl border border-zinc-200/70 p-4 space-y-3 hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-medium text-sm text-zinc-900 hover:underline"
                      >
                        {project.name}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <IconUsers className="h-3 w-3" size={12} />
                          {project.members} members
                        </span>
                        <span>•</span>
                        <span>
                          {project.completedTasks}/{project.totalTasks} tasks done
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        isOwner
                          ? 'bg-[#c1fbd4] text-zinc-900'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200/60'
                      }`}
                    >
                      {project.role}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-end text-[11px] text-zinc-500 font-medium">
                      {percentage}% Completed
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: High Priority Action Items */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-base font-medium text-zinc-900">Priority Queue</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Tasks flagged with high priority across all spaces
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/60">
              3 Urgent
            </span>
          </div>

          <div className="space-y-3">
            {urgentTasks.map((task) => {
              const isDone = task.status === 'Done';

              return (
                <div
                  key={task.id}
                  className="rounded-xl border border-zinc-200/70 p-3.5 flex items-center justify-between gap-3 hover:border-zinc-300 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-zinc-900 truncate">
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Link
                        href={`/projects/${task.projectId}`}
                        className="hover:underline text-zinc-600 font-medium"
                      >
                        {task.project}
                      </Link>
                      <span>•</span>
                      <span>Due {task.dueDate}</span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                        : 'bg-blue-50 text-blue-700 border-blue-200/60'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
