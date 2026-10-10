'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconTrash } from '@tabler/icons-react';
import {
  useDeleteProject,
  useUpdateProject,
} from '@/api/api-hooks/projects.api-hook';
import type { ProjectDetail } from '@/api/query-list/projects.query';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectSettingsTabProps {
  project: ProjectDetail;
  isOwner: boolean;
}

export function ProjectSettingsTab({ project, isOwner }: ProjectSettingsTabProps) {
  const router = useRouter();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();

  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || '');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !isOwner) return;

    try {
      await updateProjectMutation.mutateAsync({
        id: project.id,
        data: {
          name: projectName.trim(),
          description: projectDescription.trim() || undefined,
        },
      });
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      setIsDeleteDialogOpen(false);
      router.push('/projects');
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-zinc-100 pb-4">
          <h2 className="text-base font-semibold text-zinc-900">Project Settings</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Update project name, description, and workspace metadata.
          </p>
        </div>

        {!isOwner && (
          <Alert
            type="info"
            title="Read-only Access"
            message="Only the Project Owner can edit workspace title and description or delete this workspace."
          />
        )}

        <form onSubmit={handleUpdate} className="space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={!isOwner || updateProjectMutation.isPending}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Description
            </label>
            <textarea
              rows={3}
              disabled={!isOwner || updateProjectMutation.isPending}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe project deliverables..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none disabled:bg-zinc-50 disabled:text-zinc-500"
            />
          </div>

          {isOwner && (
            <div className="pt-2">
              <Button type="submit" size="sm" isLoading={updateProjectMutation.isPending}>
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone: Owner Only */}
      {isOwner && (
        <div className="bg-red-50/50 rounded-2xl border border-red-200/80 p-6 sm:p-8 space-y-4 shadow-2xs">
          <div>
            <h3 className="text-base font-semibold text-red-900">Danger Zone</h3>
            <p className="text-xs text-red-700 mt-0.5">
              Deleting this project will permanently remove all associated tasks, comments, and member allocations.
            </p>
          </div>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <IconTrash className="h-4 w-4" size={16} />
            <span>Delete Project</span>
          </Button>
        </div>
      )}

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project Workspace</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong className="text-zinc-900">{project.name}</strong>?
              This action cannot be undone and will permanently delete all associated tasks and member
              assignments.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={deleteProjectMutation.isPending}
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteProjectMutation.isPending}
              onClick={handleDelete}
            >
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
