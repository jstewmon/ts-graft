import { dirname } from "path";
import readPkgUp from "read-pkg-up";
import resolveCwd from "resolve-cwd";
import {
  InterfaceDeclaration,
  Node,
  Project,
  Structure,
  SyntaxKind,
  TypeAliasDeclaration,
  SourceFile,
} from "ts-morph";
import { Config } from "./config";
export * as config from "./config";

interface GraftParams {
  project?: Project;
  config: Config;
}

interface GraftFileParams {
  project: Project;
  options: GraftFileOptions;
}

interface GraftFileOptions {
  source: string;
  output: string;
  include: string[];
}

interface ResolveNodesParams {
  source: SourceFile;
  output: SourceFile;
  include: string[];
}

export default {
  async graft(params: GraftParams): Promise<void> {
    const {
      project = new Project({ skipAddingFilesFromTsConfig: true }),
      config,
    } = params;
    await Promise.all(
      config.grafts.map((options) =>
        this.graftFile({ project, options }).then((outputFile) =>
          outputFile.save()
        )
      )
    );
  },

  async graftFile(params: GraftFileParams): Promise<SourceFile> {
    const {
      project,
      options: { source, include, output },
    } = params;
    const sourceFilename = resolveCwd(source);
    const {
      packageJson: { name: packageName, version: packageVersion } = {
        name: "unknown",
        version: "unknown",
      },
    } = (await readPkgUp({ cwd: dirname(sourceFilename) })) || {};
    const inputSourceFile = project.addSourceFileAtPath(sourceFilename);
    const outputSourceFile = project.createSourceFile(output, undefined, {
      overwrite: true,
    });
    outputSourceFile.addStatements([
      `// Generated by resolving ${source} from ${packageName}@${packageVersion}`,
    ]);
    this.graftNodes({
      source: inputSourceFile,
      output: outputSourceFile,
      include,
    });
    return outputSourceFile;
  },

  graftNodes(params: ResolveNodesParams): void {
    const { source, output, include } = params;
    const resolvedNodes = new Set<
      InterfaceDeclaration | TypeAliasDeclaration
    >();
    const unresolvedNodes = new Set<
      InterfaceDeclaration | TypeAliasDeclaration
    >(
      include.map((type) => {
        const node = source.getInterface(type) ?? source.getTypeAlias(type);
        if (!node) {
          throw new Error(
            `${type} does not refer to an interface or type alias`
          );
        }
        return node;
      })
    );

    while (unresolvedNodes.size > 0) {
      for (const node of unresolvedNodes.values()) {
        unresolvedNodes.delete(node);
        resolvedNodes.add(node);

        // Declarations in lib files are never exported because they are globally
        // available. Since we extract the types to a module, we export them.
        node.setIsExported(true);

        // Find all descendant identifiers which reference an interface or type
        // alias, and add them to the unresolved list.
        for (const id of node.getDescendantsOfKind(SyntaxKind.Identifier)) {
          for (const dn of id.getDefinitionNodes()) {
            if (
              Node.isInterfaceDeclaration(dn) ||
              Node.isTypeAliasDeclaration(dn)
            ) {
              if (!resolvedNodes.has(dn)) {
                unresolvedNodes.add(dn);
              }
            }
          }
        }
      }
    }

    const resolvedStructures = Array.from(resolvedNodes).map((node) =>
      node.getStructure()
    );
    output.addInterfaces(resolvedStructures.filter(Structure.isInterface));
    output.addTypeAliases(resolvedStructures.filter(Structure.isTypeAlias));
  },
};