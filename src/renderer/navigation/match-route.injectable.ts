/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { matchPath, type RouteProps, type match } from "react-router";
import observableHistoryInjectable from "./observable-history.injectable";

export type MatchRoute = <Params extends { [K in keyof Params]?: string }>(route: string | string[] | RouteProps) => match<Params> | null;

const matchRouteInjectable = getInjectable({
  id: "match-route",
  instantiate: (di): MatchRoute => {
    const navigation = di.inject(observableHistoryInjectable);

    return (route) => matchPath(navigation.location.pathname, route);
  },
});

export default matchRouteInjectable;
