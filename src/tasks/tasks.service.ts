import { Injectable } from '@nestjs/common';
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

        return tasks;
    }

    async getTask(id: string) {
        const task = await this.tasksRepository
            .createQueryBuilder('task')
            .leftJoinAndSelect("task.owner", "owner")
            .where("task.id = :id", { id })
            .getOne();

        return task;
    }

    async editTask(body: any) {
        await this.tasksRepository.update(body.id, body);

        const editedTask = await this.getTask(body.id);

        return editedTask;
    }

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
