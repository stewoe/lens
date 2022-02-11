/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { StorageClass, StorageClassApi } from "../../../common/k8s-api/endpoints";
import type { PersistentVolumeStore } from "../+storage-volumes/store";

interface Dependencies {
  readonly persistentVolumesStore: PersistentVolumeStore;
}

export class StorageClassStore extends KubeObjectStore<StorageClass, StorageClassApi> {
  constructor(protected readonly dependencies: Dependencies, api: StorageClassApi) {
    super(api);
    autoBind(this);
  }

  getPersistentVolumes(storageClass: StorageClass) {
    return this.dependencies.persistentVolumesStore.getByStorageClass(storageClass);
  }
}
