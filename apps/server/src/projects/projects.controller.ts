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
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectMemberGuard } from './guards/project-member.guard.js';
import { ProjectOwnerGuard } from './guards/project-owner.guard.js';
import { ProjectsOpenApi } from './projects.openapi.js';
import { ProjectsService } from './projects.service.js';

@ProjectsOpenApi.controller()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ProjectsOpenApi.listProjects()
  async listProjects(@CurrentUser('id') userId: string) {
    return this.projectsService.listForUser(userId);
  }

  @Post()
  @ProjectsOpenApi.createProject()
  async createProject(@CurrentUser('id') userId: string, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(userId, dto);
  }

  @Get(':id')
  @UseGuards(ProjectMemberGuard)
  @ProjectsOpenApi.getProject()
  async getProject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.getProjectById(id, userId);
  }

  @Patch(':id')
  @UseGuards(ProjectOwnerGuard)
  @ProjectsOpenApi.updateProject()
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(ProjectOwnerGuard)
  @ProjectsOpenApi.deleteProject()
  async deleteProject(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.delete(id, userId);
  }

  @Get(':id/members')
  @UseGuards(ProjectMemberGuard)
  @ProjectsOpenApi.getMembers()
  async getMembers(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.projectsService.getMembers(id, userId);
  }

  @Post(':id/members')
  @UseGuards(ProjectOwnerGuard)
  @ProjectsOpenApi.addMember()
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.projectsService.addMember(id, userId, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(ProjectOwnerGuard)
  @ProjectsOpenApi.removeMember()
  async removeMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('userId', ParseUUIDPipe) memberUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.projectsService.removeMember(id, userId, memberUserId);
  }
}
