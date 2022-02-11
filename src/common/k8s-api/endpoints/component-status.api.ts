/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import { KubeApi, type DerivedKubeApiOptions } from "../kube-api";

export interface IComponentStatusCondition {
  type: string;
  status: string;
  message: string;
}

export interface ComponentStatus {
  conditions: IComponentStatusCondition[];
}

export class ComponentStatus extends KubeObject {
  static kind = "ComponentStatus";
  static namespaced = false;
  static apiBase = "/api/v1/componentstatuses";

  getTruthyConditions() {
    return this.conditions.filter(c => c.status === "True");
  }
}

export class ComponentStatusApi extends KubeApi<ComponentStatus> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: ComponentStatus,
    });
  }
}
