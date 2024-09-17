import { Warning } from "src/components/primitives/Warning";

export const ParameterChangewarning = ({
  underlyingAsset,
}: {
  underlyingAsset: string;
}) => {
  return (
    <Warning severity="info" sx={{ my: 6 }}>
      <p className="text-step--1">
        <strong>Attention:</strong> Parameter changes via governance can alter
        your account health factor and risk of liquidation. Follow the{" "}
        <a href="#"></a> for updates.
      </p>
    </Warning>
  );
};
