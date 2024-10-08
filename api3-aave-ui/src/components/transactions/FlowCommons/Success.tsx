import { InterestRate } from "contract-helpers";
import CheckIcon from "@mui/icons-material/Check";

import {
  Box,
  Button,
  Link,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { ReactNode, useState } from "react";
import WalletIcon from "@mui/icons-material/Wallet";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { Base64Token, TokenIcon } from "src/components/primitives/TokenIcon";
import { useModalContext } from "src/hooks/useModal";
import { useProtocolDataContext } from "src/hooks/useProtocolDataContext";
import LinkIcon from "@mui/icons-material/Link";
import { populateChainConfigs } from "configuration";

export type SuccessTxViewProps = {
  txHash?: string;
  action?: ReactNode;
  amount?: string;
  symbol?: string;
  collateral?: boolean;
  rate?: InterestRate;
  addToken?: any;
  customAction?: ReactNode;
  customText?: ReactNode;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: "2px", fontSize: "11px" }}>
    <LinkIcon />
  </SvgIcon>
);

export const TxSuccessView = ({
  txHash,
  action,
  amount,
  symbol,
  collateral,
  rate,
  addToken,
  customAction,
  customText,
}: SuccessTxViewProps) => {
  const { close, mainTxState } = useModalContext();
  // const { addERC20Token } = useWeb3Context();
  const { currentNetworkConfig } = useProtocolDataContext();
  const [base64, setBase64] = useState("");
  const theme = useTheme();

  const compoundConfig = populateChainConfigs();
  const isCompound = compoundConfig.currentMarket === "compound";

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "48px",
            height: "48px",
            bgcolor: "success.200",
            borderRadius: "50%",
            mt: 14,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SvgIcon sx={{ color: "success.main", fontSize: "32px" }}>
            <CheckIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 4 }} variant="h2">
          <div>All done!</div>
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {action && amount && symbol && !isCompound && (
            <Typography>
              <div>
                You {action}{" "}
                <FormattedNumber
                  value={Number(amount)}
                  compact
                  variant="secondary14"
                />{" "}
                {symbol}
              </div>
            </Typography>
          )}

          {customAction && (
            <Typography>
              {customText}
              {customAction}
            </Typography>
          )}

          {!action && !amount && symbol && (
            <Typography>
              Your {symbol} {collateral ? "now" : "is not"} used as collateral
            </Typography>
          )}

          {rate && (
            <Typography>
              <div>
                You switched to{" "}
                {rate === InterestRate.Variable ? "variable" : "stable"} rate
              </div>
            </Typography>
          )}

          {/* {addToken && symbol && (
            <Box
              sx={(theme) => ({
                border:
                  theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
                background: theme.palette.mode === 'dark' ? 'none' : '#F7F7F9',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mt: '24px',
              })}
            >
              <TokenIcon
                symbol={addToken.symbol}
                aToken={addToken && addToken.aToken ? true : false}
                sx={{ fontSize: '32px', mt: '12px', mb: '8px' }}
              />
              <Typography variant="description" color="text.primary" sx={{ mx: '24px' }}>
                <div>
                  Add {addToken && addToken.aToken ? 'aToken ' : 'token '} to wallet to track your
                  balance.
                </div>
              </Typography>
              <Button
                onClick={() => {
                  addERC20Token({
                    address: addToken.address,
                    decimals: addToken.decimals,
                    symbol: addToken.aToken ? `a${addToken.symbol}` : addToken.symbol,
                    image: !/_/.test(addToken.symbol) ? base64 : undefined,
                  });
                }}
                variant={theme.palette.mode === 'dark' ? 'outlined' : 'contained'}
                size="medium"
                sx={{ mt: '8px', mb: '12px' }}
              >
                {addToken.symbol && !/_/.test(addToken.symbol) && (
                  <Base64Token
                    symbol={addToken.symbol}
                    onImageGenerated={setBase64}
                    aToken={addToken.aToken}
                  />
                )}
                <WalletIcon sx={{ width: '20px', height: '20px' }} />
                <Typography variant="buttonM" color="white" ml="4px">
                  <Trans>Add to wallet</Trans>
                </Typography>
              </Button>
            </Box>
          )} */}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Link
          variant="helperText"
          href={currentNetworkConfig.explorerLinkBuilder({
            tx: txHash ? txHash : mainTxState.txHash,
          })}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "right",
            mt: 6,
            mb: 3,
          }}
          underline="hover"
          target="_blank"
          rel="noreferrer noopener"
        >
          <div>Review tx details</div>
          <ExtLinkIcon />
        </Link>
        <Button
          onClick={close}
          variant="contained"
          size="large"
          sx={{ minHeight: "44px" }}
          data-cy="closeButton"
        >
          <div>Ok, Close</div>
        </Button>
      </Box>
    </>
  );
};
