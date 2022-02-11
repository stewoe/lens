/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import persistentVolumeClaimApiInjectable from "../../../common/k8s-api/endpoints/persistent-volume-claim.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { PersistentVolumeClaimStore } from "./store";

const persistentVolumeClaimStoreInjectable = getInjectable({
  id: "persistent-volume-claim-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(persistentVolumeClaimApiInjectable);

    return new PersistentVolumeClaimStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default persistentVolumeClaimStoreInjectable;
