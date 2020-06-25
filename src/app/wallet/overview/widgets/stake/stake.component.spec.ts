import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';
import { ModalsModule } from '../../../../modals/modals.module';

import { SharedModule } from '../../../shared/shared.module';
import { WalletModule } from '../../../wallet/wallet.module';

import { StakeComponent } from './stake.component';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';



describe('StakeComponent', () => {
  let component: StakeComponent;
  let fixture: ComponentFixture<StakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        /* own */
        SharedModule,
        ModalsModule.forRoot(),
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        WalletModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      declarations: [ StakeComponent ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
