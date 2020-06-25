import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { ModalsHelperService } from 'app/modals/modals.module';
import { StakeService } from './stake.service'

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss']
})
export class StakeComponent {

  private log: any = Log.create('stake.component');

  constructor(
    private dialog: MatDialog,
    /***
     *  @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
     */
    private _modals: ModalsHelperService,
    public _stake: StakeService
  ) { }

  openUnlockWalletModal(): void {
    this._modals.unlock({ showStakeOnly: false, stakeOnly: true });
  }

  openStakeModal(): void {
   // this._modals.stake('stake');
  }

  checkLockStatus(): boolean {
    return [
      'Unlocked',
      'Unlocked, staking only',
      'Unencrypted'
    ].includes(this._stake.encryptionStatus);
  }
}
