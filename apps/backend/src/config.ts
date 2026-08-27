import * as dotenv from 'dotenv';
import { ConfigModule} from '@nestjs/config';
import { join } from 'path';

dotenv.config();

export const databaseConfig = {
  host: process.env.MYSQL_HOST ,
  port: Number(process.env.MYSQL_PORT) ,
  rootPassword: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

export const ConfigModuleSetup = ConfigModule.forRoot({
  isGlobal: true, 
  envFilePath: join(__dirname, '../.env'),
  load: [() => ({ database: databaseConfig })],
});

export const FirebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
}

export type DatabaseConfig = typeof databaseConfig;
export type FirebaseConfig = typeof FirebaseConfig;