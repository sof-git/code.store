import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule, MoviesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
