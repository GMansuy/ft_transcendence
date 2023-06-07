import { Body, Controller, Get, NotFoundException, Post, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';

interface AuthenticatedUser {
	id: number;
	username: string;
	avatar: string;
}

interface AuthenticatedRequest extends Request {
	user: AuthenticatedUser;
}

interface MulterFile {
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
  }

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get('profile')
	async getProfile(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		return (req.user);
	}

	@Get('logout')
	logout(@Res() res: Response) {
	  res.clearCookie('Authorization');
	  return res.status(200).send({ message: 'User logged out' });
	}

	@Put('update-gameLogin')
	async updategGameLogin(@Req() req: AuthenticatedRequest, @Body('gameLogin') gameLogin: string) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		console.log({ user: req.user }) 
		const id = req.user.id;
		return this.userService.updateGameLogin(id, gameLogin);
	}

	@Post('update-avatar')
	@UseInterceptors(FileInterceptor('avatar'))
	async updateAvatar(@Req() req: AuthenticatedRequest, @UploadedFile() avatar: MulterFile) {
	  return await this.userService.updateAvatar(req.user, avatar);
	}

	@Put('set-avatar-selected')
	async setAvatarSelected(@Req() req: AuthenticatedRequest) {
		if (!req.user) {
			throw new NotFoundException('User not found');
		}
		const id = req.user.id;
		return this.userService.setAvatarSelected(id);
	}

	@Put('set-default-avatar')
	async setDefaultAvatar(@Req() req: AuthenticatedRequest) {
	  if (!req.user) {
		throw new NotFoundException('User not found');
	  }
	  const id = req.user.id;
	  await this.userService.setDefaultAvatar(id);
	  return { message: 'Default avatar set successfully.' };
	}
	
}
