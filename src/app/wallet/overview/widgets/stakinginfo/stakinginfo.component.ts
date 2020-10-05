import { Component, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { RpcStateService } from '../../../../core/core.module';
import { Amount, Duration } from '../../../../core/util/utils';
import { takeWhile } from 'rxjs/operators';
import { ColdstakeService } from '../coldstake/coldstake.service';
import { StakeService } from '../stake/stake.service';

@Component({
  selector: 'app-stakinginfo',
  templateUrl: './stakinginfo.component.html',
  styleUrls: ['./stakinginfo.component.scss']
})
export class StakinginfoComponent implements OnDestroy {

  /*  General   */
  private log: any = Log.create('stakinginfo.component' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  /*  UI   */
  public curStakeReward: Amount = new Amount(0);
  // public dynamicStakingReward: Amount = new Amount(0);
  // Hot
  public hotexpectedtime: Duration = new Duration(0);
  public hotStakeWeight: Amount = new Amount(0);
  // Cold
  public coldexpectedtime: Duration = new Duration(0);
  public coldStakeWeight: Amount = new Amount(0);

  /*  RPC   */
  public hotweight: number = 1;
  public coldweight: number = 1;
  public netstakeweight: number = 1;
  private moneysupply: number = 0;


  constructor(
    private rpcState: RpcStateService,
    public _coldstake: ColdstakeService,
    public _stake: StakeService
    ) {

    // region global info
    this.rpcState.observe('getstakinginfo', 'percentyearreward')
    .pipe(takeWhile(() => !this.destroyed))
    .subscribe(
      success => {
        this.log.d(`setting curStakeReward ${success}`);
        this.curStakeReward = new Amount(success, 2);
        // this.calculateHotStakingReward();
        // this.calculateColdStakingReward();
      },
      error => this.log.er('Constructor, percentyearreward error:' + error));

    this.rpcState.observe('getstakinginfo', 'netstakeweight')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        success => {
          this.log.d(`setting netstakeweight ${success}`);
          this.netstakeweight = success;
          this.calculateHotStakingReward();
          this.calculateColdStakingReward();
        },
        error => this.log.er('Constructor, netstakeweight error:' + error));

    this.rpcState.observe('getstakinginfo', 'moneysupply')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        success => {
          this.log.d(`setting moneysupply ${success}`);
          this.moneysupply = success;
          this.calculateHotStakingReward();
          this.calculateColdStakingReward();
        },
        error => this.log.er('Constructor, moneysupply error:' + error));
    // endregion

    // region hot staking information
    this.rpcState.observe('getstakinginfo', 'weight')
    .pipe(takeWhile(() => !this.destroyed))
    .subscribe(
      success => {
        this.log.d(`setting weight ${success}`);
        this.hotweight = success;
        this.calculateHotStakingReward();
      },
      error => this.log.er('Constructor, weight error:' + error),
      () => this.log.d('state observe weight completed!'));

    this.rpcState.observe('getstakinginfo', 'expectedtime')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        success => {
          this.log.d(`setting hotexpectedtime ${success}`);
          this.hotexpectedtime = new Duration(success);
        },
        error => this.log.er('Constructor, expectedtime error:' + error));
    // endregion

    // region cold staking information
    this.rpcState.observe('getcoldstakinginfo', 'currently_coldstaking')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        success => {
          this.log.d(`setting weight ${success}`);
          this.coldweight = success * 100000000;
          this.calculateColdStakingReward();
        },
        error => this.log.er('Constructor, weight error:' + error),
        () => this.log.d('state observe weight completed!'));

    this.rpcState.observe('getcoldstakinginfo', 'coldstake_expectedtime')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(
        success => {
          this.log.d(`setting coldexpectedtime ${success}`);
          this.coldexpectedtime = new Duration(success);
        },
        error => this.log.er('Constructor, expectedtime error:' + error));
    // endregion
  }

  private calculateHotStakingReward(): void {
    this.hotStakeWeight = new Amount((this.hotweight / this.netstakeweight) * 100, 5);
    // this.dynamicStakingReward = new Amount(this.curStakeReward.getAmount() * (this.moneysupply / (this.netstakeweight / 10000000)), 2);
    // this.log.d(`calculateDynamicStakingReward, dynamicStakingReward`, this.dynamicStakingReward);
  }

  private calculateColdStakingReward(): void {
    this.coldStakeWeight = new Amount((this.coldweight / this.netstakeweight) * 100, 5);
    // this.dynamicStakingReward = new Amount(this.curStakeReward.getAmount() * (this.moneysupply / (this.netstakeweight / 10000000)), 2);
    // this.log.d(`calculateDynamicStakingReward, dynamicStakingReward`, this.dynamicStakingReward);
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
