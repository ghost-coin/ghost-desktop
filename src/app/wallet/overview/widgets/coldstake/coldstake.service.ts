import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';

import { Log } from 'ng2-logger';
import { Amount } from '../../../../core/util/utils';

import { RpcService, RpcStateService } from 'app/core/core.module';
import { takeWhile, debounceTime } from 'rxjs/operators';

@Injectable()
export class ColdstakeService implements OnDestroy {

  private destroyed: boolean = false;
  private log: any = Log.create('coldstake-service');

  public coldstake: any =  {
    txs: [],
    amount: 0
  };

  public hotstake: any = {
    txs: [],
    amount: 0
  };

  coldStakingEnabled: boolean = undefined;
  anonBalance: number = 0;
  public encryptionStatus: string = 'Locked';

  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }
  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService
  ) {

    this._rpcState.observe('getcoldstakinginfo', 'enabled')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(status => this.coldStakingEnabled = status);
    this._rpcState.observe('getcoldstakinginfo', 'percent_in_coldstakeable_script')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(progress =>  this.progress = new Amount(progress, 2));
    this._rpcState.observe('getbalances', 'mine')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(balance => this.anonBalance = balance['anon_trusted']);
    this.updateAnon();
    this.update();
  }

  update() {
    this._rpcState.observe('getwalletinfo', 'encryptionstatus')
    .pipe(takeWhile(() => !this.destroyed))
    .subscribe(status => {
      this.encryptionStatus = status;
    });

    this._rpc.call('getcoldstakinginfo').subscribe(coldstakinginfo => {
      this.log.d('stakingStatus called ' + coldstakinginfo['enabled']);
      this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);

      this.log.d(`coldstakingamount (actually a percentage) ${this.progress.getAmount()}`);
      this.log.d(`hotstakingamount ${this.hotstake.amount}`);

      if ('enabled' in coldstakinginfo) {
        const enabled = coldstakinginfo['enabled'];
        this.coldStakingEnabled = enabled;
      } else {
        this.coldStakingEnabled = false;
      }
      this.updateStakingInfo();
    }, error => this.log.er('couldn\'t get coldstakinginfo', error));
  }
  
  updateAnon(){

    this._rpc.call('getbalances').subscribe(balance => {
        this.anonBalance = balance['mine']['anon_trusted'];
      
    }, error => this.log.er('couldn\'t get coldstakinginfo', error));
  }

  private updateStakingInfo() {
    const coldstake =  {
      txs: [],
      amount: 0
    }
    const hotstake =  {
      txs: [],
      amount: 0
    }

    this._rpc.call('listunspent').subscribe(unspent => {
      // TODO: Must process amounts as integers
      unspent.map(utxo => {
        if (utxo.coldstaking_address && utxo.address) {
          coldstake.amount += utxo.amount;
          coldstake.txs.push({
            address: utxo.address,
            amount: utxo.amount,
            inputs: [{ tx: utxo.txid, n: utxo.vout }]
          });
        } else if (utxo.address) {
          hotstake.amount += utxo.amount;
          hotstake.txs.push({
            address: utxo.address,
            amount: utxo.amount,
            inputs: [{ tx: utxo.txid, n: utxo.vout }]
          });
        }
      });
      this.coldstake = coldstake;
      this.hotstake = hotstake;
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
