import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import {Response} from 'express';
import { BuildPayloadDto } from "./models/build-payload.dto";
import { BuilderService } from "./services/builder.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ExecutorService } from "./services/executor.service";

@Controller('builder')
export class BuilderController {
  constructor(
    private eventEmitter: EventEmitter2,
  ) {
  }

  @Post('build')
  async build(@Body() payload: BuildPayloadDto, @Res() res: Response) {
    const s = new BuilderService();
    await s.loadSiteList();
    const site = s.findById(payload.id);
    if (!site) {
      return res.status(401).send({success: false, reason: 'Invalid Site'});
    }

    this.eventEmitter.emit(ExecutorService.TriggerBuildEventName, { buildDetails: site, payload });

    return res.send({success: true});
  }

  @Get('test')
  async test() {
    const s = new BuilderService();
    await s.loadSiteList();
    this.eventEmitter.emit(ExecutorService.BuildSuccessEventName, { buildDetails: s.sites[0], payload: {
      jobId: 42,
        token: 'nsS5yB43GuhN2iv7ULPxOulHq3xEfK',
        id: 'ecosystem'
      } });
  }
}
