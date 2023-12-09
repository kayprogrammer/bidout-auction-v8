import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { CreateData } from './data_script';
import { UserService } from '../../prisma/services/accounts.service';
import { CategoryService, ListingService } from '../../prisma/services/listings.service';
import { FileService, ReviewService } from '../../prisma/services/general.service';

async function runScript() {
    const app = await NestFactory.createApplicationContext(AppModule);
    await app.init();
    
    const createData = new CreateData(
        app.get(UserService),
        app.get(ListingService),
        app.get(ReviewService),
        app.get(CategoryService),
        app.get(FileService),
    );
  
    await createData.initialize();
  
    await app.close();
}

runScript()