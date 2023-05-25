import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FriendModule } from './friend/friend.module';
import { HistoryModule } from './history/history.module';
import { SocketsModule } from './sockets/sockets.module';
import { IntraModule } from './intra/intra.module';
import { GameModule } from './game/game.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
			AuthModule,
			UserModule,
			PrismaModule,
			FriendModule,
			HistoryModule,
			SocketsModule,
			IntraModule,
			GameModule,
		]
})
export class AppModule {}
