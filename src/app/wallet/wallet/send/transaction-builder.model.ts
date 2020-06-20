export enum TxType {
  PUBLIC = 'part',
  BLIND = 'blind',
  ANON = 'anon'
}

export class TransactionBuilder {
  input: TxType = TxType.ANON;
  output: TxType = TxType.ANON;
  toAddress: string;
  toLabel: string;
  address: string;
  amount: number;
  comment: string;
  commentTo: string;
  narration: string;
  numsignatures: number = 1;
  validAddress: boolean;
  validAmount: boolean;
  isMine: boolean;
  currency: string = 'ghost';
  ringsize: number = 8;
  subtractFeeFromAmount: boolean = false;
  estimateFeeOnly: boolean = true;

  constructor() {

  }
}
