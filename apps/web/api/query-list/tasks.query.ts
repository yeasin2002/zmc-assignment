import { axiosClient } from '@/lib/axios';
import type { PaginatedResponse, TaskPriority, TaskStatus } from '@/types/api';

export type { TaskPriority, TaskStatus };

export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: TaskAssignee | null;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  sortBy?: 'dueDate' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface ActionMessageResponse {
  message: string;
}

function buildTaskQueryParams(filters?: TaskFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.priority) params.set('priority', filters.priority);
  if (filters.assigneeId) params.set('assigneeId', filters.assigneeId);
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.order) params.set('order', filters.order);
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const tasksApi = {
  getByProject: (projectId: string, filters?: TaskFilters) =>
    axiosClient.get<PaginatedResponse<Task>>(`/projects/${projectId}/tasks${buildTaskQueryParams(filters)}`),

  getById: (id: string) =>
    axiosClient.get<Task>(`/tasks/${id}`),

  create: (projectId: string, data: CreateTaskData) =>
    axiosClient.post<Task>(`/projects/${projectId}/tasks`, data),

  update: (id: string, data: UpdateTaskData) =>
    axiosClient.patch<Task>(`/tasks/${id}`, data),

  delete: (id: string) =>
    axiosClient.delete<ActionMessageResponse>(`/tasks/${id}`),
};
