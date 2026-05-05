import { Global, Module } from '@nestjs/common';
import { UtilService } from './providers';

@Global() // Mark this as global module, and we don't need to import it in other modules
@Module({
  providers: [UtilService],
  exports: [UtilService],
})
export class CommonModule {}
