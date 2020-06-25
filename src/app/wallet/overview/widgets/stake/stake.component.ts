import { Component, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';


import { StakeService } from './stake.service'
import { ModalsHelperService } from 'app/modals/modals.module';
import { RpcService, RpcStateService } from 'app/core/core.module';


@Component({
  selector: 'app-stake',
  templateUrl: './stake.component.html',
  styleUrls: ['./stake.component.scss']
})
export class StakeComponent implements OnInit {

  private log: any = Log.create('stake.component');

  constructor(
    /***
     *  @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
     */
    private _modals: ModalsHelperService,
    public _stake: StakeService,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
  ) { }

  ngOnInit() {
    this._stake.update();
  }

  openUnlockWalletModal(): void {
    this._modals.unlock({ showStakeOnly: false, stakeOnly: true });
  }

  lockWallet(): void{
    this._rpc.call('walletlock')
          .subscribe(
            success => this._rpcState.stateCall('getwalletinfo'),
            error => this.log.er('walletlock error'));
  }

  checkLockStatus(): boolean {
    return [
      'Unlocked',
      'Unlocked, staking only',
      'Unencrypted'
    ].includes(this._stake.encryptionStatus);
  }

  isLocked(): boolean {
    return [
      'Locked',
    ].includes(this._stake.encryptionStatus);
  }
}
