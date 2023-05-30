import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { Server, Socket } from 'socket.io';
import { FriendService } from 'src/friend/friend.service';


@WebSocketGateway({ cors: true })
export class SocketsFriendsGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server;

	afterInit() {
		console.log('WebSocket Gateway initialized');
	  }

	  handleConnection(client: Socket) {
		// console.log('Client connected:', client.id);
	  }

	  handleDisconnect(client: Socket) {
		// console.log('Client disconnected:', client.id);
	}

	constructor(
		private readonly socketService: SocketsService,
        private readonly friendService: FriendService,) {}

        @SubscribeMessage('getFriend')
        async getFriendsByUserId(@ConnectedSocket() client: Socket) {
          const user = this.socketService.getUser(client.id);
          const friends = await this.friendService.getFriendsByUserId(user.id);
          return friends;
        }
      
        @SubscribeMessage('getFriendReq')
        async getFriendReq(@ConnectedSocket() client: Socket) {
          const user = this.socketService.getUser(client.id);
          return this.friendService.getFriendReq(user.id)
        }
      
        @SubscribeMessage('send')
        async sendFriendReq(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
          const user = this.socketService.getUser(client.id);
          const request = await this.friendService.createFriendRequest(user.id, +body.id)
          if (!request)
            return;
          const friendSocketId = this.socketService.findSocketById(+body.id)
          if (friendSocketId) {
            const friendSocket = this.server.sockets.sockets.get(friendSocketId)
            if (friendSocket) {
              friendSocket.emit('friendRequestNotification', { req: request });
            }
          }
        }
      
        @SubscribeMessage('acceptFriend')
        async acceptFriendReq(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
          const user = this.socketService.getUser(client.id);
          await this.friendService.acceptFriendRequest(+user.id, +body.id)
          const friendSocketId = this.socketService.findSocketById(+body.id)
          const friendFriend = await this.friendService.getFriendsByUserId(+body.id)
          const friendUser = await this.friendService.getFriendsByUserId(+user.id)
          const request = this.friendService.getFriendReq(user.id)
          client.emit('receiveFriend', { friends: friendUser })
          client.emit('receiveReq', { req: request })
          if (friendSocketId) {
            const friendSocket = this.server.sockets.sockets.get(friendSocketId)
            if (friendSocket) {
              friendSocket.emit('receiveFriend', { friends: friendFriend });
            }
          }
        }
      
        @SubscribeMessage('refuseFriend')
        async refuseFriendReq(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
          const user = this.socketService.getUser(client.id);
          await this.friendService.refuseFriendRequest(+user.id, +body.id)
          const request = this.friendService.getFriendReq(user.id)
          client.emit('receiveReq', { req: request })
        }
      
        @SubscribeMessage('deleteFriend')
        async deleteFriend(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
          const user = this.socketService.getUser(client.id);
          await this.friendService.deleteFriendById(+user.id, +body.id)
          const friendUser = await this.friendService.getFriendsByUserId(+user.id)
          client.emit('receiveFriend', { friends: friendUser })
          const friendFriend = await this.friendService.getFriendsByUserId(+body.id)
          const friendSocketId = this.socketService.findSocketById(+body.id)
          if (friendSocketId) {
            const friendSocket = this.server.sockets.sockets.get(friendSocketId)
            if (friendSocket) {
              friendSocket.emit('receiveFriend', { friends: friendFriend });
            }
          }
        }
      
        @SubscribeMessage('bloqueUser')
        async bloqueUser(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
          const user = this.socketService.getUser(client.id);
          await this.friendService.bloqueUserById(+user.id, +body.id)
          await this.friendService.refuseFriendRequest(+user.id, +body.id)
          const friendUser = await this.friendService.getFriendsByUserId(+user.id)
          client.emit('receiveFriend', { friends: friendUser })
          const request = this.friendService.getFriendReq(user.id)
          client.emit('receiveReq', { req: request })
        }
      
        @SubscribeMessage('bloqueFriend')
        async bloqueFriend(@ConnectedSocket() client: Socket, @MessageBody() body: { id: number }) {
          const user = this.socketService.getUser(client.id);
          await this.friendService.bloqueUserById(+user.id, +body.id)
          const friendUser = await this.friendService.getFriendsByUserId(+user.id)
          client.emit('receiveFriend', { friends: friendUser })
          const friendFriend = await this.friendService.getFriendsByUserId(+body.id)
          const friendSocketId = this.socketService.findSocketById(+body.id)
          if (friendSocketId) {
            const friendSocket = this.server.sockets.sockets.get(friendSocketId)
            if (friendSocket) {
              friendSocket.emit('receiveFriend', { friends: friendFriend });
            }
          }
        }
}