import { parse } from "acorn-loose";
import { parse as parseStrict } from "acorn";
import * as walk from "acorn-walk";

export interface NeuralNode {
  id: number;
  type: "function" | "class" | "file";
  name: string;
  file: string;
}

export interface NeuralEdge {
  from: number;
  to: number;
}

export interface NeuralBlueprint {
  imports: { source: string; names: string[] }[];
  exports: string[];
  nodes: NeuralNode[];
  edges: NeuralEdge[];
  unparseableChunks?: { chunk: string; startLine: number; endLine: number; contextWindow: string }[];
  requiresDeepCompute?: boolean;
}

export class NeuralCodeMapper {
  public extractAnomalyContext(payload: string): string {
    const lines = payload.split('\n');
    const unknownIndex = lines.findIndex(line => line.includes('[UNKNOWN_CHUNK]'));
    if (unknownIndex === -1) return payload;
    const startLine = Math.max(0, unknownIndex - 50);
    const endLine = Math.min(lines.length - 1, unknownIndex + 50);
    return lines.slice(startLine, endLine + 1).join('\n');
  }

  private nodeIdCounter = 1;
  private nodes: Map<string, NeuralNode> = new Map();
  private edges: NeuralEdge[] = [];

  constructor() {}

  private generateId(): number {
    const id = this.nodeIdCounter;
    this.nodeIdCounter += 1;
    return id;
  }

  private normalizePath(rawPath: string): string {
    if (rawPath.startsWith("../../")) {
      return rawPath.replace(/^(?:\.\.\/)+/, "@lextit/");
    }
    return rawPath;
  }

  private regexFallbackParser(filePath: string, code: string): NeuralBlueprint {
    const fileNode: NeuralNode = {
      id: this.generateId(),
      type: "file",
      name: filePath,
      file: filePath,
    };

    const localNodes: NeuralNode[] = [fileNode];
    const imports: { source: string; names: string[] }[] = [];
    const exports: string[] = [];

    // Simple regex parser for python and other languages
    const importRegex = /^(?:import|from)\s+([a-zA-Z0-9_.]+)/gm;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      imports.push({ source: match[1], names: [] });
    }

    const funcRegex = /^(?:def|function)\s+([a-zA-Z0-9_]+)/gm;
    while ((match = funcRegex.exec(code)) !== null) {
      localNodes.push({
        id: this.generateId(),
        type: "function",
        name: match[1],
        file: filePath,
      });
    }

    const classRegex = /^(?:class)\s+([a-zA-Z0-9_]+)/gm;
    while ((match = classRegex.exec(code)) !== null) {
      localNodes.push({
        id: this.generateId(),
        type: "class",
        name: match[1],
        file: filePath,
      });
    }

    return {
      imports,
      exports,
      nodes: localNodes,
      edges: [],
    };
  }

  public mapFile(filePath: string, code: string): NeuralBlueprint {
    let requiresDeepCompute = false;
    let unparseableChunks: { chunk: string; startLine: number; endLine: number; contextWindow: string }[] = [];

    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const unknownTypes = ['pdf', 'png', 'jpg', 'jpeg', 'mp4', 'mkv', 'webm', 'exe', 'bin'];

    if (unknownTypes.includes(ext)) {
        requiresDeepCompute = true;
        return {
            imports: [], exports: [], nodes: [], edges: [],
            unparseableChunks, requiresDeepCompute
        };
    }

    if (filePath.endsWith(".py") || filePath.endsWith(".rb") || filePath.endsWith(".go")) {
      const fallback = this.regexFallbackParser(filePath, code);
      return { ...fallback, unparseableChunks, requiresDeepCompute };
    }

    let codeToParse = code;
    const lines = code.split('\n');

    for (let i = 0; i < 6; i++) {
        try {
            parseStrict(codeToParse, { ecmaVersion: "latest", sourceType: "module" });
            break;
        } catch (e: any) {
            if (e.loc && typeof e.loc.line === 'number') {
                const errLine = e.loc.line - 1;
                const startLine = Math.max(0, errLine - 50);
                const endLine = Math.min(lines.length - 1, errLine + 50);
                const contextWindow = lines.slice(startLine, endLine + 1).join('\n');
                const chunk = lines[errLine];
                console.log(`[Lextit Triage] Unparseable chunk detected. Quarantining puzzle piece from line ${startLine} to line ${endLine}. Relativistic constraints applied.`);

                unparseableChunks.push({
                    chunk: "[UNKNOWN_CHUNK]: " + chunk,
                    startLine,
                    endLine,
                    contextWindow
                });

                if (unparseableChunks.length > 5 || unparseableChunks.length > (lines.length * 0.3)) {
                    requiresDeepCompute = true;
                    break;
                }

                const linesCopy = codeToParse.split('\n');
                linesCopy[errLine] = "// [UNKNOWN_CHUNK_REMOVED]";
                codeToParse = linesCopy.join('\n');
            } else {
                break;
            }
        }
    }

    try {
      const ast = parse(codeToParse, { ecmaVersion: "latest", sourceType: "module" });

      const fileNode: NeuralNode = {
        id: this.generateId(),
        type: "file",
        name: filePath,
        file: filePath,
      };

      this.nodes.set(`file:${filePath}`, fileNode);

      const imports: { source: string; names: string[] }[] = [];
      const exports: string[] = [];

      const localNodes: NeuralNode[] = [fileNode];
      const localEdges: NeuralEdge[] = [];

      const declaredNodes = new Map<string, NeuralNode>();

      walk.simple(ast, {
        ImportDeclaration: (node: any) => {
          const source = this.normalizePath(node.source.value);
          const names = node.specifiers.map((s: any) => s.local ? s.local.name : (s.imported ? s.imported.name : ''));
          imports.push({ source, names });
        },
        CallExpression: (node: any) => {
          if (node.callee.type === "Identifier" && node.callee.name === "require") {
            if (node.arguments.length > 0 && node.arguments[0].type === "Literal") {
              const source = this.normalizePath(node.arguments[0].value);
              imports.push({ source, names: [] });
            }
          }
        },
        FunctionDeclaration: (node: any) => {
          if (node.id) {
            const funcNode: NeuralNode = {
              id: this.generateId(),
              type: "function",
              name: node.id.name,
              file: filePath,
            };
            declaredNodes.set(node.id.name, funcNode);
            localNodes.push(funcNode);
            this.nodes.set(`func:${filePath}:${node.id.name}`, funcNode);
          }
        },
        VariableDeclarator: (node: any) => {
          if (node.init && (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression") && node.id.type === "Identifier") {
            const funcNode: NeuralNode = {
              id: this.generateId(),
              type: "function",
              name: node.id.name,
              file: filePath,
            };
            declaredNodes.set(node.id.name, funcNode);
            localNodes.push(funcNode);
            this.nodes.set(`func:${filePath}:${node.id.name}`, funcNode);
          }
        },
        ClassDeclaration: (node: any) => {
          if (node.id) {
            const classNode: NeuralNode = {
              id: this.generateId(),
              type: "class",
              name: node.id.name,
              file: filePath,
            };
            declaredNodes.set(node.id.name, classNode);
            localNodes.push(classNode);
            this.nodes.set(`class:${filePath}:${node.id.name}`, classNode);
          }
        },
        ExportNamedDeclaration: (node: any) => {
          if (node.declaration) {
            if (node.declaration.type === "VariableDeclaration") {
              for (const decl of node.declaration.declarations) {
                if (decl.id.type === "Identifier") {
                  exports.push(decl.id.name);
                }
              }
            } else if (node.declaration.type === "FunctionDeclaration" || node.declaration.type === "ClassDeclaration") {
              if (node.declaration.id) {
                exports.push(node.declaration.id.name);
              }
            }
          }
          for (const spec of node.specifiers) {
            if (spec.exported) {
              exports.push(spec.exported.name);
            }
          }
        },
        ExportDefaultDeclaration: (node: any) => {
          if (node.declaration && node.declaration.id) {
            exports.push(node.declaration.id.name);
          } else {
            exports.push("default");
          }
        },
        AssignmentExpression: (node: any) => {
          if (node.left.type === "MemberExpression" && node.left.object.name === "module" && node.left.property.name === "exports") {
            if (node.right.type === "ObjectExpression") {
               for (const prop of node.right.properties) {
                 if (prop.key && prop.key.type === "Identifier") {
                   exports.push(prop.key.name);
                 }
               }
            } else if (node.right.type === "Identifier") {
               exports.push(node.right.name);
            }
          } else if (node.left.type === "MemberExpression" && node.left.object.type === "MemberExpression" && node.left.object.object.name === "module" && node.left.object.property.name === "exports") {
            if (node.left.property.type === "Identifier") {
               exports.push(node.left.property.name);
            }
          } else if (node.left.type === "MemberExpression" && node.left.object.name === "exports") {
            if (node.left.property.type === "Identifier") {
               exports.push(node.left.property.name);
            }
          }
        }
      });

      walk.ancestor(ast, {
        CallExpression: (node: any, state: any, ancestors: any[]) => {
          if (node.callee.type === "Identifier" && node.callee.name !== "require") {
            const calleeName = node.callee.name;

            let callerNode: NeuralNode | null = null;
            for (let i = ancestors.length - 1; i >= 0; i--) {
              const ancestor = ancestors[i];
              if (ancestor.type === "FunctionDeclaration" && ancestor.id) {
                callerNode = declaredNodes.get(ancestor.id.name) || null;
                break;
              } else if (ancestor.type === "VariableDeclarator" && ancestor.id.type === "Identifier" && ancestor.init && (ancestor.init.type === "ArrowFunctionExpression" || ancestor.init.type === "FunctionExpression")) {
                callerNode = declaredNodes.get(ancestor.id.name) || null;
                break;
              } else if (ancestor.type === "ClassDeclaration" && ancestor.id) {
                callerNode = declaredNodes.get(ancestor.id.name) || null;
                break;
              }
            }

            if (!callerNode) {
              callerNode = fileNode;
            }

            const calleeNode = declaredNodes.get(calleeName);
            if (calleeNode) {
              const edge: NeuralEdge = { from: callerNode.id, to: calleeNode.id };
              localEdges.push(edge);
              this.edges.push(edge);
            }
          }
        }
      });

      return {
        imports,
        exports,
        nodes: localNodes,
        edges: localEdges,
        unparseableChunks,
        requiresDeepCompute
      };
    } catch (e) {
      // Fallback in case acorn completely fails
      const fallback = this.regexFallbackParser(filePath, code);
      return { ...fallback, unparseableChunks, requiresDeepCompute };
    }
  }

  public generateMicroSummary(blueprint: NeuralBlueprint): string {
    let summary = "NEURAL_MAP:\n";
    if (blueprint.requiresDeepCompute) {
      summary += "REQUIRES_DEEP_COMPUTE: true\n";
    }
    if (blueprint.unparseableChunks && blueprint.unparseableChunks.length > 0) {
      summary += "UNPARSEABLE_CHUNKS:\n";
      for (const chunk of blueprint.unparseableChunks) {
        summary += `[UNKNOWN_CHUNK] at line ${chunk.startLine}-${chunk.endLine}:\n${chunk.contextWindow}\n`;
      }
    }
    summary += "NODES:\n";
    for (const node of blueprint.nodes) {
      summary += `${node.id}:${node.type}:${node.name}(${node.file})\n`;
    }
    summary += "EDGES:\n";
    for (const edge of blueprint.edges) {
      summary += `${edge.from}->${edge.to}\n`;
    }
    return summary;
  }
}
