import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BuilderModule } from './builder/builder.module';
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: ".",
      verboseMemoryLeak: true
    }),
    BuilderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
