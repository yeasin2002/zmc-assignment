import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/axios';
import {
  projectsApi,
  type AddMemberData,
  type CreateProjectData,
  type UpdateProjectData,
} from '@/api/query-list/projects.query';

export const PROJECT_KEYS = {
  all: () => ['projects'] as const,
  lists: () => ['projects', 'list'] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  members: (id: string) => ['projects', 'members', id] as const,
};

// Reads (GET)
export const useProjects = () => {
  return useQuery({
    queryKey: PROJECT_KEYS.lists(),
    queryFn: () => projectsApi.getAll(),
    select: (response) => response.data,
  });
};

export const useProject = (id?: string) => {
  return useQuery({
    queryKey: PROJECT_KEYS.detail(id ?? 'unknown'),
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

export const useProjectMembers = (projectId?: string) => {
  return useQuery({
    queryKey: PROJECT_KEYS.members(projectId ?? 'unknown'),
    queryFn: () => projectsApi.getMembers(projectId!),
    enabled: !!projectId,
    select: (response) => response.data,
  });
};

// Writes (POST / PATCH / DELETE)
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all() });
      toast.success('Project created successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create project'));
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      projectsApi.update(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all() });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(variables.id) });
      toast.success('Project updated successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update project'));
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.all() });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete project'));
    },
  });
};

export const useAddProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddMemberData) => projectsApi.addMember(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.members(projectId) });
      toast.success('Member added successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to add member'));
    },
  });
};

export const useRemoveProjectMember = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: PROJECT_KEYS.members(projectId) });
      toast.success('Member removed successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to remove member'));
    },
  });
};
