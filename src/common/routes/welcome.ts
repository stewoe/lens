/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteProps } from "react-router";
import { buildURL } from "../utils";

export const welcomeRoute: RouteProps = {
  path: "/welcome",
};

export const welcomeURL = buildURL(welcomeRoute.path);
