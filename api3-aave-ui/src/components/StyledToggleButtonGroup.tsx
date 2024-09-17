import {
  styled,
  ToggleButtonGroup,
  ToggleButtonGroupProps,
} from "@mui/material";

const CustomToggleGroup = styled(ToggleButtonGroup)<ToggleButtonGroupProps>({
  border: "1px solid var(--color)",
  padding: "4px",
}) as typeof ToggleButtonGroup;

const CustomTxModalToggleGroup = styled(
  ToggleButtonGroup,
)<ToggleButtonGroupProps>(({ theme }) => ({
  border: "1px solid var(--color)",

  padding: "2px",
  width: "100%",
})) as typeof ToggleButtonGroup;

export function StyledTxModalToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomTxModalToggleGroup {...props} />;
}

export default function StyledToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomToggleGroup {...props} />;
}
