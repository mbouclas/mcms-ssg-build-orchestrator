import { Injectable } from "@nestjs/common";
import { promises as fsPromises } from 'fs';
import {resolve, join} from 'path';
import { SiteModel } from "../models/site.model";
import { ExecutorService } from "./executor.service";

@Injectable()
export class BuilderService {
  sites: SiteModel[] = [];

  async loadSiteList() {
    const buffer = await fsPromises.readFile(resolve(join('./', `sites.${process.env.ENV}.json`)));
    this.sites = JSON.parse(buffer.toString());

    return this;
  }

  findById(id: string) {
    return this.sites.filter(site => site.id === id)[0];
  }

}
