/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { sendToAgnosticChannelInjectionToken } from "../../common/channel/send-to-agnostic-channel-injection-token";
import askBooleanQuestionChannelInjectable from "../../common/ask-boolean/ask-boolean-question-channel.injectable";
import askBooleanPromiseInjectable from "./ask-boolean-promise.injectable";

export type AskBoolean = ({
  id,
  title,
  question,
}: {
  id: string;
  title: string;
  question: string;
}) => Promise<boolean>;

const askBooleanInjectable = getInjectable({
  id: "ask-boolean",

  instantiate: (di): AskBoolean => {
    const sendToAgnosticChannel = di.inject(sendToAgnosticChannelInjectionToken);
    const askBooleanChannel = di.inject(askBooleanQuestionChannelInjectable);

    return async ({ id, title, question }) => {
      const returnValuePromise = di.inject(askBooleanPromiseInjectable, id);

      returnValuePromise.clear();

      await sendToAgnosticChannel(askBooleanChannel, { id, title, question });

      return await returnValuePromise.promise;
    };
  },
});

export default askBooleanInjectable;
