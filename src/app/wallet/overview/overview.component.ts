
import { Component, OnInit } from '@angular/core';
import { RpcStateService } from '../../core/core.module';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ManageWidgetsComponent } from '../../modals/manage-widgets/manage-widgets.component';
import { take } from 'rxjs/operators';
import { ColdstakeService } from './widgets/coldstake/coldstake.service';
import { StakeService } from './widgets/stake/stake.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  testnet: boolean = false;
  constructor(
    public dialog: MatDialog,
    public _coldstake: ColdstakeService,
    public _hotstake: StakeService,
    private rpcState: RpcStateService
  ) { }

  openWidgetManager(): void {
    const dialogRef = this.dialog.open(ManageWidgetsComponent);
  }

  ngOnInit() {
    // check if testnet -> Show/Hide Anon Balance
    this.rpcState.observe('getblockchaininfo', 'chain').pipe(take(1))
     .subscribe(chain => this.testnet = chain === 'test');
  }

  public isHotstakingVisible(): boolean {
    return !this._coldstake.coldStakingEnabled || this._hotstake.hotstake.amount > 0;
  }

}
