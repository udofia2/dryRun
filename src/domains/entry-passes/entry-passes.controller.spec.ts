import { Test, TestingModule } from '@nestjs/testing';
import { EntryPassesController } from './entry-passes.controller';
import { EntryPassesService } from './entry-passes.service';

describe('EntryPassesController', () => {
  let controller: EntryPassesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EntryPassesController],
      providers: [EntryPassesService],
    }).compile();

    controller = module.get<EntryPassesController>(EntryPassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
