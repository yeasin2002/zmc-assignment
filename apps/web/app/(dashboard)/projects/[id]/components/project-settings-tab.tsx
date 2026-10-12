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
      <div className="bg-white rounded-lg border border-zinc-200 p-6 sm:p-8 space-y-6">
        <div className="border-b border-zinc-200 pb-4">
          <h2 className="text-base font-semibold text-black font-heading">Project Settings</h2>
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
              maxLength={255}
              disabled={!isOwner || updateProjectMutation.isPending}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-md border border-zinc-200 bg-white py-2 px-3 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black disabled:bg-zinc-100 disabled:text-zinc-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Description
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              disabled={!isOwner || updateProjectMutation.isPending}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe project deliverables..."
              className="w-full rounded-md border border-zinc-200 bg-white py-2 px-3 text-sm text-black outline-none focus:border-black focus:ring-1 focus:ring-black resize-none disabled:bg-zinc-100 disabled:text-zinc-500 transition-colors"
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
        <div className="bg-white rounded-lg border border-zinc-200 p-6 sm:p-8 space-y-4">
          <div>
            <h3 className="text-base font-semibold text-black font-heading">Danger Zone</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
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
