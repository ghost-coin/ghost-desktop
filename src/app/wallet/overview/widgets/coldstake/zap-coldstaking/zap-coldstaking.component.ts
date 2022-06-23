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
  public inputs: any;
  

  fee: number;
  script: string;
  public zapSplitDefaultAmount: Amount = new Amount(1500, 8);
  
  public reuseAddr: boolean = false;
  public spendAddr: string = '';

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
    this.inputs = [];
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
          this.inputs.push({ tx: utxo.txid, n: utxo.vout });
        };
      });
  });
      if (this.reuseAddr) {
          console.log('we are doing it');
          this._rpc.call('filtertransactions', [{sort: "time", category:"internal_transfer"}])
          .subscribe(transactions => {
            for (var i of transactions){
                //console.log(i);
                if (String(i['outputs'][0]['address']).startsWith('2')) {
                    console.log(i['outputs'][0]['address']);
                    this.spendAddr = i['outputs'][0]['address'];
                    break;
                    }
              };
              this._rpc.call('buildscript', [{
                recipe: 'ifcoinstake',
                addrstake: coldstakingAddress,
                addrspend: this.spendAddr
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
    
                this._rpc.call('sendtypeto', ['ghost', 'ghost', outputs, '', '', 5, 1, true, {inputs: this.inputs}
              ]).subscribe(tx => {
                  this.log.d('fees', tx);
                  this.fee = tx.fee;
                });
                this.log.d('zap initialized with outputs', outputs);
    
              });
            });
      } 
      
      else if ( !this.reuseAddr || this.spendAddr === '' ) {
          console.log('this is not the one')
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
    
                this._rpc.call('sendtypeto', ['ghost', 'ghost', outputs, '', '', 5, 1, true, {inputs: this.inputs}
              ]).subscribe(tx => {
                  this.log.d('fees', tx);
                  this.fee = tx.fee;
                });
                this.log.d('zap initialized with outputs', outputs);
    
              });
            });
  
        }
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


    this._rpc.call('sendtypeto', ['ghost', 'ghost', outputs, 'coldstaking zap', '',
     5, 1, false, {inputs: this.inputs}]).subscribe(info => {
      this.log.d('zap', info);

      this.dialogRef.close();
      this.flashNotification.open(
        `Succesfully zapped ${this.utxos.amount} GHOST to cold staking`, 'warn');
    });

  }
  
  check(event) {
      
        if (event.checked === true) {
            this.reuseAddr = true;
            console.log(this.reuseAddr);
            this.utxos = {
                  txs: [],
                  amount: 0
                };
                this.inputs = [];
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

        if (event.checked === false) {
            this.reuseAddr = false;
            
            this.utxos = {
                  txs: [],
                  amount: 0
                };
                this.inputs = [];
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
    }

}

@Component({
  selector: 'app-zap-coldstaking',
  templateUrl: './zap-anoncoldstaking.component.html',
  styleUrls: ['./zap-anoncoldstaking.component.scss']
})

export class ZapAnonColdstakingComponent {

  private log: any = Log.create('zapanon-coldstaking');

  public utxos: any;
  public inputs: any;

  fee: number;
  script: string;
  public zapSplitDefaultAmount: Amount = new Amount(1500, 8);
  
  public reuseAnonAddr: boolean = false;
  public spendAddr: string = '';

  constructor(
    private flashNotification: SnackbarService,
    private dialogRef: MatDialogRef<ZapAnonColdstakingComponent>,
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
    this.inputs = [];
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
    this._rpc.call('listunspentanon').subscribe(unspent => {
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
          this.inputs.push({ tx: utxo.txid, n: utxo.vout });
        };
      });
  });
      if (this.reuseAnonAddr) {
          this._rpc.call('filtertransactions', [{sort: "time", category:"internal_transfer"}])
          .subscribe(transactions => {
            for (var i of transactions){
                //console.log(i);
                if (String(i['outputs'][0]['address']).startsWith('2')) {
                    console.log(i['outputs'][0]['address']);
                    this.spendAddr = i['outputs'][0]['address'];
                    break;
                    }
              };
              this._rpc.call('buildscript', [{
                recipe: 'ifcoinstake',
                addrstake: coldstakingAddress,
                addrspend: this.spendAddr
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
    
                this._rpc.call('sendtypeto', ['anon', 'ghost', outputs, '', '', 5, 1, true, {inputs: this.inputs}
              ]).subscribe(tx => {
                  this.log.d('fees', tx);
                  this.fee = tx.fee;
                });
                this.log.d('zapanon initialized with outputs', outputs);
    
              });
            });
      } 
      
      else if ( !this.reuseAnonAddr || this.spendAddr === '' ) {
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
    
                this.log.d('zapanon splits', splits);
    
                this._rpc.call('sendtypeto', ['anon', 'ghost', outputs, '', '', 5, 1, true, {inputs: this.inputs}
              ]).subscribe(tx => {
                  this.log.d('fees', tx);
                  this.fee = tx.fee;
                });
                this.log.d('zapanon initialized with outputs', outputs);
    
              });
            });
  
        }
     }

  zapanon() {

    this.log.d('zapanon tx', this.utxos.amount, this.script, this.utxos.txs);
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

    this.log.d('zapanon splits', splits);


    this._rpc.call('sendtypeto', ['anon', 'ghost', outputs, 'coldstaking zap', '',
     5, 1, false, {inputs: this.inputs}]).subscribe(info => {
      this.log.d('zapanon', info);

      this.dialogRef.close();
      this.flashNotification.open(
        `Succesfully zapped ${this.utxos.amount} Anon GHOST to cold staking`, 'warn');
    });

  }
  
  checkanon(event) {
      
        if (event.checked === true) {
            this.reuseAnonAddr = true;
            console.log(this.reuseAnonAddr);
            this.utxos = {
                  txs: [],
                  amount: 0
                };
                this.inputs = [];
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

        if (event.checked === false) {
            this.reuseAnonAddr = false;
            
            this.utxos = {
                  txs: [],
                  amount: 0
                };
                this.inputs = [];
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
    }

}

