import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as fs from 'fs';

interface AuthenticatedUser {
	id: number;
	username: string;
}

interface MulterFile {
	originalname: string;
	encoding: string;
	mimetype: string;
	buffer: Buffer;
	size: number;
  }

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService,
				private jwtService: JwtService) {}

	async getUserFromToken(token : string) {
		//console.log("Passage dans getProfile()")
		try {
            const decoded = this.jwtService.verify(token);
            if (!decoded) {
                return null;
            }

            const user = await this.prismaService.user.findUnique({
                where: {
                    id: decoded.userId,
                },
            });

            if (!user) {
                return null;
            }

            return {
                id: user.id,
                username: user.username,
                elo: user.elo,
            };
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async updateGameLogin(id: number, gameLogin: string) {
        console.log("test dans update username", id, gameLogin);
    
        const existingUser = await this.prismaService.user.findFirst({
            where: { id: id }
        });
        if(!existingUser){
            throw new HttpException('No user found with given id', 404);
        }
        if(existingUser.gameLogin === gameLogin){
            throw new HttpException('New username is same as the old username', 400);
        }
        if (gameLogin.length < 5 || gameLogin.length > 30) {
            throw new HttpException('Game login must have between 5 and 30 characters', 400);
        }
        const validCharacters = /^[a-zA-Z0-9_-]+$/
        if (!validCharacters.test(gameLogin)) {
            throw new HttpException('Game login can only contain alphanumeric characters, hyphens and underscores', 400);
        }
        const usernameTaken = await this.prismaService.user.findFirst({
            where: { gameLogin: gameLogin }
        });
        if(usernameTaken){
            throw new HttpException('Game login is already taken by another user', 400);
        }
        return this.prismaService.user.update({
            where: {id: id},
            data: { gameLogin: gameLogin},
        })
    }

    async updateAvatar(user: AuthenticatedUser, avatar: MulterFile) {
        
        // create unique id for avatar
        const filename = `${user.id}_${Date.now()}_${avatar.originalname}`;
        const filepath = `./avatars/${filename}`;

        await fs.promises.writeFile(filepath, avatar.buffer);
        const avatarUrl = `http://localhost:5000/avatars/${filename}`;
        const updatedUser = await this.prismaService.user.update({
          where: { id: user.id },
          data: { avatar: avatarUrl },
        });
    
        return updatedUser;
      }

}
