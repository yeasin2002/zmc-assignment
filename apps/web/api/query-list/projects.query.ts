import { axiosClient } from '@/lib/axios';
import type { ProjectRole } from '@/types/api';

export type { ProjectRole };

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  joinedAt: string;
  updatedAt: string;
  user: ProjectUser;
}

export interface ProjectListItem {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: ProjectUser;
  currentUserRole: ProjectRole;
  _count: {
    members: number;
    tasks: number;
  };
}

export interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: ProjectUser;
  members: ProjectMember[];
  currentUserRole: ProjectRole;
  _count: {
    members: number;
    tasks: number;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}

export interface AddMemberData {
  email: string;
}

export interface ActionMessageResponse {
  message: string;
}

export const projectsApi = {
  getAll: () =>
    axiosClient.get<ProjectListItem[]>('/projects'),

  getById: (id: string) =>
    axiosClient.get<ProjectDetail>(`/projects/${id}`),

  create: (data: CreateProjectData) =>
    axiosClient.post<ProjectDetail>('/projects', data),

  update: (id: string, data: UpdateProjectData) =>
    axiosClient.patch<ProjectDetail>(`/projects/${id}`, data),

  delete: (id: string) =>
    axiosClient.delete<ActionMessageResponse>(`/projects/${id}`),

  getMembers: (projectId: string) =>
    axiosClient.get<ProjectMember[]>(`/projects/${projectId}/members`),

  addMember: (projectId: string, data: AddMemberData) =>
    axiosClient.post<ProjectMember>(`/projects/${projectId}/members`, data),

  removeMember: (projectId: string, userId: string) =>
    axiosClient.delete<ActionMessageResponse>(`/projects/${projectId}/members/${userId}`),
};
