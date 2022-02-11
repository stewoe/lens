/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { PodMetricsApi } from "./pod-metrics.api";

const podMetricsApiInjectable = getInjectable({
  id: "pod-metrics-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new PodMetricsApi();
  },
});

export default podMetricsApiInjectable;
