import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';

import { stakeService } from './stake.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('stakeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        SharedModule,
        RpcWithStateModule.forRoot()
      ],
      providers: [stakeService]
    });
  });

  it('should be created', inject([stakeService], (service: stakeService) => {
    expect(service).toBeTruthy();
  }));
});
