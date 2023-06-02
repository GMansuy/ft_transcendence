import { Body, Controller, Get, NotFoundException, Param, Put, Req, Res, UseGuards, Delete } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { get } from 'http';

interface AuthenticatedUser {
	id: number;
	username: string;
}

interface AuthenticatedRequest extends Request {
	user: AuthenticatedUser;
}

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) { }

	@Get('profile')
	async getProfile(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		// console.log("passage dans /users/profile : ", { user: req.user })
		return (req.user);
	}

	@Get('leaderboard')
	async getAll(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		return this.userService.getAllUsers();
	}

	@Get('logout')
	logout(@Res() res: Response) {
		res.clearCookie('Authorization');
		return res.status(200).send({ message: 'User logged out' });
	}

	@Put('update-username')
	async updateUsername(@Req() req: AuthenticatedRequest, @Body('newUsername') newUsername: string) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		// console.log({ user: req.user })
		const id = req.user.id;
		return this.userService.updateUsername(id, newUsername);
	}

	@Get('blockUser')
	async getBlockUser(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		return this.userService.getBlock(+req.user.id)
	}

	@Delete('deleteBlock/:blockId')
	async RmBlock(@Param('blockId') id: number) {
		console.log('aled')
		await this.userService.deleteBlock(+id)
	}
}
