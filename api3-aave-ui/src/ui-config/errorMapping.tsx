import { ReactElement } from "react";

export enum TxAction {
  APPROVAL,
  MAIN_ACTION,
  GAS_ESTIMATION,
}

export type TxErrorType = {
  blocking: boolean;
  actionBlocked: boolean;
  rawError: Error;
  error: ReactElement | undefined;
  txAction: TxAction;
};

export const getErrorTextFromError = (
  error: Error,
  txAction: TxAction,
  blocking = true
): TxErrorType => {
  let errorNumber = 1;

  if (
    error.message ===
      "MetaMask Tx Signature: User denied transaction signature." ||
    error.message ===
      "MetaMask Message Signature: User denied message signature."
  ) {
    return {
      error: errorMapping[4001],
      blocking: false,
      actionBlocked: false,
      rawError: error,
      txAction,
    };
  }

  // Try to parse the Pool error number from RPC provider revert error
  try {
    const parsedError = JSON.parse((error as any)?.error?.body);
    const parsedNumber = Number(parsedError.error.message.split(": ")[1]);
    if (!isNaN(parsedNumber)) {
      errorNumber = parsedNumber;
    }
  } catch {}

  const errorRender = errorMapping[errorNumber];

  if (errorRender) {
    return {
      error: errorRender,
      blocking,
      actionBlocked: true,
      rawError: error,
      txAction,
    };
  }

  return {
    error: undefined,
    blocking,
    actionBlocked: true,
    rawError: error,
    txAction,
  };
};

export const errorMapping: Record<number, ReactElement> = {
  // 1: <div>The caller of the function is not a pool admin</div>,
  // 2: <div>The caller of the function is not an emergency admin</div>,
  // 3: <div>The caller of the function is not a pool or emergency admin</div>,
  // 4: <div>The caller of the function is not a risk or pool admin</div>,
  // 5: <div>The caller of the function is not an asset listing or pool admin</div>,
  // 6: <div>The caller of the function is not a bridge</div>,
  7: <div>Pool addresses provider is not registered</div>,
  // 8: <div>Invalid id for the pool addresses provider</div>,
  9: <div>Address is not a contract</div>,
  // 10: <div>The caller of the function is not the pool configurator</div>,
  11: <div>The caller of the function is not an AToken</div>,
  12: <div>The address of the pool addresses provider is invalid</div>,
  13: <div>Invalid return value of the flashloan executor function</div>,
  // 14: <div>Reserve has already been added to reserve list</div>,
  // 15: <div>Maximum amount of reserves in the pool reached</div>,
  // 16: <div>Zero eMode category is reserved for volatile heterogeneous assets</div>,
  // 17: <div>Invalid eMode category assignment to asset</div>,
  // 18: <div>The liquidity of the reserve needs to be 0</div>,
  19: <div>Invalid flashloan premium</div>,
  // 20: <div>Invalid risk parameters for the reserve</div>,
  // 21: <div>Invalid risk parameters for the eMode category</div>,
  22: <div>Invalid bridge protocol fee</div>,
  23: <div>The caller of this function must be a pool</div>,
  24: <div>Invalid amount to mint</div>,
  25: <div>Invalid amount to burn</div>,
  26: <div>Amount must be greater than 0</div>,
  27: <div>Action requires an active reserve</div>,
  28: <div>Action cannot be performed because the reserve is frozen</div>,
  29: <div>Action cannot be performed because the reserve is paused</div>,
  30: <div>Borrowing is not enabled</div>,
  31: <div>Stable borrowing is not enabled</div>,
  32: <div>User cannot withdraw more than the available balance</div>,
  // 33: <div>Invalid interest rate mode selected</div>,
  34: <div>The collateral balance is 0</div>,
  35: <div>Health factor is lesser than the liquidation threshold</div>,
  36: <div>There is not enough collateral to cover a new borrow</div>,
  37: (
    <div>Collateral is (mostly) the same currency that is being borrowed</div>
  ),
  38: (
    <div>
      The requested amount is greater than the max loan size in stable rate mode
    </div>
  ),
  39: (
    <div>
      For repayment of a specific type of debt, the user needs to have debt that
      type
    </div>
  ),
  40: (
    <div>
      To repay on behalf of a user an explicit amount to repay is needed
    </div>
  ),
  41: (
    <div>User does not have outstanding stable rate debt on this reserve</div>
  ),
  42: (
    <div>User does not have outstanding variable rate debt on this reserve</div>
  ),
  43: <div>The underlying balance needs to be greater than 0</div>,
  44: <div>Interest rate rebalance conditions were not met</div>,
  45: <div>Health factor is not below the threshold</div>,
  46: <div>The collateral chosen cannot be liquidated</div>,
  47: <div>User did not borrow the specified currency</div>,
  48: <div>Borrow and repay in same block is not allowed</div>,
  49: <div>Inconsistent flashloan parameters</div>,
  50: <div>Borrow cap is exceeded</div>,
  51: <div>Supply cap is exceeded</div>,
  52: <div>Unbacked mint cap is exceeded</div>,
  53: <div>Debt ceiling is exceeded</div>,
  54: <div>AToken supply is not zero</div>,
  55: <div>Stable debt supply is not zero</div>,
  56: <div>Variable debt supply is not zero</div>,
  57: <div>Ltv validation failed</div>,
  // 58: <div>Inconsistent eMode category</div>,
  // 59: <div>Price oracle sentinel validation failed</div>,
  60: <div>Asset is not borrowable in isolation mode</div>,
  // 61: <div>Reserve has already been initialized</div>,
  62: <div>User is in isolation mode</div>,
  // 63: <div>Invalid ltv parameter for the reserve</div>,
  // 64: <div>Invalid liquidity threshold parameter for the reserve</div>,
  // 65: <div>Invalid liquidity bonus parameter for the reserve</div>,
  // 66: <div>Invalid decimals parameter of the underlying asset of the reserve</div>,
  // 67: <div>Invalid reserve factor parameter for the reserve</div>,
  // 68: <div>Invalid borrow cap for the reserve</div>,
  // 69: <div>Invalid supply cap for the reserve</div>,
  // 70: <div>Invalid liquidation protocol fee for the reserve</div>,
  // 71: <div>Invalid eMode category for the reserve</div>,
  // 72: <div>Invalid unbacked mint cap for the reserve</div>,
  // 73: <div>Invalid debt ceiling for the reserve</div>,
  // 74: <div>Invalid reserve index</div>,
  // 75: <div>ACL admin cannot be set to the zero address</div>,
  76: <div>Array parameters that should be equal length are not</div>,
  77: <div>Zero address not valid</div>,
  78: <div>Invalid expiration</div>,
  79: <div>Invalid signature</div>,
  80: <div>Operation not supported</div>,
  81: <div>Debt ceiling is not zero</div>,
  82: <div>Asset is not listed</div>,
  // 83: <div>Invalid optimal usage ratio</div>,
  // 84: <div>Invalid optimal stable to total debt ratio</div>,
  85: <div>The underlying asset cannot be rescued</div>,
  // 86: <div>Reserve has already been added to reserve list</div>,
  // 87: (
  //   <div>
  //     The token implementation pool address and the pool address provided by the initializing pool
  //     do not match
  //   </div>
  // ),
  88: <div>Stable borrowing is enabled</div>,
  89: (
    <div>User is trying to borrow multiple assets including a siloed one</div>
  ),
  // 90: <div>the total debt of the reserve needs to be</div>,

  4001: <div>You cancelled the transaction.</div>,
};
