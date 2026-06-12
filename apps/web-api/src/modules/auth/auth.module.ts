import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { DatabaseModule } from 'src/core/database/database.module'
import { AuthController } from './auth.controller'
import { AuthRepository } from './auth.repository'
import { AuthService } from './auth.service'
import { TransactionGuard } from './guards/transaction.guard'
import { JwtStrategy } from './jwt.strategy'
import { PasskeyService } from './services/passkey.service'

@Module({
  providers: [AuthService, AuthRepository, JwtStrategy, TransactionGuard, PasskeyService],
  controllers: [AuthController],
  exports: [TransactionGuard],
  imports: [
    DatabaseModule,
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
})
export class AuthModule {}
