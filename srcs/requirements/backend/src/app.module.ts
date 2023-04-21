import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { FriendModule } from './friend/friend.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}),
			AuthModule,
			UserModule,
			PrismaModule,
			FriendModule],
})
export class AppModule {}
