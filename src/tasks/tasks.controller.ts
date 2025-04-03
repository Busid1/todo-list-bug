import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get('')
    async listTasks(@Request() req) {
        return this.tasksService.listTasks(req.user.id);
    }

    @Get('/:id')
    async getTask(@Param('id') id: string, @Request() req) {
        const task = await this.tasksService.getTask(id);

        if (!task) {
            throw new NotFoundException('¡Tarea no encontrada!');
        }

        if (task.owner.id !== req.user.id) {
            throw new ForbiddenException('¡No tienes permiso para editar esta tarea!');
        }

        return task;
    }

    @Post('/edit/:id')
    async editTask(@Param('id') id: string, @Body() body, @Request() req) {
        const task = await this.tasksService.getTask(id);

        if (!task) {
            throw new NotFoundException('¡Tarea no encontrada!');
        }

        if (task.owner.id !== req.user.id) {
            throw new ForbiddenException('¡No tienes permiso para editar esta tarea!');
        }

        return this.tasksService.editTask(id, body);
    }

    // Metodo de crear tareas implementado para debuguear
    @Post('/create')
    async createTask(@Body() body, @Request() req) {
        return this.tasksService.createTask(body, req.user.id);
    }
}
