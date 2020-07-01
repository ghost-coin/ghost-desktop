import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Log } from 'ng2-logger';
import { Amount } from '../../../../../core/util/utils';

import { RpcService, RpcStateService } from 'app/core/core.module';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

@Component({
  selector: 'app-zap-coldstaking',
  templateUrl: './zap-coldstaking.component.html',
  styleUrls: ['./zap-coldstaking.component.scss']
})
export class ZapColdstakingComponent {

  private log: any = Log.create('zap-coldstaking');

  public utxos: any;
  fee: number;
  script: string;
  public zapSplitDefaultAmount: Amount = new Amount(1500, 8);

  constructor(
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<ZapColdstakingComponent>,
    private _rpc: RpcService,
    private _rpcState: RpcStateService
  ) {

    /*
      TODO: move to coldstaking service
      TODO: use async / await, make return value useful, subscribe errors
      TODO: use a neat regex to detect the type of address rather than length
    */

    this.utxos = {
      txs: [],
      amount: 0
    };

    this._rpc.call('walletsettings', ['changeaddress']).subscribe(res => {

      this.log.d('pkey', res);
      const pkey = res.changeaddress.coldstakingaddress;
      if (!pkey || pkey === '' || pkey === 'default') {
        return false;
      }

      // If not a pool stake address
      if (pkey.length > 43) {
        this._rpc.call('deriverangekeys', [1, 1, pkey]).subscribe(derived => {
          this.log.d('coldstaking address', derived);
          if (!derived || derived.length !== 1) {
            return false;
          }
          const coldstakingAddress = derived[0];
          this.initializeZapForAddress(coldstakingAddress)
        });
      } else { // Coldstake pool
        this.initializeZapForAddress(pkey)
      }

    }, error => {
      this.log.er('errr', error);
    });
  }

  initializeZapForAddress(coldstakingAddress: string) {
    this._rpc.call('listunspent').subscribe(unspent => {
      // TODO: Must process amounts as integers
      unspent.map(utxo => {
        if (utxo.coldstaking_address // found a cold staking utxo
          || !utxo.address) {
          // skip
        } else {
          this.utxos.amount += utxo.amount;
          this.utxos.txs.push({
            address: utxo.address,
            amount: utxo.amount,
            inputs: [{ tx: utxo.txid, n: utxo.vout }]
          });
        };
      });

      this._rpc.call('getnewaddress', ['""', 'false', 'false', 'true'])
        .subscribe(spendingAddress => {
          this.log.d('spending address', spendingAddress);
          if (!spendingAddress || spendingAddress === '') {
            return false;
          }

          this._rpc.call('buildscript', [{
            recipe: 'ifcoinstake',
            addrstake: coldstakingAddress,
            addrspend: spendingAddress
          }]).subscribe(script => {

            this.log.d('script', script);
            if (!script || !script.hex) {
              return false;
            }
            this.script = script.hex;

            const amount = new Amount(this.utxos.amount, 8);
            this.log.d('amount', amount.getAmount());
            let splits = 0;
            if (amount.getAmount() > this.zapSplitDefaultAmount.getAmount()) {
              splits = Math.floor(amount.getAmount() / this.zapSplitDefaultAmount.getAmount());
            }
            const outputs = [];
            // If we can split the outputs we build several outputs with default size amount
            if (splits > 0) {
              let amountInSplits = 0;
              for (let index = 0; index < splits; index++) {
                outputs.push({ subfee: true, address: 'script', amount: this.zapSplitDefaultAmount.getAmount(), script: script.hex })
                amountInSplits = amountInSplits + this.zapSplitDefaultAmount.getAmount();
              }
              const remainingCoins = amount.getAmount() - amountInSplits;
              // we create an additional output for the remaining coins if the threshold is higher than 100 coins
              if ( remainingCoins > 100) {
                outputs.push({ subfee: true, address: 'script', amount: Math.floor(remainingCoins), script: this.script })
              }

            } else {
              outputs.push({ subfee: true, address: 'script', amount: amount.getAmount(), script: script.hex })
            }

            this.log.d('zap splits', splits);

            this._rpc.call('sendtypeto', ['ghost', 'ghost', outputs, '', '', 4, 64, true, JSON.stringify({
              inputs: this.utxos.txs
            })]).subscribe(tx => {
              this.log.d('fees', tx);
              this.fee = tx.fee;
            });
            this.log.d('zap initialized with outputs', outputs);

          });
        });
    });
  }

  zap() {

    this.log.d('zap tx', this.utxos.amount, this.script, this.utxos.txs);
    const amount = new Amount(this.utxos.amount, 8);
    let splits = 0;
    if (amount.getAmount() > this.zapSplitDefaultAmount.getAmount()) {
      splits = Math.floor(amount.getAmount() / this.zapSplitDefaultAmount.getAmount());
    }
    const outputs = [];
    // If we can split the outputs we build several outputs with default size amount
    if (splits > 0) {
      let amountInSplits = 0;
      for (let index = 0; index < splits; index++) {
        outputs.push({ subfee: true, address: 'script', amount: this.zapSplitDefaultAmount.getAmount(), script: this.script })
        amountInSplits = amountInSplits + this.zapSplitDefaultAmount.getAmount();
      }
      const remainingCoins = amount.getAmount() - amountInSplits;
      // we create an additional output for the remaining coins if the threshold is higher than 100 coins
      if (remainingCoins > 100) {
        outputs.push({ subfee: true, address: 'script', amount: Math.floor(remainingCoins), script: this.script })
      }
    } else {
      outputs.push({ subfee: true, address: 'script', amount: amount.getAmount(), script: this.script })
    }

    this.log.d('zap splits', splits);


    this._rpc.call('sendtypeto', ['ghost', 'ghost', outputs, 'coldstaking zap', '', 4, 64, false, JSON.stringify({
      inputs: this.utxos.txs
    })]).subscribe(info => {
      this.log.d('zap', info);

      this.dialogRef.close();
      this.flashNotification.open(
        `Succesfully zapped ${this.utxos.amount} GHOST to cold staking`, 'warn');
    });

  }

}
