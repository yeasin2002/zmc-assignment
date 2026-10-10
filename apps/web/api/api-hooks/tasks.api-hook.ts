import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/axios';
import {
  tasksApi,
  type CreateTaskData,
  type TaskFilters,
  type UpdateTaskData,
} from '@/api/query-list/tasks.query';

export const TASK_KEYS = {
  all: () => ['tasks'] as const,
  projectList: (projectId: string, filters?: TaskFilters) =>
    ['tasks', 'project', projectId, filters] as const,
  detail: (id: string) => ['tasks', 'detail', id] as const,
};

// Reads (GET)
export const useProjectTasks = (projectId?: string, filters?: TaskFilters) => {
  return useQuery({
    queryKey: TASK_KEYS.projectList(projectId ?? 'unknown', filters),
    queryFn: () => tasksApi.getByProject(projectId!, filters),
    enabled: !!projectId,
    select: (response) => response.data,
  });
};

export const useTask = (id?: string) => {
  return useQuery({
    queryKey: TASK_KEYS.detail(id ?? 'unknown'),
    queryFn: () => tasksApi.getById(id!),
    enabled: !!id,
    select: (response) => response.data,
  });
};

// Writes (POST / PATCH / DELETE)
export const useCreateTask = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) => tasksApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to create task'));
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      tasksApi.update(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task updated successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to update task'));
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all() });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task deleted successfully');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to delete task'));
    },
  });
};
