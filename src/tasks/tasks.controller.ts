import { Body, Controller, ForbiddenException, Get, NotFoundException, Param, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Get('')
    async listTasks(@Request() req) {
        if (!req.user) {
            throw new UnauthorizedException('No estás logueado.');
        }

        return this.tasksService.listTasks(req.user.id);
    }
    
    @Get('/:id')
    async getTask(@Param('id') id: string, @Request() req) {
        const task = await this.tasksService.getTask(id);
    
        // Si la tarea no existe, devolvemos un error.
        if (!task) {
            throw new NotFoundException('¡Tarea no encontrada!');
        }
    
        // Si el usuario logueado no es el dueño de la tarea, devolvemos un error.
        if (task.owner.id !== req.user.id) {
            throw new ForbiddenException('¡No tienes permiso para editar esta tarea!');
        }
    
        return task;
    }

    @Post('/edit')
    async editTask(@Body() body, @Request() req) {
        if (!req.user) {
            throw new UnauthorizedException('!Debes de loguearte y ser el propietario de esta tarea¡');
        }
        const task = await this.tasksService.getTask(body.id);

        // Si la tarea no existe, devolvemos un error.
        if (!task) {
            throw new NotFoundException('¡Tarea no encontrada!');
        }
    
        // Si el usuario logueado no es el dueño de la tarea, devolvemos un error.
        if (task.owner.id !== req.user.id) {
            throw new ForbiddenException('¡No tienes permiso para editar esta tarea!');
        }
        return this.tasksService.editTask(body);
    }

    @Post('/create')
    async createTask(@Body() body, @Request() req) {
        if (!req.user) {
            throw new UnauthorizedException('¡No estás autorizado para crear una tarea!');
        }

        return this.tasksService.createTask(body, req.user.id);
    }
}
