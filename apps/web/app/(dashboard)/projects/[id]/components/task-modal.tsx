'use client';

import React, { useState } from 'react';
import { useCreateTask, useUpdateTask } from '@/api/api-hooks/tasks.api-hook';
import type { ProjectMember } from '@/api/query-list/projects.query';
import type { Task, TaskPriority, TaskStatus } from '@/api/query-list/tasks.query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  members: ProjectMember[];
  taskToEdit?: Task | null;
}

function TaskForm({
  projectId,
  members,
  taskToEdit,
  onClose,
}: {
  projectId: string;
  members: ProjectMember[];
  taskToEdit?: Task | null;
  onClose: () => void;
}) {
  const isEditing = !!taskToEdit;
  const createTaskMutation = useCreateTask(projectId);
  const updateTaskMutation = useUpdateTask();

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [status, setStatus] = useState<TaskStatus>(taskToEdit?.status || 'TODO');
  const [priority, setPriority] = useState<TaskPriority>(taskToEdit?.priority || 'MEDIUM');
  const [assigneeId, setAssigneeId] = useState(taskToEdit?.assigneeId || '');
  const [dueDate, setDueDate] = useState(
    taskToEdit?.dueDate
      ? new Date(taskToEdit.dueDate).toISOString().split('T')[0]
      : '',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const formattedDueDate = dueDate
      ? new Date(dueDate).toISOString()
      : null;

    try {
      if (isEditing) {
        await updateTaskMutation.mutateAsync({
          id: taskToEdit.id,
          data: {
            title: trimmedTitle,
            description: description.trim() || undefined,
            status,
            priority,
            assigneeId: assigneeId || null,
            dueDate: formattedDueDate,
          },
        });
      } else {
        await createTaskMutation.mutateAsync({
          title: trimmedTitle,
          description: description.trim() || undefined,
          status,
          priority,
          assigneeId: assigneeId || undefined,
          dueDate: formattedDueDate || undefined,
        });
      }
      onClose();
    } catch {
      // Toast notification is handled in mutation hooks
    }
  };

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
          Task Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          disabled={isPending}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Implement user authentication strategy"
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 disabled:opacity-50"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          disabled={isPending}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed task scope, technical notes, or acceptance criteria..."
          className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 resize-none disabled:opacity-50"
        />
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Status
          </label>
          <select
            disabled={isPending}
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900 disabled:opacity-50"
          >
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Priority
          </label>
          <select
            disabled={isPending}
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900 disabled:opacity-50"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      {/* Assignee & Due Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Assignee
          </label>
          <select
            disabled={isPending}
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900 disabled:opacity-50"
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.user.name} ({member.user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
            Due Date
          </label>
          <input
            type="date"
            disabled={isPending}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-900 disabled:opacity-50"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" isLoading={isPending}>
          {isEditing ? 'Save Changes' : 'Create Task'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function TaskModal({
  open,
  onOpenChange,
  projectId,
  members,
  taskToEdit,
}: TaskModalProps) {
  const isEditing = !!taskToEdit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update task details, priority, and assignees for this project deliverable.'
              : 'Add a new task deliverable and assign it to an active project member.'}
          </DialogDescription>
        </DialogHeader>

        {open && (
          <TaskForm
            key={taskToEdit?.id ?? 'create-task'}
            projectId={projectId}
            members={members}
            taskToEdit={taskToEdit}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
