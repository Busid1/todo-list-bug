import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Repository } from 'typeorm';

describe('TasksService', () => {
    let service: TasksService;
    let tasksRepository: Repository<Task>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: getRepositoryToken(Task),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        tasksRepository = module.get<Repository<Task>>(
            getRepositoryToken(Task),
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('listTasks', () => {
        it('should return an array of tasks for the given user', async () => {
            const userId = '1';
            const tasks = [
                { id: '1', title: 'Task 1', owner: { id: '1' } },
                { id: '2', title: 'Task 2', owner: { id: '1' } },
            ];

            jest.spyOn(tasksRepository, 'find').mockResolvedValue(tasks as any);

            const result = await service.listTasks(userId);
            expect(result).toEqual(tasks);
        });

        it('should return an empty array if no tasks are found for the given user', async () => {
            const userId = '1';
            const tasks = [];

            jest.spyOn(tasksRepository, 'find').mockResolvedValue(tasks as any);

            const result = await service.listTasks(userId);
            expect(result).toEqual(tasks);
        });
    });
});
