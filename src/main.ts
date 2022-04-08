import { ValidationPipe } from "@nestjs/common";

require('dotenv').config();
import { createRedisClient } from "./app.providers";
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import * as compression from 'compression';
const helmet = require("helmet");
const RedisStore = require('connect-redis')(session);
export let app: NestExpressApplication;

async function bootstrap() {
  const tokenExpiry  = (process.env.OAUTH_TOKEN_EXPIRY) ? parseInt(process.env.OAUTH_TOKEN_EXPIRY) : 60*60*23;
  app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
    cors: true
  });
  app.use(
    session({
      store: new RedisStore({client: createRedisClient(), ttl: tokenExpiry}),
      saveUninitialized: false,
      secret: 'keyboard cat',
      cookie: {
        secure: false,
        maxAge: tokenExpiry * 1000, //Needs to be in milliseconds
        httpOnly: false,
      },
      name: 'app.sess.id',
      rolling: true,
      resave: true,
    }),
  );
  app.use(cookieParser());
  app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));
  app.use(compression());
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
