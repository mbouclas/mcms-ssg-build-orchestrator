import { Module } from '@nestjs/common';
import { BuilderController } from './builder.controller';
import { BuilderService } from "./services/builder.service";
import { ExecutorService } from "./services/executor.service";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [
    HttpModule,
  ],
  controllers: [BuilderController],
  providers: [
    BuilderService,
    ExecutorService,
  ],
})
export class BuilderModule {}
