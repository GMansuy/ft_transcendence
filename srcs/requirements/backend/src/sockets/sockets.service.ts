import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateRoomDto, MessageObj } from './entities/message.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Message } from '@prisma/client';

@Injectable()
export class SocketsService {
  private clientToUser: { [clientId: string]: User } = {};

  constructor(private prisma: PrismaService) { }

  async getUserWithToken(access_token: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: {
        access_token: access_token,
      },
      include: { friend: true }
    });
    return user;
  }

  identify(user: User, clientId: string) {
    this.clientToUser[clientId] = user;

    return Object.values(this.clientToUser);
  }

  supClient(id: string) {
    delete this.clientToUser[id];
  }

  findSocketById(id: number) {
    const clientId = Object.keys(this.clientToUser).find(
      (key) => this.clientToUser[key].id === id
    );
    // console.log('CLIENTID:',  id);
    // console.log( this.clientToUser);
    return clientId;
  }

  getUser(clientId: string) {
    return this.clientToUser[clientId];
  }

  async changeState(userId: number, newState: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { state: newState }
    })
  }


  async changeWin(userId: number, Win: boolean) {
    // console.log("changing win to: ", numWin)
    if (Win)
    {
      await this.prisma.user.update({
        where: { id: userId },
        data: { win: {increment: 1} }
      })
    }
    else
    {
      await this.prisma.user.update({
        where: { id: userId },
        data: { loose: {increment: 1} }
      })
    }
  }

  async updateElo(userId: number, newElo: number) {
    await this.prisma.user.update({
        where: { id: userId },
        data: { elo: Math.round(newElo) },
    });
  }

  
}
