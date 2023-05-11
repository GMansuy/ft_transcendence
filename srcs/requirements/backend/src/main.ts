import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';

class CustomSocketIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);

    server.use((socket: any, next: any) => {
      // Add your CORS logic here
      const allowedOrigins = ['http://localhost:3000'];
      const origin = socket.handshake.headers.origin;
      if (allowedOrigins.includes(origin)) {
        // Allow connections from the specified origin
        return next();
      }
      // Block connections from other origins
      return next(new Error('Not allowed by CORS'));
    });

    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // protect against data not set in the DTO

  // Attach the Socket.IO adapter
  app.useWebSocketAdapter(new CustomSocketIoAdapter(app));

  await app.listen(5000);
}

bootstrap();
