import { Module } from '@nestjs/common';
import { SocketsService } from './sockets.service';
import { SocketsGateway } from './sockets.gateway';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'process';
import { FriendController } from 'src/friend/friend.controler';
import { FriendModule } from 'src/friend/friend.module';
import { FriendService } from 'src/friend/friend.service';
import { SocketsChatGateway } from './sockets-message.gateway';
import { MessageService } from './message.service';

@Module({
  imports: [JwtModule.register({ secret: 'transcendence_secret' }), FriendModule],
  providers: [SocketsGateway, SocketsChatGateway,
     SocketsService, FriendService, MessageService]
})
export class SocketsModule { }
