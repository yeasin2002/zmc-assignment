import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectMemberGuard } from './guards/project-member.guard.js';
import { ProjectOwnerGuard } from './guards/project-owner.guard.js';
import { ProjectsService } from './projects.service.js';

@ApiTags('Projects')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({
    summary: 'List all projects the authenticated user belongs to or owns',
  })
  @ApiResponse({ status: 200, description: 'List of projects retrieved' })
  async listProjects(@CurrentUser('id') userId: string) {
    return this.projectsService.listForUser(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new project (caller becomes owner)' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async createProject(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(userId, dto);
  }

  @Get(':id')
  @UseGuards(ProjectMemberGuard)
  @ApiOperation({ summary: 'Get details of a specific project (members only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project details retrieved' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user is not a member of this project',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.getProjectById(id, userId);
  }

  @Patch(':id')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Update project details (owner only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project updated successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only the project owner can update details',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({ summary: 'Delete a project and its tasks (owner only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project deleted successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only the project owner can delete',
  })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async deleteProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.delete(id, userId);
  }

  @Get(':id/members')
  @UseGuards(ProjectMemberGuard)
  @ApiOperation({ summary: 'List all members of a project (members only)' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project members retrieved' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a project member' })
  @ApiResponse({ status: 404, description: 'Project not found' })
  async getMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.getMembers(id, userId);
  }

  @Post(':id/members')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({
    summary: 'Add an existing registered user as a project member (owner only)',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owner can add members',
  })
  @ApiResponse({ status: 404, description: 'User or project not found' })
  @ApiResponse({
    status: 409,
    description: 'User is already a member of this project',
  })
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.projectsService.addMember(id, userId, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(ProjectOwnerGuard)
  @ApiOperation({
    summary: 'Remove a member from the project (owner only)',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiParam({ name: 'userId', description: 'User UUID to remove' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - cannot remove project owner',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only owner can remove members',
  })
  @ApiResponse({ status: 404, description: 'Member or project not found' })
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) memberUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.removeMember(id, userId, memberUserId);
  }
}
