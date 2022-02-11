/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, when } from "mobx";
import type { TabId } from "../dock/store";
import type { DockTabStoreOptions } from "../dock-tab.store";
import { DockTabStore } from "../dock-tab.store";
import { getChartDetails, getChartValues } from "../../../../common/k8s-api/endpoints";
import type { IReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints";

export interface IChartInstallData {
  name: string;
  repo: string;
  version: string;
  values?: string;
  releaseName?: string;
  description?: string;
  namespace?: string;
  lastVersion?: boolean;
}

interface Dependencies {
  readonly versionsStore: DockTabStore<string[]>;
  readonly detailsStore: DockTabStore<IReleaseUpdateDetails>;
}

export class InstallChartTabStore extends DockTabStore<IChartInstallData> {
  constructor(protected readonly dependencies: Dependencies, opts: DockTabStoreOptions<IChartInstallData>) {
    super(opts);
    makeObservable(this);
  }

  get versions() {
    return this.dependencies.versionsStore;
  }

  get details() {
    return this.dependencies.detailsStore;
  }

  @action
  async loadData(tabId: string) {
    const promises = [];

    await when(() => this.isReady(tabId));

    if (!this.getData(tabId).values) {
      promises.push(this.loadValues(tabId));
    }

    if (!this.versions.getData(tabId)) {
      promises.push(this.loadVersions(tabId));
    }

    await Promise.all(promises);
  }

  @action
  async loadVersions(tabId: TabId) {
    const { repo, name, version } = this.getData(tabId);

    this.versions.clearData(tabId); // reset
    const charts = await getChartDetails(repo, name, { version });
    const versions = charts.versions.map(chartVersion => chartVersion.version);

    this.versions.setData(tabId, versions);
  }

  @action
  async loadValues(tabId: TabId, attempt = 0): Promise<void> {
    const data = this.getData(tabId);
    const { repo, name, version } = data;
    const values = await getChartValues(repo, name, version);

    if (values) {
      this.setData(tabId, { ...data, values });
    } else if (attempt < 4) {
      return this.loadValues(tabId, attempt + 1);
    }
  }
}
