/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import type { Cluster } from "../../../common/clusters/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface DeleteClusterDialogState {
  config: KubeConfig;
  cluster: Cluster;
}

const deleteClusterDialogStateInjectable = getInjectable({
  instantiate: () => observable.box<DeleteClusterDialogState | undefined>(),
  id: "delete-cluster-dialog-state",
});

export default deleteClusterDialogStateInjectable;
