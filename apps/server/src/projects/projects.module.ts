import { Module } from '@nestjs/common';
import { ProjectMemberGuard } from './guards/project-member.guard.js';
import { ProjectOwnerGuard } from './guards/project-owner.guard.js';
import { ProjectsController } from './projects.controller.js';
import { ProjectsService } from './projects.service.js';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectMemberGuard, ProjectOwnerGuard],
  exports: [ProjectsService, ProjectMemberGuard, ProjectOwnerGuard],
})
export class ProjectsModule {}
