import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly tasksRepository: Repository<Task>,
    ) { }

    async listTasks(userId: string) {
        const tasks = await this.tasksRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect('task.owner', 'owner')
            .where('owner.id = :userId', { userId })
            .getMany();

        // Si no se encuentran tareas, devolvemos un mensaje informativo en lugar de un error.
        if (tasks.length === 0) {
            return {
                message: 'Aún no se ha creado ninguna tarea.',
                tasks: [],
            };
        }

        return tasks;
    }

    async getTask(id: string) {
        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect("task.owner", "owner")
            .where("task.id = :id", { id })
            .getOne();

        if (!task) {
            throw new NotFoundException(`Tarea con ID ${id} no encontrada.`);
        }

        return task;
    }

    async editTask(id: string, body: any) {
        const task = await this.getTask(id);
        if (!task) {
            throw new NotFoundException('¡Tarea no encontrada!');
        }

        await this.tasksRepository.update(id, body);

        const editedTask = await this.getTask(id);

        return editedTask;
    }

    // Función para poder crear tareas y así poder debuguear sobre estas
    async createTask(data: any, userId: string): Promise<Task> {
        const task = this.tasksRepository.create({
            title: data.title,
            description: data.description,
            done: false,
            dueDate: data.dueDate,
            owner: { id: userId },
        });

        return this.tasksRepository.save(task);
    }
}
