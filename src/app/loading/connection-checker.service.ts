import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Log } from 'ng2-logger';
import { shareReplay } from 'rxjs/operators';

import { RpcService } from 'app/core/rpc/rpc.service';

enum SyncStatus {
  SYNCING_NETWORK = 0,
  LOADING_WALLET = 1,
  FINSHED = 2,
}

@Injectable()
export class ConnectionCheckerService implements OnDestroy {

  log: any = Log.create('connection-checker.service id:' + Math.floor((Math.random() * 1000) + 1));
  status: SyncStatus = SyncStatus.SYNCING_NETWORK;

  checkInterval: number = 1 * 1000; // milliseconds

  check: Observable<any>;
  observer: Observer<any>;

  // shareReplay
  constructor(private rpc: RpcService) {
    this.log.d(`connection-checker created`);
    this.check = Observable.create(observer => {
      this.observer = observer;
    }).pipe(shareReplay());

    // start checking
    // this.performCheck();
  }

  /**
   * Retries the 'getwalletinfo' rpc command, until the RPC endpoint is responsive.
   * Emits the getwalletinfo output & completes.
   */
  public whenRpcIsResponding(): Observable<any> {
    return this.check;
  }

  public performCheck() {
    this.log.d('performing check');
    switch (this.status) {
      case SyncStatus.SYNCING_NETWORK:
        this.log.d('connection-checker network:');
        this.rpc.call('getblockchaininfo', []).subscribe(
          (getblockchaininfo: any) => this.NetworkRpcHasResponded(getblockchaininfo),
          (error: any) => {
            this.log.d('performCheck:network on rpc (error is normal here) ', error);
          }
        );

        setTimeout(this.performCheck.bind(this), this.checkInterval);
        break;
      case SyncStatus.LOADING_WALLET:
        this.log.d('connection-checker wallet:', this.rpc.wallet);
        this.rpc.call('getwalletinfo', []).subscribe(
          (getwalletinfo: any) => this.WalletRpcHasResponded(getwalletinfo),
          (error: any) => {
            if (error.code === -18) {
              this.rpc.call('createwallet', ['']).subscribe(
                (getwalletinfo: any) => this.WalletRpcHasResponded(getwalletinfo),
              );
            }
            this.log.d('performCheck:wallet on rpc (error is normal here) ', error);
          }
        );

        setTimeout(this.performCheck.bind(this), this.checkInterval);
        break;
      default:
        break;
    }
  }

  private NetworkRpcHasResponded(getblockchaininfo: any) {
    this.log.info('Network RPC is responsive, yay!');
    this.observer.next({...getblockchaininfo, 'rpc_command': 'blockchaininfo'});
    if (getblockchaininfo.blocks === getblockchaininfo.headers) {
      this.status = SyncStatus.LOADING_WALLET;
    }
  }

  private WalletRpcHasResponded(getwalletinfo: any) {
    this.log.info('Wallet RPC is responsive, yay!');
    this.observer.next({...getwalletinfo, 'rpc_command': 'walletinfo'});
    this.observer.complete();
    this.status = SyncStatus.FINSHED;
  }

  ngOnDestroy() {
    this.status = SyncStatus.FINSHED;
  }
}
