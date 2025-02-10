import { Test, TestingModule } from '@nestjs/testing';
import { EntryPassesService } from './entry-passes.service';

describe('EntryPassesService', () => {
  let service: EntryPassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntryPassesService],
    }).compile();

    service = module.get<EntryPassesService>(EntryPassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
