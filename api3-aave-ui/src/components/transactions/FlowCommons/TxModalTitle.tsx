import { Typography } from "@mui/material";
import { ReactNode } from "react";

export type TxModalTitleProps = {
  title: ReactNode;
  symbol?: string;
};

export const TxModalTitle = ({ title, symbol }: TxModalTitleProps) => {
  return (
    <h2 className="attention-voice">
      {title} {symbol ?? ""}
    </h2>
  );
};
