import { readFileSync } from "fs";
import readPkgUp from "read-pkg-up";
import resolveCwd from "resolve-cwd";
import { mocked } from "ts-jest/utils";
import { Project, SourceFile, Node } from "ts-morph";
import graft from "../index";

jest.mock("read-pkg-up");
jest.mock("resolve-cwd");
const mockedReadPkgUp = mocked(readPkgUp);
const mockedResolveCwd = mocked(resolveCwd);

let project: Project;
let source: SourceFile;
beforeEach(() => {
  project = new Project({
    useInMemoryFileSystem: true,
    skipLoadingLibFiles: true,
  });

  project
    .getFileSystem()
    .writeFileSync(
      "lib.d.ts",
      readFileSync(`${__dirname}/lib.d.ts`, { encoding: "utf8" })
    );

  source = project.addSourceFileAtPath("lib.d.ts");
});

describe("graft", () => {
  const config = {
    grafts: [{ source: "lib.d.ts", output: "lib.ts", include: [] }],
  };

  test("graft threads project to graftFile", async () => {
    const spy = jest
      .spyOn(graft, "graftFile")
      .mockImplementation(async (params) => {
        expect(params.project).toBe(project);
        // TODO: this pollutes file system
        return params.project.createSourceFile("foo", undefined, {
          overwrite: true,
        });
      });
    await graft.graft({ project, config });
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ project }));
  });

  test("graft creates project if not given", async () => {
    const spy = jest
      .spyOn(graft, "graftFile")
      .mockImplementation(async (params) => {
        expect(params.project).toBeInstanceOf(Project);
        expect(params.project.getSourceFiles().length).toBe(0);
        return params.project.createSourceFile("foo", undefined, {
          overwrite: true,
        });
      });
    await graft.graft({ config });
    expect(spy).toHaveBeenCalled();
  });

  test("graft calls save on output", async () => {
    let saveSpy;
    jest.spyOn(graft, "graftFile").mockImplementation(async (params) => {
      expect(params.project).toBeInstanceOf(Project);
      const output = params.project.createSourceFile("foo", undefined, {
        overwrite: true,
      });
      saveSpy = jest.spyOn(output, "save").mockResolvedValue();
      return output;
    });
    await graft.graft({ config });
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });
});

describe("graftFile", () => {
  test("adds leading comment to output", async () => {
    mockedReadPkgUp.mockResolvedValue({
      packageJson: {
        name: "ts-graft",
        version: "0.0.0",
      },
      path: "test",
    });
    mockedResolveCwd.mockImplementation((request: string) => request);

    const output = await graft.graftFile({
      project,
      options: { source: "lib.d.ts", output: "comment.ts", include: [] },
    });
    expect(output.getFullText()).toBe(
      "// Generated by resolving lib.d.ts from ts-graft@0.0.0\n"
    );
  });
});

describe("graftNodes", () => {
  let output: SourceFile;

  beforeEach(() => {
    output = project.createSourceFile("lib.ts", undefined, { overwrite: true });
  });

  test.each([
    ["var", "foo"],
    ["function", "getBar"],
    ["class", "Class"],
  ])("throws when include refers to %s", (type, symbol) => {
    expect(() =>
      graft.graftNodes({ source, output, include: [symbol] })
    ).toThrowError(`${symbol} does not refer to an interface or type alias`);
  });

  test.each([
    [
      ["Foo"],
      {
        interface: new Set(["Foo", "Bar"]),
        typeAlias: new Set(["Baz", "Qux"]),
      },
    ],
    [
      ["Callable"],
      {
        interface: new Set(["Callable"]),
        typeAlias: new Set(["Baz", "Qux"]),
      },
    ],
  ])("exports all types referenced by %j", (include, expected) => {
    const actual = {
      interface: new Set<string>(),
      typeAlias: new Set<string>(),
    };
    graft.graftNodes({ source, output, include });
    // the first child is a SyntaxList whose children are the declarations
    for (const child of output.getFirstChild()?.getChildren() ?? []) {
      if (Node.isInterfaceDeclaration(child)) {
        actual.interface.add(child.getName());
      } else if (Node.isTypeAliasDeclaration(child)) {
        actual.typeAlias.add(child.getName());
      } else {
        fail(`unexpected child in output: ${output.getText()}`);
      }
      expect(child.isExported()).toBe(true);
    }
    expect(actual).toMatchObject(expected);
  });
});
