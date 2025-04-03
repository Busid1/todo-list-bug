import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { jwtConstants } from './constants';
import { IS_PUBLIC_KEY } from './is-public.decorator';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException("TOKEN NO VALIDO");
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: jwtConstants.secret,
            });

            request['user'] = payload;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('El token ha expirado, por favor inicia sesión nuevamente');
            } else if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('El token es inválido');
            } else {
                throw new UnauthorizedException('Error en la autenticación');
            }
        }

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
