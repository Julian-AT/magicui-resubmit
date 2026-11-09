import ts from "typescript-api";

export const parseTsx = (source: string, file = "component.tsx") =>
  ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
export function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => walk(child, visit));
}
export function stringValue(node: ts.Node | undefined): string | undefined {
  return node && ts.isStringLiteralLike(node) ? node.text : undefined;
}
export function property(
  object: ts.ObjectLiteralExpression,
  name: string,
): ts.Expression | undefined {
  const prop = object.properties.find(
    (p) =>
      p.name &&
      (ts.isIdentifier(p.name) ? p.name.text : stringValue(p.name)) === name,
  );
  return prop && ts.isPropertyAssignment(prop) ? prop.initializer : undefined;
}
export function objectLiterals(source: string): ts.ObjectLiteralExpression[] {
  const objects: ts.ObjectLiteralExpression[] = [];
  walk(parseTsx(source), (node) => {
    if (ts.isObjectLiteralExpression(node)) objects.push(node);
  });
  return objects;
}
export function barePackage(specifier: string): string | null {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("#")
  )
    return null;
  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : (specifier.split("/")[0] ?? null);
}
export function imports(
  source: string,
): { specifier: string; node: ts.Node }[] {
  const found: { specifier: string; node: ts.Node }[] = [];
  walk(parseTsx(source), (node) => {
    let specifier: string | undefined;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      specifier = stringValue(node.moduleSpecifier);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require"))
    )
      specifier = stringValue(node.arguments[0]);
    if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
      specifier = stringValue(node.argument.literal);
    if (specifier) found.push({ specifier, node });
  });
  return found;
}
export function staticValue(node: ts.Expression): unknown {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((value) => staticValue(value));
  if (ts.isObjectLiteralExpression(node))
    return Object.fromEntries(
      node.properties.flatMap((p) => {
        if (!ts.isPropertyAssignment(p)) return [];
        const name = ts.isIdentifier(p.name)
          ? p.name.text
          : stringValue(p.name);
        return name === undefined ? [] : [[name, staticValue(p.initializer)]];
      }),
    );
  if (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  )
    return staticValue(node.expression);
  return undefined;
}
