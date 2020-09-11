import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';
import { SharedModule } from '../../../shared/shared.module';

import { StakinginfoComponent } from './stakinginfo.component';

import { RpcWithStateModule } from 'app/core/rpc/rpc.module';
import {ColdstakeService} from '../coldstake/coldstake.service';
import {StakeService} from '../stake/stake.service';

describe('StakinginfoComponent', () => {
  let component: StakinginfoComponent;
  let fixture: ComponentFixture<StakinginfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        RpcWithStateModule.forRoot(),
        CoreUiModule.forRoot(),
      ],
      declarations: [ StakinginfoComponent ],
      providers: [ColdstakeService, StakeService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StakinginfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should get stake service', () => {
    expect(component._stake).toBeDefined();
  });

  it('should get coldstake service', () => {
    expect(component._coldstake).toBeDefined();
  });
});
