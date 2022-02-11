/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../../../../common/logger/child-logger.injectable";

const kubeconfigSyncManagerLoggerInjectable = getInjectable({
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "KUBECONFIG-SYNC",
  }),
  id: "kubeconfig-sync-manager-logger",
});

export default kubeconfigSyncManagerLoggerInjectable;
