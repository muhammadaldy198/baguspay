import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/core/database/database.module'
import { UserController } from './user.controller'
import { UserRepository } from './user.repository'
import { UserService } from './user.service'

@Module({
  imports: [DatabaseModule],
  exports: [UserRepository],
  providers: [UserService, UserRepository],
  controllers: [UserController],
})
export class UserModule {}
