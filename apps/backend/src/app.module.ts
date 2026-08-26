import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModuleSetup, DatabaseConfig } from './config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StatesModule } from './states/states.module';
import { CoursesModule } from './courses/courses.module';

// app.module.ts
@Module({
  imports: [
    ConfigModuleSetup,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.getOrThrow<DatabaseConfig>('database');
        return {
          type: 'mysql',
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.database,
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),
    TasksModule,
    StatesModule,
    CoursesModule,
  ],
})
export class AppModule {}
