/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { RenderResult } from "@testing-library/react";
import type { ApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import { getApplicationBuilder } from "../../../renderer/components/test-utils/get-application-builder";
import React from "react";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { CallForResource } from "../../../renderer/components/dock/edit-resource/edit-resource-model/call-for-resource/call-for-resource.injectable";
import callForResourceInjectable from "../../../renderer/components/dock/edit-resource/edit-resource-model/call-for-resource/call-for-resource.injectable";
import directoryForLensLocalStorageInjectable from "../../../common/directory-for-lens-local-storage/directory-for-lens-local-storage.injectable";
import hostedClusterIdInjectable from "../../../renderer/cluster-frame-context/hosted-cluster-id.injectable";
import { controlWhenStoragesAreReady } from "../../../renderer/utils/create-storage/storages-are-ready";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import { TabKind } from "../../../renderer/components/dock/dock/store";
import { Namespace } from "../../../common/k8s-api/endpoints";

jest.mock("../../../renderer/components/tooltip/withTooltip", () => ({
  withTooltip:
    (Target: any) =>
      ({ tooltip, ...props }: any) => {
        if (tooltip) {
          const testId = props["data-testid"];

          return (
            <>
              <Target
                tooltip={tooltip.children ? undefined : tooltip}
                {...props}
              />
              <div data-testid={testId && `tooltip-content-for-${testId}`}>
                {tooltip.children || tooltip}
              </div>
            </>
          );
        }

        return <Target {...props} />;
      },
}));

describe("cluster/namespaces - edit namespaces from previously opened tab", () => {
  let builder: ApplicationBuilder;
  let callForNamespaceMock: AsyncFnMock<CallForResource>;
  let storagesAreReady: () => Promise<void>;

  beforeEach(() => {
    builder = getApplicationBuilder();

    builder.setEnvironmentToClusterFrame();

    callForNamespaceMock = asyncFn();

    builder.beforeApplicationStart(({ rendererDi }) => {
      rendererDi.override(
        directoryForLensLocalStorageInjectable,
        () => "/some-directory-for-lens-local-storage",
      );

      rendererDi.override(hostedClusterIdInjectable, () => "some-cluster-id");

      storagesAreReady = controlWhenStoragesAreReady(rendererDi);

      rendererDi.override(callForResourceInjectable, () => callForNamespaceMock);
    });

    builder.allowKubeResource("namespaces");
  });

  describe("given tab was previously opened, when application is started", () => {
    let rendered: RenderResult;

    beforeEach(async () => {
      const writeJsonFile = builder.dis.rendererDi.inject(writeJsonFileInjectable);

      writeJsonFile(
        "/some-directory-for-lens-local-storage/some-cluster-id.json",
        {
          dock: {
            height: 300,
            tabs: [
              {
                id: "some-first-tab-id",
                kind: TabKind.EDIT_RESOURCE,
                title: "Namespace: some-namespace",
                pinned: false,
              },
            ],

            isOpen: true,
          },

          edit_resource_store: {
            "some-first-tab-id": {
              resource: "/apis/some-api-version/namespaces/some-uid",
              draft: "some-saved-configuration",
            },
          },
        },
      );

      rendered = await builder.render();

      await storagesAreReady();
    });

    fit("renders", () => {
      expect(rendered.baseElement).toMatchSnapshot();
    });

    fit("shows dock tab for editing namespace", () => {
      expect(
        rendered.getByTestId("dock-tab-for-some-first-tab-id"),
      ).toBeInTheDocument();
    });

    fit("shows spinner in the dock tab", () => {
      expect(
        rendered.getByTestId("edit-resource-tab-spinner"),
      ).toBeInTheDocument();
    });

    fit("calls for namespace", () => {
      expect(callForNamespaceMock).toHaveBeenCalledWith(
        "/apis/some-api-version/namespaces/some-uid",
      );
    });

    describe("when call for namespace resolves with namespace", () => {
      let someNamespace: Namespace;

      beforeEach(async () => {
        someNamespace = new Namespace({
          apiVersion: "some-api-version",
          kind: "Namespace",

          metadata: {
            uid: "some-uid",
            name: "some-name",
            resourceVersion: "some-resource-version",
            selfLink: "/apis/some-api-version/namespaces/some-uid",
            somePropertyToBeRemoved: "some-value",
            somePropertyToBeChanged: "some-old-value",
          },
        });

        await callForNamespaceMock.resolve({
          callWasSuccessful: true,
          response: someNamespace,
        });
      });

      fit("renders", () => {
        expect(rendered.baseElement).toMatchSnapshot();
      });

      fit("has the saved configuration in editor", () => {
        const input = rendered.getByTestId(
          "monaco-editor-for-some-first-tab-id",
        ) as HTMLTextAreaElement;

        expect(input.value).toBe("some-saved-configuration");
      });
    });
  });
});
