export interface ISiteBuildConfiguration {
  path: string;
  command: string;
}

export interface IWebhookConfiguration {
  success: string;
  fail: string;
  progress: string;
}

export class SiteModel {
  id: string;
  url: string;
  webhooks: IWebhookConfiguration;
  build: ISiteBuildConfiguration;
}

export class SiteModelFailedBuild extends SiteModel {
  error: string;
}
