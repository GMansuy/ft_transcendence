import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';

// si on met un controller (), il catch la root /
// Si on met une methode vide, elle catch la route du controller

@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('')
	async getAll() {
		const users = await this.userService.getUsers();
		console.log(users);
		return users;
	}

	@UseGuards(JwtGuard) // cette route est protegee par le guard de JwtStrategy
	@Get('profile')
	getProfile(@Req() req: Request) {
		console.log({ user: req.user })
		return (req.user);
	}
}

/* 
 Un guard se met a l'endpoint et permet ou non l'execution de cet endpoint.
 Ici le guard va check la strategy et si elle est correcte, il autorise la route
 On peut utiliser un guard au niveau global du module ou par route. on veut bloquer
 la route profile si on a pas le token
 strategy de passport-jwt dispose deja d'un guard
*/