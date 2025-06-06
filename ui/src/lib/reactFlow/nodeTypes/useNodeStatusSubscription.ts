import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@flow/lib/auth";
import { OnNodeStatusChangeSubscription } from "@flow/lib/gql/__gen__/graphql";
import { toNodeStatus } from "@flow/lib/gql/convert";
import { useSubscription } from "@flow/lib/gql/subscriptions/useSubscription";
import { useSubscriptionSetup } from "@flow/lib/gql/subscriptions/useSubscriptionSetup";
import { JobState } from "@flow/stores";
import type { Job } from "@flow/types";

// TODO: Note that this might be unnecessary eventually, so delete if deemed so @KaWaite
export default ({
  id,
  debugJobState,
  debugRun,
}: {
  id: string;
  debugJobState: JobState | undefined;
  debugRun: Job | undefined;
}) => {
  const { getAccessToken } = useAuth();
  const [accessToken, setAccessToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!accessToken) {
      (async () => {
        const token = await getAccessToken();
        setAccessToken(token);
      })();
    }
  }, [accessToken, getAccessToken]);

  const subscriptionVariables = useMemo(
    () => ({ jobId: debugJobState?.jobId, nodeId: id }),
    [debugJobState?.jobId, id],
  );

  // TODO: Update here when generated code is available for node status
  const subscriptionDataFormatter = useCallback(
    (data: OnNodeStatusChangeSubscription) => {
      return toNodeStatus(data.nodeStatus);
    },
    [],
  );

  useSubscriptionSetup<OnNodeStatusChangeSubscription>(
    "GetSubscribedNodeStatus",
    accessToken,
    subscriptionVariables,
    id,
    subscriptionDataFormatter,
    !id || !debugRun,
  );

  const { data: realTimeNodeStatus } = useSubscription(
    "GetSubscribedNodeStatus",
    id,
    !id || !debugRun,
  );
  return {
    realTimeNodeStatus,
  };
};
