import React from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconChecklist,
  IconFolder,
  IconUsers,
} from '@tabler/icons-react';
import type { ProjectListItem } from '@/api/query-list/projects.query';
import { RoleBadge } from '@/components/ui/badge';

interface ProjectCardProps {
  project: ProjectListItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const totalTasks = project._count?.tasks ?? 0;
  const membersCount = project._count?.members ?? 1;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 flex flex-col justify-between hover:border-zinc-300 hover:shadow-xs transition-all group">
      <div className="space-y-4">
        {/* Card Top: Icon & Role Badge */}
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 group-hover:bg-[#c1fbd4] group-hover:text-zinc-900 transition-colors">
            <IconFolder className="h-5 w-5" size={20} />
          </div>
          <RoleBadge role={project.currentUserRole} />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-medium text-zinc-900 group-hover:text-black transition-colors">
            <Link href={`/projects/${project.id}`} className="hover:underline">
              {project.name}
            </Link>
          </h3>
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
        </div>
      </div>

      {/* Progress & Metadata */}
      <div className="space-y-4 pt-6 mt-6 border-t border-zinc-100">
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span className="flex items-center gap-1.5 text-zinc-600">
            <IconChecklist className="h-3.5 w-3.5 text-zinc-400" size={14} />
            <span>
              {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-600">
            <IconUsers className="h-3.5 w-3.5 text-zinc-400" size={14} />
            <span>
              {membersCount} {membersCount === 1 ? 'member' : 'members'}
            </span>
          </span>
        </div>

        {/* Footer: Owner & Open Link */}
        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <span className="text-zinc-400 truncate max-w-[150px]">
            Owner: <span className="text-zinc-700 font-medium">{project.owner?.name ?? 'Unknown'}</span>
          </span>

          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-black transition-colors"
          >
            <span>Open</span>
            <IconArrowRight className="h-3.5 w-3.5" size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
