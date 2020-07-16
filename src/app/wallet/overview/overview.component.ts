
import { Component, OnInit } from '@angular/core';
import { RpcStateService, RpcService } from '../../core/core.module';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ManageWidgetsComponent } from '../../modals/manage-widgets/manage-widgets.component';
import { take } from 'rxjs/operators';
import { TransactionService } from '../wallet/shared/transaction.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  providers: [TransactionService],
})
export class OverviewComponent implements OnInit {
  testnet: boolean = false;
  timeInterval: number = 0.5 * 1000;  // 0.5 second
  firstTxBlock: number = 5955;  // no legacy wallet
  constructor(
    public dialog: MatDialog,
    public txService: TransactionService,
    private rpcState: RpcStateService,
    private rpc: RpcService) { }

  openWidgetManager(): void {
    const dialogRef = this.dialog.open(ManageWidgetsComponent);
  }

  ngOnInit() {
    // check if testnet -> Show/Hide Anon Balance
    this.rpcState.observe('getblockchaininfo', 'chain').pipe(take(1))
     .subscribe(chain => this.testnet = chain === 'test');
    this.txService.postConstructor(1);
    this.getTxs();
  }

  private getTxs() {
    if (!this.txService.loading) {
      if (this.txService.txCount > 1) {
        this.txService.changePage(this.txService.txCount - 1);
        this.getFirstTxBlock();
      } else if (this.txService.txCount === 1) {
        this.getFirstTxBlock();
      }
      return;
    }
    setTimeout(this.getTxs.bind(this), this.timeInterval);
  }

  private getFirstTxBlock() {
    if (!this.txService.loading) {
      this.rpc.call('getblock', [this.txService.txs[0].blockhash]).subscribe(
        (getblock: any) => this.firstTxBlock = getblock.height,
        (error: any) => {
          // Error Handle
        }
      )
      return;
    }
    setTimeout(this.getFirstTxBlock.bind(this), this.timeInterval);
  }
}
