import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NfseModule } from './nfse/nfse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    NfseModule,
  ],
})
export class AppModule {}