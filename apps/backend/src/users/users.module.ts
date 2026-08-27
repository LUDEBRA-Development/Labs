import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService],
  // Exportado porque AuthModule (FirebaseAuthGuard) y, más adelante,
  // CoursesModule (para validar que un idDocente exista y sea rol teacher)
  // necesitan consultar usuarios.
  exports: [UsersService],
})
export class UsersModule {}
