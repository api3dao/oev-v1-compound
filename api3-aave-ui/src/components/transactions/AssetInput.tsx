import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
  CircularProgress,
  FormControl,
  InputBase,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme,
} from "@mui/material";
import React, { ReactNode } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";
import { CapType } from "../caps/helper";
import { FormattedNumber } from "../primitives/FormattedNumber";
import { TokenIcon } from "../primitives/TokenIcon";

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: string;
}

export const NumberFormatCustom = React.forwardRef<
  NumberFormatProps,
  CustomProps
>(function NumberFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        if (values.value !== props.value)
          onChange({
            target: {
              name: props.name,
              value: values.value || "",
            },
          });
      }}
      thousandSeparator
      isNumericString
      allowNegative={false}
    />
  );
});

export interface Asset {
  balance?: string;
  symbol: string;
  iconSymbol?: string;
  address?: string;
  aToken?: boolean;
  priceInUsd?: string;
  decimals?: number;
}

export interface AssetInputProps<T extends Asset = Asset> {
  value: string;
  usdValue: string;
  symbol: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  disableInput?: boolean;
  onSelect?: (asset: T) => void;
  assets: T[];
  capType?: CapType;
  maxValue?: string;
  isMaxSelected?: boolean;
  inputTitle?: ReactNode;
  balanceText?: ReactNode;
  loading?: boolean;
  event?: any;
  selectOptionHeader?: ReactNode;
  selectOption?: (asset: T) => ReactNode;
  isCompound?: boolean;
  tokenBalance?: any;
}

export const AssetInput = <T extends Asset = Asset>({
  value,
  usdValue,
  symbol,
  onChange,
  disabled,
  disableInput,
  onSelect,
  assets,
  capType,
  maxValue,
  isMaxSelected,
  inputTitle,
  balanceText,
  loading = false,
  event,
  selectOptionHeader,
  selectOption,
  isCompound,
  tokenBalance,
}: AssetInputProps<T>) => {
  const theme = useTheme();

  const handleSelect = (event: SelectChangeEvent) => {
    const newAsset = assets.find(
      (asset) => asset.symbol === event.target.value,
    ) as T;
    onSelect && onSelect(newAsset);
    onChange && onChange("");
  };

  const asset =
    assets.length === 1
      ? assets[0]
      : assets && (assets.find((asset) => asset.symbol === symbol) as T);

  //  all relevant vaiables that are used in the return statement
  //  are declared here

  return (
    <div className="grid gap-4">
      {/* Display asset balance */}
      {isCompound ? (
        <div className="flex items-center justify-between gap-2">
          {/* Display balance text or default to "Balance" */}
          <p className="teaser-voice text-primary">Balance</p>
          {/* Display formatted asset balance */}
          <p className="solid-voice">
            <FormattedNumber value={tokenBalance} compact />
          </p>
        </div>
      ) : (
        asset.balance &&
        onChange && (
          <div className="flex items-center justify-between gap-2">
            {/* Display balance text or default to "Balance" */}
            {balanceText && balanceText !== "" ? (
              balanceText
            ) : (
              <p className="teaser-voice text-primary">Balance</p>
            )}
            {/* Display formatted asset balance */}
            <p className="solid-voice">
              <FormattedNumber
                value={isCompound ? tokenBalance : asset.balance}
                compact
              />
            </p>
          </div>
        )
      )}

      {/* Input section */}
      <div className="flex items-center justify-between gap-2">
        {/* Display input title or default to "Amount" */}
        {inputTitle ? (
          inputTitle
        ) : (
          <label htmlFor="modal-input" className="teaser-voice">
            Amount
          </label>
        )}
        {/* Display tooltip if capType is provided */}
        {/* {capType && <AvailableTooltip capType={capType} />} */}

        <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
          {/* Display loading indicator or input field */}
          {loading ? (
            <div>
              <CircularProgress color="inherit" size="16px" />
            </div>
          ) : (
            <div className="relative flex items-center gap-2">
              <InputBase
                id="modal-input"
                sx={{ flex: 1 }}
                placeholder="0.00"
                disabled={disabled || disableInput}
                value={value}
                autoFocus
                onChange={(e) => {
                  if (!onChange) return;
                  if (Number(e.target.value) > Number(maxValue)) {
                    onChange("-1");
                  } else {
                    onChange(e.target.value);
                  }
                }}
                inputProps={{
                  "aria-label": "amount input",
                }}
                inputComponent={NumberFormatCustom as any}
              />

              {/* Display max button if input is not disabled */}
              {!disableInput && (
                <button
                  className="whisper-voice button p-2 outline"
                  onClick={() => {
                    if (!onChange) return;
                    onChange("-1");
                  }}
                  disabled={disabled || isMaxSelected}
                >
                  <span>Max</span>
                </button>
              )}

              {/* Display clear button if value is not empty and input is not disabled */}
              {value !== "" && !disableInput && (
                <button
                  className="icon clear-icon-button"
                  onClick={() => {
                    onChange && onChange("");
                  }}
                  disabled={disabled}
                >
                  <ClearIcon height={16} />
                </button>
              )}
            </div>
          )}

          {/* Display asset symbol or asset selection dropdown */}
          {!onSelect || assets.length === 1 ? (
            <Box sx={{ display: "inline-flex", alignItems: "center" }} />
          ) : (
            <FormControl>
              <Select
                disabled={disabled}
                value={asset.symbol}
                onChange={handleSelect}
                variant="outlined"
                className="AssetInput__select"
                data-cy={"assetSelect"}
                MenuProps={{
                  sx: {
                    maxHeight: "240px",
                    ".MuiPaper-root": {
                      border:
                        theme.palette.mode === "dark"
                          ? "1px solid #EBEBED1F"
                          : "unset",
                      boxShadow: "0px 2px 10px 0px #0000001A",
                    },
                  },
                }}
                sx={{
                  p: 0,
                  "&.AssetInput__select .MuiOutlinedInput-input": {
                    p: 0,
                    backgroundColor: "transparent",
                    pr: "24px !important",
                  },
                  "&.AssetInput__select .MuiOutlinedInput-notchedOutline": {
                    display: "none",
                  },
                  "&.AssetInput__select .MuiSelect-icon": {
                    color: "text.primary",
                    right: "0%",
                  },
                }}
                renderValue={(symbol) => {
                  const asset =
                    assets.length === 1
                      ? assets[0]
                      : assets &&
                        (assets.find((asset) => asset.symbol === symbol) as T);
                  return (
                    <Box
                      sx={{ display: "flex", alignItems: "center" }}
                      data-cy={`assetsSelectedOption_${asset.symbol.toUpperCase()}`}
                    >
                      <TokenIcon
                        symbol={asset.iconSymbol || asset.symbol}
                        aToken={asset.aToken}
                        sx={{ mr: 2, ml: 4 }}
                      />
                      <Typography variant="main16" color="text.primary">
                        {symbol}
                      </Typography>
                    </Box>
                  );
                }}
              >
                {selectOptionHeader ? selectOptionHeader : undefined}
                {assets.map((asset) => (
                  <MenuItem
                    key={asset.symbol}
                    value={asset.symbol}
                    data-cy={`assetsSelectOption_${asset.symbol.toUpperCase()}`}
                  >
                    {selectOption ? (
                      selectOption(asset)
                    ) : (
                      <>
                        <TokenIcon
                          aToken={asset.aToken}
                          symbol={asset.iconSymbol || asset.symbol}
                          sx={{ fontSize: "22px", mr: 1 }}
                        />
                        <ListItemText sx={{ mr: 6 }}>
                          {asset.symbol}
                        </ListItemText>
                        {asset.balance && (
                          <FormattedNumber value={asset.balance} compact />
                        )}
                      </>
                    )}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
      </div>

      {!isCompound && (
        <div className="flex items-center justify-between">
          <p className="teaser-voice">value</p>
          {/* Display USD value */}
          {loading ? (
            <Box sx={{ flex: 1 }} />
          ) : (
            <p className="solid-voice">
              <FormattedNumber
                value={isNaN(Number(usdValue)) ? 0 : Number(usdValue)}
                compact
                symbol="USD"
                variant="secondary12"
                color="text.muted"
                symbolsColor="text.muted"
                flexGrow={1}
              />
            </p>
          )}
        </div>
      )}
    </div>
  );
};
