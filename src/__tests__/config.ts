import * as config from "../config";
describe("schema", () => {
  const source = "foo.d.ts";
  const output = "foo.ts";
  const include = ["Foo"];

  test("parses valid input", () => {
    const input = {
      grafts: [{ source, output, include }],
    };
    const actual = config.schema.parse(input);
    expect(actual).toMatchObject(input);
  });

  test.each([
    [
      "missing grafts",
      {},
      {
        errors: [
          { code: "invalid_type", path: ["grafts"], message: "Required" },
        ],
      },
    ],
    [
      "missing graft source",
      { grafts: [{ output, include }] },
      {
        errors: [
          {
            code: "invalid_type",
            path: ["grafts", 0, "source"],
            message: "Required",
          },
        ],
      },
    ],
    [
      "missing graft output",
      { grafts: [{ source, include }] },
      {
        errors: [
          {
            code: "invalid_type",
            path: ["grafts", 0, "output"],
            message: "Required",
          },
        ],
      },
    ],
    [
      "missing graft include",
      { grafts: [{ source, output }] },
      {
        errors: [
          {
            code: "invalid_type",
            path: ["grafts", 0, "include"],
            message: "Required",
          },
        ],
      },
    ],
    [
      "empty graft include",
      { grafts: [{ source, output, include: [] }] },
      {
        errors: [
          {
            code: "too_small",
            path: ["grafts", 0, "include"],
            message: "Should have at least 1 items",
          },
        ],
      },
    ],
  ])("throws for input with %s", (reason, input, expected) => {
    try {
      config.schema.parse(input);
      fail("should have thrown");
    } catch (err) {
      expect(err).toMatchObject(expected);
    }
  });
});
