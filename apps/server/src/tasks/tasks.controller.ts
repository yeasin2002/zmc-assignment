import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateTaskDto } from './dto/create-task.dto.js';
import { TaskQueryDto } from './dto/task-query.dto.js';
import { UpdateTaskDto } from './dto/update-task.dto.js';
import { TasksOpenApi } from './tasks.openapi.js';
import { TasksService } from './tasks.service.js';

@TasksOpenApi.controller()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('projects/:id/tasks')
  @TasksOpenApi.listProjectTasks()
  async listProjectTasks(
    @Param('id', ParseUUIDPipe) projectId: string,
    @CurrentUser('id') userId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.listProjectTasks(projectId, userId, query);
  }

  @Post('projects/:id/tasks')
  @TasksOpenApi.createTask()
  async createTask(
    @Param('id', ParseUUIDPipe) projectId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(projectId, userId, dto);
  }

  @Get('tasks/:id')
  @TasksOpenApi.getTask()
  async getTask(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.tasksService.getTaskById(id, userId);
  }

  @Patch('tasks/:id')
  @TasksOpenApi.updateTask()
  async updateTask(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(id, userId, dto);
  }

  @Delete('tasks/:id')
  @TasksOpenApi.deleteTask()
  async deleteTask(@Param('id', ParseUUIDPipe) id: string, @CurrentUser('id') userId: string) {
    return this.tasksService.deleteTask(id, userId);
  }
}
