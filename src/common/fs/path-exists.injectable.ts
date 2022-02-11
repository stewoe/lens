/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type PathExists = (path: string) => Promise<boolean>;

const pathExistsInjectable = getInjectable({
  instantiate: (di): PathExists => di.inject(fsInjectable).pathExists,
  id: "path-exists",
});

export default pathExistsInjectable;
