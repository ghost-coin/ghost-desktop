import { Injectable, OnDestroy, OnInit } from '@angular/core';

import { Log } from 'ng2-logger';
import { Amount } from '../../../../core/util/utils';

import { RpcService, RpcStateService } from 'app/core/core.module';
import { takeWhile, debounceTime } from 'rxjs/operators';

@Injectable()
export class StakeService implements OnDestroy {

  private destroyed: boolean = false;
  private log: any = Log.create('stake-service');

  public hotstake: any = {
    txs: [],
    amount: 0
  };

  stakingEnabled: boolean = undefined;
  public encryptionStatus: string = 'Locked';

  private progress: Amount = new Amount(0, 2);
  get stakeProgress(): number { return this.progress.getAmount() }
  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService
  ) {
    this._rpcState.observe('getwalletinfo', 'txcount')
      .pipe(takeWhile(() => !this.destroyed))
      .pipe(debounceTime(1000/*ms*/))
      .subscribe(txcount => {
        this.update();
      });

    this._rpcState.observe('getblockchaininfo', 'blocks')
      .pipe(takeWhile(() => !this.destroyed))
      .pipe(debounceTime(10 * 1000/*ms*/))
      .subscribe(status => {
        this.update();
      });

    this._rpcState.observe('getstakinginfo', 'enabled')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(status => this.stakingEnabled = status);

    this.update();
  }

  update() {
    this._rpcState.observe('getwalletinfo', 'encryptionstatus')
    .pipe(takeWhile(() => !this.destroyed))
    .subscribe(status => {
      this.encryptionStatus = status;
    });
    this._rpc.call('getstakinginfo').subscribe(stakinginfo => {
      this.log.d('stakingStatus called ' + stakinginfo['enabled']);
      this.log.d(`stakingamount ${this.hotstake.amount}`);

      if ('enabled' in stakinginfo) {
        const enabled = stakinginfo['enabled'];
        this.stakingEnabled = enabled;
      } else {
        this.stakingEnabled = false;
      }

      this.updateHotStakingInfo();
    }, error => this.log.er('couldn\'t get stakinginfo', error));
  }

  private updateHotStakingInfo() {
    const hotstake =  {
      txs: [],
      amount: 0
    }

    this._rpc.call('listunspent').subscribe(unspent => {
      // TODO: Must process amounts as integers
      unspent.map(utxo => {
        if (!utxo.coldstaking_address && utxo.address) {
          hotstake.amount += utxo.amount;
          hotstake.txs.push({
            address: utxo.address,
            amount: utxo.amount,
            inputs: [{ tx: utxo.txid, n: utxo.vout }]
          });
        }
      });
      this.hotstake = hotstake;
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
