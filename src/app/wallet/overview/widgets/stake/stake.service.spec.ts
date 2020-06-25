import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';

import { StakeService } from './stake.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('StakeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        SharedModule,
        RpcWithStateModule.forRoot()
      ],
      providers: [StakeService]
    });
  });

  it('should be created', inject([StakeService], (service: StakeService) => {
    expect(service).toBeTruthy();
  }));
});
