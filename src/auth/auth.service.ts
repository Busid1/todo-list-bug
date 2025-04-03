import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Importamos bcrypt para encriptar contraseñas

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly tokenExpiration = '1h'; // Definimos la expiración del token en una constante

    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signIn(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);

        if (!user) {
            this.logger.log(`User with email ${email} not found`);
            throw new UnauthorizedException();
        }
        
        const isPasswordValid = await bcrypt.compare(pass, user.pass); // Comparamos la contraseña encriptada con la contraseña proporcionada

        if (!isPasswordValid) {
            this.logger.warn(`Intento de inicio de sesión fallido para email: ${email}`);
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { id: user.id, email: user.email };

        const token = await this.jwtService.signAsync(payload, {
            expiresIn: this.tokenExpiration,
        });

        return { access_token: token };
    }
}
