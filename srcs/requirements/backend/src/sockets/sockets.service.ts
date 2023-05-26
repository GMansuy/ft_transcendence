import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateRoomDto, MessageObj } from './entities/message.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { User, Message } from '@prisma/client';

@Injectable()
export class SocketsService {
  private clientToUser: { [clientId: string]: User } = {};

  constructor(private prisma: PrismaService) { }

  async getUserWithToken (access_token: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where : {
        access_token: access_token,
      },
    });
    return user;
  }

  identify(user: User, clientId: string) {
    this.clientToUser[clientId] = user;

    return Object.values(this.clientToUser);
  }

  getUser(clientId: string) {
    return this.clientToUser[clientId];
  }

  async createRoom(dto: CreateRoomDto, userId: number) {
    const room = await this.prisma.room.create({
      data : {
        name: dto.name,
        type: dto.type,
        password: dto.password, //DEVRAIT ETRE UN HASH
        owner: {connect: {id: userId}},
      }
    })
    return room;
  }
  findAllRooms() {
    const rooms = this.prisma.room.findMany();
    return rooms;
  }
  async getRoomByName(roomName: string) {
    const room = await this.prisma.room.findFirstOrThrow({
      where : {
        name: roomName,
      },
    });
    return room;
  }

  async addWhitelistUser(roomId: number, userId: number) {
    return this.prisma.room.update({
      where: { id: roomId },
      data: { whitelist: { connect: { id: userId } } },
    });
  }
  async searchWhiteList(roomId: number, userId: number) {
    const room = await this.prisma.room.findUniqueOrThrow({
      where : {id: roomId},
      include: { whitelist: true },
    });
    console.log('WHITELIST: ', room.whitelist);
    const isWhiteListed = room.whitelist.some((user) => user.id === userId);
    console.log(isWhiteListed);
    return isWhiteListed;
  }

  async createMessage(createMessageDto: CreateMessageDto, username: string) {
    const message = await this.prisma.message.create({
      data : {
        name: username,
        text: createMessageDto.text,
        room: {connect: {id:createMessageDto.room}},
      }
    })
    return message;
  }

  async getMessagesByRoom(roomId: number): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });
  }

}
