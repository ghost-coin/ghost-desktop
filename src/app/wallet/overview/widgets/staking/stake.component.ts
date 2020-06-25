import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { ModalsHelperService } from 'app/modals/modals.module';
import { stakeService } from './stake.service'

@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss']
})
export class stakeComponent {

  private log: any = Log.create('stake.component');

  constructor(
    private dialog: MatDialog,
    /***
     *  @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
     */
    private _modals: ModalsHelperService,
    public _stake: stakeService
  ) { }

  openUnlockWalletModal(): void {
    this._modals.unlock({ showStakeOnly: false, stakeOnly: true });
  }

  openstakeModal(): void {
    this._modals.coldStake('cold');
  }

  checkLockStatus(): boolean {
    return [
      'Unlocked',
      'Unlocked, staking only',
      'Unencrypted'
    ].includes(this._stake.encryptionStatus);
  }
}
