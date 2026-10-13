'use client';

import React, { useState } from 'react';
import { IconUserPlus, IconUsers } from '@tabler/icons-react';
import {
  useAddProjectMember,
  useRemoveProjectMember,
} from '@/api/api-hooks/projects.api-hook';
import type { ProjectMember } from '@/api/query-list/projects.query';
import { RoleBadge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectMembersTabProps {
  projectId: string;
  ownerId: string;
  isOwner: boolean;
  members: ProjectMember[];
  isLoading: boolean;
}

export function ProjectMembersTab({
  projectId,
  ownerId,
  isOwner,
  members,
  isLoading,
}: ProjectMembersTabProps) {
  const addMemberMutation = useAddProjectMember(projectId);
  const removeMemberMutation = useRemoveProjectMember(projectId);

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim() || !isOwner) return;

    try {
      await addMemberMutation.mutateAsync({ email: memberEmail.trim() });
      setMemberEmail('');
      setIsMemberModalOpen(false);
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove || !isOwner) return;
    try {
      await removeMemberMutation.mutateAsync(memberToRemove.userId);
      setMemberToRemove(null);
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h2 className="text-base font-semibold text-black font-heading">Project Members</h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage user access, role assignments, and collaboration rights.
          </p>
        </div>

        {isOwner && (
          <Button size="sm" onClick={() => setIsMemberModalOpen(true)}>
            <IconUserPlus className="h-4 w-4" size={16} />
            <span>Add Member</span>
          </Button>
        )}
      </div>

      {/* Members Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="flex justify-between items-center py-3 animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={IconUsers}
          title="No members found"
          description="Invite collaborators by email to assign tasks and build deliverables together."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-zinc-200 text-black uppercase tracking-wider text-xs font-semibold font-mono">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-black">
              {members.map((member: ProjectMember) => {
                const isMemberOwner =
                  member.role === 'OWNER' || member.userId === ownerId;

                return (
                  <tr key={member.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-black text-white font-mono font-bold flex items-center justify-center text-xs">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-black">{member.user.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600">{member.user.email}</td>
                    <td className="py-3.5 px-4">
                      <RoleBadge role={member.role} />
                    </td>
                    <td className="py-3.5 px-4 text-zinc-600 font-mono">
                      {new Date(member.joinedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isMemberOwner ? (
                        <span className="text-xs text-zinc-400 font-medium">
                          Project Owner
                        </span>
                      ) : isOwner ? (
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(member)}
                          className="text-xs text-red-600 hover:text-black font-medium hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400">Member</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Project Member</DialogTitle>
            <DialogDescription>
              Invite a registered user by email to collaborate on tasks in this workspace.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600">
                User Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                disabled={addMemberMutation.isPending}
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="e.g. member1@example.com"
                className="w-full rounded-md border border-zinc-200 bg-white py-2 px-3 text-sm text-black placeholder:text-zinc-400 outline-none focus:border-black focus:ring-1 focus:ring-black disabled:opacity-50 transition-colors"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={addMemberMutation.isPending}
                onClick={() => setIsMemberModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={addMemberMutation.isPending}
              >
                Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation Dialog */}
      <Dialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <strong className="text-zinc-900">{memberToRemove?.user.name}</strong> (
              {memberToRemove?.user.email}) from this project workspace? They will lose access to all
              tasks in this project.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={removeMemberMutation.isPending}
              onClick={() => setMemberToRemove(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={removeMemberMutation.isPending}
              onClick={handleRemoveMember}
            >
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
