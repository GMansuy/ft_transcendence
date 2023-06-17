import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { Server, Socket } from 'socket.io';
import { BounceBallDto, movePaddleDto, gameModeDto} from './dto/game.dto';
import { Interval } from '@nestjs/schedule';
import { GameService } from './game.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { profile } from 'console';
import { connect } from 'http2';
import { session } from 'passport';

@WebSocketGateway({ cors: true })
export class SocketsGameGateway implements OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer()
	private server: Server;
	private interval: NodeJS.Timeout | undefined;
	private gameSessions: Map<(Socket<any> | undefined)[], GameService> = new Map();

	constructor(
		private readonly socketService: SocketsService,
		private readonly prismaService: PrismaService
		) {}

	afterInit() {
	}

	handleConnection(client: Socket) {
	}

	handleDisconnect(client: Socket) {
	}

	async updatePlayerWinLoose(client: (Socket<any>), won: boolean) {
		const token = client?.handshake.headers.cookie?.substring(14);
		if (token)
		{
			const user = await this.socketService.getUserWithToken(token);
			this.socketService.changeWin(+user.id, won);
		}
	}

	calculateNewElo(currentElo: number, opponentElo: number, win: boolean): number {
		let K: number;
	
		if (currentElo < 1000) {
			K = 160;
		} else if (currentElo < 2000) {
			K = 120;
		} else if (currentElo < 3000) {
			K = 80;
		} else if (currentElo < 4000) {
			K = 40;
		} else {
			K = 20;
		}
	
		const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
		const actualScore = win ? 1 : 0;
		return currentElo + K * (actualScore - expectedScore);
	}
	  

	async updatePlayerElo(client: Socket<any>, opponent: Socket<any>, won: boolean) {
		const token = client?.handshake.headers.cookie?.substring(14);
		const opponentToken = opponent?.handshake.headers.cookie?.substring(14);
		
		if (token && opponentToken) {
		  const user = await this.socketService.getUserWithToken(token);
		  const opp = await this.socketService.getUserWithToken(opponentToken);
	  
		  const newElo = this.calculateNewElo(user.elo, opp.elo, won);
		  this.socketService.updateElo(+user.id, newElo);
		}
	  }
	  
	  updatePrismaData(connectedClients: (Socket<any> | undefined)[], game_service: GameService): void{
		if (connectedClients[0] && connectedClients[1]) {
		  const won = game_service.getGameState().playerScore > game_service.getGameState().opponentScore;
		  this.updatePlayerWinLoose(connectedClients[0], won);
		  this.updatePlayerElo(connectedClients[0], connectedClients[1], won);
		  
		  this.updatePlayerWinLoose(connectedClients[1], !won);
		  this.updatePlayerElo(connectedClients[1], connectedClients[0], !won);
		}
	  }
	  

	startGameInterval(clients: (Socket<any> | undefined)[]): void {
		let game_service = this.getGameService(clients);
		let connectedClients = clients;
		if (!game_service){
			console.log("no active game session!")
			return;
		}
		const intervalDuration = 500 / game_service.getGameState().gameSpeed;

		this.interval = setInterval(() => {
		if (game_service?.getwinner() && connectedClients[1] && connectedClients[0])
		{
			this.updatePrismaData(connectedClients, game_service);
			connectedClients.forEach((client)=> {
				if (client)
				{
					client.emit('game-over', game_service?.getGameState());
					this.gameOver(client);
				}
			});
		}
		else if (connectedClients.length === 2  && !game_service?.getGameState().pause)
		{
			game_service?.bounceBall();
			connectedClients.forEach((client)=> {
				if (client)
					client.emit('updateBallPosition', game_service?.getGameState());
			});}
			game_service?.updateSpectators(game_service.getGameState());
		}, intervalDuration);
	}

	stopGameInterval(): void {
		if (this.interval) {
		  clearInterval(this.interval);
		  this.interval = undefined;
		}
	}

	getGameService(clients: (Socket<any> | undefined)[]): GameService | undefined {
		for (const [key, gameService] of this.gameSessions.entries()) {
		  if (
			(key[0] === clients[0] && key[1] === clients[1]) ||
			(key[0] === clients[1] && key[1] === clients[0])
		  ) {
			return gameService;
		  }
		}
		return undefined;
	}

	find_clients(client1: (Socket<any> | undefined), client2: (Socket<any> | undefined)): boolean{
		for (const key of this.gameSessions.keys()) {
			if ((key[0] === client1 && key[1] === client2) ||
			(key[0] === client2 && key[1] === client1))
				return true;
		}
		return false;
	}

	find_session(client1: (Socket<any> | undefined), client2: (Socket<any> | undefined)): boolean{

		if (!this.find_clients(client1, client2))
		{
			const game_service = new GameService;
			this.gameSessions.set([client1, client2], game_service);
			this.gameSessions.get([client1, client2])?.setnumofPlayers();
			return false;
		}
		return true;
	}

	deleteSession(clients: (Socket<any> | undefined)[]): boolean {
		for (const [key, game_serv] of this.gameSessions.entries()) {
		  if (
			(key[0] === clients[0] && key[1] === clients[1]) ||
			(key[0] === clients[1] && key[1] === clients[0])
		  ) {
			game_serv.spectatorGameEnded();
			this.gameSessions.delete(key);
			return true;
		  }
		}
		return false;
	  }

	async updatePlayerStatus(client: (Socket<any> | undefined), status: string) {
		const token = client?.handshake.headers.cookie?.substring(14);
		if (token)
		{
			const user = await this.socketService.getUserWithToken(token);
			this.socketService.changeState(+user.id, status)
		}
	}

	@SubscribeMessage('join-room')
	joinroom(@MessageBody() gameMode: gameModeDto, @ConnectedSocket() client: Socket): void{
		const opponent = this.socketService.findSocketById(+(gameMode.opponentid));
		if (opponent && (!this.find_session(client, this.server.sockets.sockets.get(opponent)))){
			let clients = [client, this.server.sockets.sockets.get(opponent)];
			let i = 0;
			this.getGameService(clients)?.setSpeed(gameMode.Mode);
			for (const client of clients) {
				if (client)
					client.emit('start', ++i);
				this.updatePlayerStatus(client, "is playing");
			}
			this.getGameService(clients)?.startGame();
			this.startGameInterval(clients);
		}
		else if (opponent && this.find_session(client, this.server.sockets.sockets.get(opponent))){
			console.log("session already exist");//for when the second player calls the session
		}
		else
			console.log("opponent doesnt exist");
	}

	@SubscribeMessage('game-over')
	gameOver(@ConnectedSocket() client: Socket): void{
		for (const connectedClients of this.gameSessions.keys()) {
		  if (connectedClients.includes(client)) {
			connectedClients.forEach((clients) => {
				clients?.emit("game-over");
				this.updatePlayerStatus(clients, "online");
			})
			this.getGameService(connectedClients)?.resetGame();
			this.stopGameInterval();
			this.deleteSession(connectedClients);
			break;
		  }
		}
	}

	@SubscribeMessage('join-as-spectator')
	joinAsSpectator(@MessageBody() playerId: number, @ConnectedSocket() client: Socket): void {
		let found = false;
		const towatch = this.socketService.findSocketById(+(playerId));
		if (towatch)
		{
			const sock_towatch = this.server.sockets.sockets.get(towatch);
			console.log("joining as spectator")
			for (const [connectedClients, game_serv] of this.gameSessions.entries()) {
				if (connectedClients.includes(sock_towatch)) {
					game_serv.addSpectator(client);
					found = true;
					break;
				}
			}
			if (!found)
				console.log("no active game: player id is ", playerId)
		}
		else
			console.log("nothing to watch player id is ", playerId)
	}

	@SubscribeMessage('player-left')
	playerleft(@ConnectedSocket() client: Socket): void{
		for (const connectedClients of this.gameSessions.keys()) {
			if (connectedClients.includes(client)) {
				const leavingplayerind = connectedClients.indexOf(client);
				const opponentIndex = leavingplayerind === 0 ? 1 : 0;
				const game_serv = this.getGameService(connectedClients)
				if (game_serv)
				{
					game_serv.getGameState().playerScore = leavingplayerind === 0 ? 0 : 10;
					game_serv.getGameState().opponentScore = leavingplayerind === 0 ? 10 : 0;
					this.updatePrismaData(connectedClients, game_serv)
					connectedClients[leavingplayerind]?.emit("player-left");
					connectedClients[opponentIndex]?.emit("game-over");
					this.updatePlayerStatus(connectedClients[leavingplayerind], "online");
					this.updatePlayerStatus(connectedClients[opponentIndex], "online");
					this.stopGameInterval();
					this.deleteSession(connectedClients);
				}
			  break;
			}
		  }
	}

	@SubscribeMessage('move-player')
	movePlayer(@MessageBody() movePaddleDto: movePaddleDto, @ConnectedSocket() client: Socket): void{
		for (const connectedClients of this.gameSessions.keys()) {
			if (connectedClients.includes(client)) {
				const game_serv = this.getGameService(connectedClients);
				if (game_serv)
				{
					if (movePaddleDto.playerID === 1)
						game_serv.movePlayer1(movePaddleDto.movedPlayer);
					else
						game_serv.movePlayer2(movePaddleDto.movedPlayer);
					connectedClients.forEach((client)=> {
						if (client)
							client.emit('move-paddles', game_serv.getGameState());
					});
				}
				break;
			}
		  }
	}

	@SubscribeMessage('spectator-left')
	spectatorLeft(@ConnectedSocket() client: Socket): void{
		for (const [key, gameService] of this.gameSessions.entries()) {
			if (gameService.lookupSpectator(client))
			{
				gameService.removeSpectator(client);
				break;
			}
		}
	}
}
