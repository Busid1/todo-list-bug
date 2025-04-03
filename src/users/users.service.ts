import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt'; // Importamos bcrypt para hashear las contraseñas

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async create(body: any) {
        // Verificamos si ya existe un usuario con el mismo email
        const existingUser = await this.usersRepository.findOneBy({
            email: body.email,
        });

        // Si ya existe ese usuario, devolvemos un error
        if (existingUser) {
            throw new ConflictException('El usuario con ese correo electrónico ya existe.');
        }

        const user = new User();
        user.email = body.email;
        // Hasheamos la contraseña antes de guardarla
        user.pass = await bcrypt.hash(body.password, 10);
        user.fullname = body.fullname;

        await this.usersRepository.save(user);

        return user;
    }

    async findOne(email: string) {
        const user = await this.usersRepository.findOneBy({
            email,
        });

        return user;
    }
}
