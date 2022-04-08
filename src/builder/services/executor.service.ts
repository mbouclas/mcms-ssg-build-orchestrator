import { Injectable } from "@nestjs/common";
import {spawn} from 'child_process';
import { SiteModel, SiteModelFailedBuild } from "../models/site.model";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { BuildPayloadDto } from "../models/build-payload.dto";

@Injectable()
export class ExecutorService {
  public static readonly TriggerBuildEventName = 'build.start';
  public static readonly BuildFailedEventName = 'build.failed';
  public static readonly BuildSuccessEventName = 'build.success';
  public static readonly BuildProgressEventName = 'build.progress';

  constructor(
    private eventEmitter: EventEmitter2,
    private httpService: HttpService,
  ) {
  }

  @OnEvent(ExecutorService.BuildProgressEventName)
  async onBuildProgressUpdate(data: { buildDetails: SiteModel, payload: BuildPayloadDto, output: string }) {
    try {
      const res$ = await this.httpService.post(`${data.buildDetails.url}${data.buildDetails.webhooks.progress}`, {
        buildDetails: data.buildDetails, payload: data.payload, output: data.output
      });

      const res = await lastValueFrom(res$);
    }
    catch (e) {
      console.log('Progress Error',e);
    }

  }

  @OnEvent(ExecutorService.BuildSuccessEventName)
  async onBuildSuccess(data: { buildDetails: SiteModel, payload: BuildPayloadDto, output: string }) {
    try {
      const res$ = await this.httpService.post(`${data.buildDetails.url}${data.buildDetails.webhooks.success}`, data);
      const res = await lastValueFrom(res$);
    }
    catch (e) {
      console.log('Error on success',e);
    }

  }

  @OnEvent(ExecutorService.BuildFailedEventName)
  onBuildFailed(buildDetails: SiteModelFailedBuild) {
   console.log({id: buildDetails.id, error: buildDetails.error});
  }

  @OnEvent(ExecutorService.TriggerBuildEventName)
  async onTriggerBuild(data: {buildDetails: SiteModel, payload: BuildPayloadDto}) {
    try {
      const res = await this.execute(data.buildDetails, data.payload);
      this.eventEmitter.emit(ExecutorService.BuildSuccessEventName, res);
    }
    catch (e) {
      console.log('Error on Trigger',e.message);
      this.eventEmitter.emit(ExecutorService.BuildFailedEventName, e.message);
    }
  }

  async execute(buildDetails: SiteModel, payload: BuildPayloadDto) {
    return new Promise((resolve, reject) => {
      const currentDir = process.cwd();
      process.chdir(buildDetails.build.path);
      const parts = buildDetails.build.command.split(' ');
      const cm = parts[0];
      const errorMessage = [];
      const output = [];
      parts.shift();

      const command = spawn(cm, parts);

      command.stdout.on("data", data => {
        output.push(data.toString());
        this.eventEmitter.emit(ExecutorService.BuildProgressEventName, {...{ buildDetails }, ...{ payload }, ...{output: data.toString()}});
      });


      command.stderr.on("data", data => {
        errorMessage.push(data);
        // console.log(`stderr: ${data}`);
      });

      command.on('error', (error) => {
        // console.log(`error: ${error.message}`);
        reject(error.message);
      });

      command.on("close", code => {
        // console.log(`child process exited with code ${code}`);
        process.chdir(currentDir);

        if (code ===0) {
          return resolve({ ...{ buildDetails }, ...{payload}, ...{output: output.join('\n')} });
        }

        reject({...buildDetails, ...{error: errorMessage.join('\n')}});
      });

    });
  }
}
