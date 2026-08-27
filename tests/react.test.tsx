import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import { renderHranessSiteFooter } from "../src/index.js";
import { HranessSiteFooter } from "../src/react.js";

test("the React adapter renders the exact static contract", () => {
  expect(renderToStaticMarkup(<HranessSiteFooter />)).toBe(renderHranessSiteFooter());
  expect(renderToStaticMarkup(<HranessSiteFooter showBrand={false} />)).toBe(
    renderHranessSiteFooter({ showBrand: false }),
  );
});
