import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../shared/shared.module';
import { WalletModule } from '../../../wallet/wallet.module';
import { CoreModule } from '../../../../core/core.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';
import { ModalsModule } from '../../../../modals/modals.module';


import { QrCodeModalComponent } from './qr-code-modal.component';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('QrCodeModalComponent', () => {
  let component: QrCodeModalComponent;
  let fixture: ComponentFixture<QrCodeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,  // is this even needed?
        WalletModule.forRoot(),  // is this even needed?
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        RpcWithStateModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QrCodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
