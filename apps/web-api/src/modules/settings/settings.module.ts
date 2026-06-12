import { Module } from '@nestjs/common'
import { DatabaseModule } from 'src/core/database/database.module'
import { UserModule } from 'src/modules/users/user.module'
import { SettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
