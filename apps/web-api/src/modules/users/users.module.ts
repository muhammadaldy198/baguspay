import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/core/database/database.module'
import { UsersController } from './users.controller'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
  imports: [DatabaseModule],
  exports: [UsersRepository],
  providers: [UsersService, UsersRepository],
  controllers: [UsersController],
})
export class UsersModule {}
