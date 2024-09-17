import { useQuery } from "@tanstack/react-query";
import { useSharedDependencies } from "src/ui-config/SharedDependenciesProvider";
import { POLLING_INTERVAL, QueryKeys } from "src/ui-config/queries";

export const useGeneralStakeUiData = () => {
  const { uiStakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => uiStakeDataService.getGeneralStakeUIDataHumanized(),
    queryKey: [QueryKeys.GENERAL_STAKE_UI_DATA, uiStakeDataService.toHash()],
    refetchInterval: POLLING_INTERVAL,
  });
};
