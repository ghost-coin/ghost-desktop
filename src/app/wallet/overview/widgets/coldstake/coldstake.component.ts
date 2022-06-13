import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { ModalsHelperService } from 'app/modals/modals.module';
import { ColdstakeService } from './coldstake.service'

import { ZapColdstakingComponent } from './zap-coldstaking/zap-coldstaking.component';
import { ZapAnonColdstakingComponent } from './zap-coldstaking/zap-coldstaking.component';
import { RevertColdstakingComponent } from './revert-coldstaking/revert-coldstaking.component';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent implements OnInit {

  private log: any = Log.create('coldstake.component');

  constructor(
    private dialog: MatDialog,
    /***
     *  @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
     */
    private _modals: ModalsHelperService,
    public _coldstake: ColdstakeService
  ) { }

  ngOnInit() {
    this._coldstake.update();
    this._coldstake.updateAnon();
  }

  zap() {
    this._modals.unlock({}, (status) => this.openZapColdstakingModal());
  }
  
  zapanon() {
    this._modals.unlock({}, (status) => this.openZapAnonColdstakingModal());
  }

  revert() {
    this._modals.unlock({}, (status) => this.openRevertColdstakingModal());
  }
  

  openRevertColdstakingModal() {
    const dialogRef = this.dialog.open(RevertColdstakingComponent);
  }

  openZapColdstakingModal(): void {
    const dialogRef = this.dialog.open(ZapColdstakingComponent);
  }
  
  openZapAnonColdstakingModal(): void {
    const dialogRef = this.dialog.open(ZapAnonColdstakingComponent);
  }

  openUnlockWalletModal(): void {
    this._modals.unlock({ showStakeOnly: false, stakeOnly: true });
  }

  openColdStakeModal(): void {
    this._modals.coldStake('cold');
  }

  checkLockStatus(): boolean {
    return [
      'Unlocked',
      'Unlocked, staking only',
      'Unencrypted'
    ].includes(this._coldstake.encryptionStatus);
  }
}
