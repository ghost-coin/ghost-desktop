import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Router, ParamMap, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';

import { ConnectionCheckerService } from './connection-checker.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { UpdaterService } from './updater.service';
import { take } from 'rxjs/operators';
import { MarketService } from 'app/core/market/market.module';
import { termsObj } from 'app/installer/terms/terms-txt';
import { environment } from 'environments/environment';

import * as marketConfig from '../../../modules/market/config.js';

@Component({
  selector: 'app-loading',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  providers: [ConnectionCheckerService]
})
export class LoadingComponent implements OnInit {
  log: any = Log.create('loading.component');

  loadingMessage: string;

  blockReceived: number = 0;
  blockHeader: number = 0;
  johnQuote: string = this.getQuote();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private rpc: RpcService,
    private multi: MultiwalletService,
    private con: ConnectionCheckerService,
    private updater: UpdaterService,
    private _market: MarketService
  ) {
    this.log.i('loading component initialized');
  }

  ngOnInit() {
    this.log.i('Loading component booted!');

    /* Daemon download */
    this.updater.status.asObservable().subscribe(status => {
      this.log.d(`updating statusMessage: `, status);
      this.loadingMessage = status;
    });

    // we wait until the multiwallet has retrieved the wallets
    this.multi.list.pipe(take(1)).subscribe(wallets => {
      // we also pass through the loading screen to switch wallets
      // check if a wallet was specified
      this.route.queryParamMap.pipe(take(1)).subscribe((params: ParamMap) => {
        this.log.d('loading params', params);
        // we can only pass strings through
        const switching = params.get('wallet');
        if (switching !== null && switching !== undefined) {
          // one was specified
          this.rpc.wallet = switching;
        }

        this.con.performCheck();

        // kick off the connection checker
        // only after we have a wallet or default
        this.con
          .whenRpcIsResponding()
          .subscribe(
            async response => {
              if (response.rpc_command === 'blockchaininfo') {
                this.blockReceived = response.blocks;
                this.blockHeader = response.headers;
              } else {
                if (!this.rpc.daemonProtocol) {
                  await this.rpc.call('getnetworkinfo').toPromise().then(networkinfo => {
                    if (networkinfo && +networkinfo.protocolversion) {
                      this.rpc.daemonProtocol = +networkinfo.protocolversion;
                    }
                  }).catch(rpcErr => {
                    this.log.er('getnetworkinfo failed: may already be stopped: ', rpcErr);
                  });
                }
                this.multi.refreshWalletList();
                // Swap smsg to the new wallet
                this.rpc.call('smsgdisable').subscribe(
                  () => {
                    this.activateWallet(response, true);
                  },
                  (err) => {
                    this.log.er('smsgdisable failed: may already be stopped: ', err);
                    this.activateWallet(response, false);
                  }
                );
              }
            },
            error => this.log.d('whenRpcIsResponding errored')
          );
      });
    });
  }

  decideWhereToGoTo(getwalletinfo: any) {
    // Check the terms and conditions
    const termsVersion = this.getVersion();
    if (!environment.isTesting && (!termsVersion || (termsVersion && termsVersion.createdAt !== termsObj.createdAt
      && termsVersion.text !== termsObj.text))) {
      this.goToTerms();
    } else if (this.rpc.daemonProtocol < 90008) {
      this.goToStartupError();
    } else {

      this.log.d('Where are we going next?', getwalletinfo);
      if ('hdseedid' in getwalletinfo) {
        const isMarketWallet = (marketConfig.allowedWallets || []).includes(this.rpc.wallet);
        if (isMarketWallet) {
          this.startMarketService();
        } else {
          this.goToWallet();
        }
      } else {
        this.goToInstaller(getwalletinfo);
      }
    }
  }

  goToInstaller(getwalletinfo: any) {
    this.log.d('Going to installer');
    this.router.navigate(['installer'], {
      queryParams: {
        walletname: getwalletinfo.walletname,
        encryptionstatus: getwalletinfo.encryptionstatus
      }
    });
  }

  goToWallet() {
    this.log.d('MainModule: moving to new wallet', this.rpc.wallet);
    this.router.navigate(['wallet', 'main', 'wallet']);
  }

  goToTerms() {
    this.log.d('Going to terms');
    this.router.navigate(['installer', 'terms']);
  }

  goToStartupError() {
    this.log.d('Going to startup error');
    this.router.navigate(['installer', 'error']);
  }

  private startMarketService() {
    this._market.startMarket(this.rpc.wallet).subscribe(
      () => {
        // TODO: Leaving this here for now, but it requires the wallet to be unlocked, so doesn't work as expected.
        // It can help for first load after a Market wallet has been created though, so not removing it just yet.
        this.rpc.call('smsgscanbuckets').subscribe();
      },
      (err) => this.log.er('Request to start market failed!'),
      () => this.goToWallet()
    )
  }

  private activateWallet(getwalletinfo: any, startSmsg: boolean = true) {
    const isMarketWallet = (marketConfig.allowedWallets || []).includes(this.rpc.wallet);
    if (startSmsg || isMarketWallet) {
      this.rpc.call('smsgenable', [this.rpc.wallet]).subscribe(
        () => {},
        (err) => this.log.er('smsgenable failed: ', err),
        () => this.decideWhereToGoTo(getwalletinfo)
      )
    } else {
      this.decideWhereToGoTo(getwalletinfo);
    }
  }

  private getVersion(): any {
    return JSON.parse(localStorage.getItem('terms'));
  }
  
  private getQuote() {
  const quotes = [
  'Сryptocurrency is the last chance for financial freedom.',
  'Cryptocurrency can free us from the imprisonment that existing currency has put us in.',
  'What business is it of our governments to know what we earn?',
  'The SEC is a festering pustule on the face of America.',
  'Privacy is a human right.',
  'Ignorance and confidence go hand in hand. Those who are ignorant are the ones who are often the most confident. The latter should never be mistaken for knowledge.',
  'If you own the facts, you may distort them as you like.',
  'If the majority holds something of value, you can be certain it has none.',
  'Opinions need a willing ear.',
  'You cannot just shout out your opinions to those who do not want to hear it. Opinions need a willing ear. Unsolicited advice and opinions are disrepectful and stupid.',
  'Any idiot can make money, Keeping money, very few can do.',
  'It’s easy to make money. What is difficult is knowing how to spend it and save it. And that’s what separates the rich from the poor.',
  'I would describe myself as quite sane and lucid, which is why I’m still alive.',
  'The world is insane. And it takes a lot to stay sane in such a world. But that is the only way to survive. You need to stay sane and lucid.',
  'I simply would like to live comfortably day by day, fish, swim, enjoy my declining years.',
  'In the end, we all deserve a retirement plan. As we grow old, all we want to do is to enjoy our life and do the things that we are most comfortable with and require the least effort.',
  'To say what your disguise is would be foolish.',
  'You cannot give up your cover. We all need a facade to survive the world. To reveal everything about you to everyone is stupid and foolish.',
  'The world chooses to think what the world thinks.',
  'People believe what they want to believe and you cannot really change that. The only thing that you need to concern yourself with is your own growth. Forget what others think and do what you desire.',
  'Disobedience is the vehicle of progress.',
  'Progress only comes to those who dare to be disobedient and rebel. Throughout history, it has always been the ones who were brave enough to challenge the system who have brought forth progress.',
  'True love has no object, It is a state of being.',
  'True love transcends materialism. It is when you learn to see the person for what they are. You see beyond their flaws and imperfections and learn to accept them as a whole.',
  'We’re missing that, We’re missing the people who have the courage to walk into the wilderness just to see what’s there.'
  ];
  
  const random = Math.floor(Math.random() * quotes.length);
  
  return quotes[random];
  }
}
