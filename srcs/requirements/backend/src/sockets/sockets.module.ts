import { Module } from '@nestjs/common';
import { SocketsService } from './sockets.service';
import { SocketsGateway } from './sockets.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'process';
import { FriendController } from 'src/friend/friend.controler';
import { FriendModule } from 'src/friend/friend.module';
import { FriendService } from 'src/friend/friend.service';
import { SocketsChatGateway } from './sockets-message.gateway';
import { MessageService } from './message.service';
import { SocketsFriendsGateway } from './sockets-friends.gateway';
import { SocketsGameGateway } from './sockets-game.gateway';
import { GameService } from './game.service';
import { SocketsQueueGateway } from './sockets-queue.gateway';
import { QueueService } from './queue.service';

@Module({
  imports: [ScheduleModule.forRoot(), JwtModule.register({ secret: 'transcendence_secret' }), FriendModule],//shima added schedule module for the interval to run
  providers: [SocketsGateway, SocketsChatGateway, SocketsFriendsGateway, SocketsGameGateway, SocketsQueueGateway,
     SocketsService, FriendService, MessageService, GameService, QueueService]
})
export class SocketsModule { }
