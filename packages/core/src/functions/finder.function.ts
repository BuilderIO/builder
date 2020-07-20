type Node = {
  name: string;
  penalty: number;
  level?: number;
};

type Path = Node[];

enum Limit {
  All,
  Two,
  One,
}

export type Options = {
  root: Element;
  idName: (name: string) => boolean;
  className: (name: string) => boolean;
  tagName: (name: string) => boolean;
  seedMinLength: number;
  optimizedMinLength: number;
  threshold: number;
};

let config: Options;
let rootDocument: Document | Element;

export default function (input: Element, options?: Partial<Options>) {
  if (input.nodeType !== Node.ELEMENT_NODE) {
    throw new Error(`Can't generate CSS selector for non-element node type.`);
  }

  if ('html' === input.tagName.toLowerCase()) {
    return input.tagName.toLowerCase();
  }

  const defaults: Options = {
    root: document.body,
    idName: (name: string) => true,
    className: (name: string) => true,
    tagName: (name: string) => true,
    seedMinLength: 1,
    optimizedMinLength: 2,
    threshold: 1000,
  };

  config = { ...defaults, ...options };

  rootDocument = findRootDocument(config.root, defaults);

  let path = bottomUpSearch(input, Limit.All, () =>
    bottomUpSearch(input, Limit.Two, () => bottomUpSearch(input, Limit.One))
  );

  if (path) {
    const optimized = sort(optimize(path, input));

    if (optimized.length > 0) {
      path = optimized[0];
    }

    return selector(path);
  } else {
    throw new Error(`Selector was not found.`);
  }
}

function findRootDocument(rootNode: Element | Document, defaults: Options) {
  if (rootNode.nodeType === Node.DOCUMENT_NODE) {
    return rootNode;
  }
  if (rootNode === defaults.root) {
    return rootNode.ownerDocument as Document;
  }
  return rootNode;
}

function bottomUpSearch(input: Element, limit: Limit, fallback?: () => Path | null): Path | null {
  let path: Path | null = null;
  let stack: Node[][] = [];
  let current: Element | null = input;
  let i = 0;

  while (current && current !== config.root.parentElement) {
    let level: Node[] = maybe(id(current)) ||
      maybe(...classNames(current)) ||
      maybe(tagName(current)) || [any()];

    const nth = index(current);

    if (limit === Limit.All) {
      if (nth) {
        level = level.concat(level.filter(dispensableNth).map(node => nthChild(node, nth)));
      }
    } else if (limit === Limit.Two) {
      level = level.slice(0, 1);

      if (nth) {
        level = level.concat(level.filter(dispensableNth).map(node => nthChild(node, nth)));
      }
    } else if (limit === Limit.One) {
      const [node] = (level = level.slice(0, 1));

      if (nth && dispensableNth(node)) {
        level = [nthChild(node, nth)];
      }
    }

    for (let node of level) {
      node.level = i;
    }

    stack.push(level);

    if (stack.length >= config.seedMinLength) {
      path = findUniquePath(stack, fallback);
      if (path) {
        break;
      }
    }

    current = current.parentElement;
    i++;
  }

  if (!path) {
    path = findUniquePath(stack, fallback);
  }

  return path;
}

function findUniquePath(stack: Node[][], fallback?: () => Path | null): Path | null {
  const paths = sort(combinations(stack));

  if (paths.length > config.threshold) {
    return fallback ? fallback() : null;
  }

  for (let candidate of paths) {
    if (unique(candidate)) {
      return candidate;
    }
  }

  return null;
}

function selector(path: Path): string {
  let node = path[0];
  let query = node.name;
  for (let i = 1; i < path.length; i++) {
    const level = path[i].level || 0;

    if (node.level === level - 1) {
      query = `${path[i].name} > ${query}`;
    } else {
      query = `${path[i].name} ${query}`;
    }

    node = path[i];
  }
  return query;
}

function penalty(path: Path): number {
  return path.map(node => node.penalty).reduce((acc, i) => acc + i, 0);
}

function unique(path: Path) {
  switch (rootDocument.querySelectorAll(selector(path)).length) {
    case 0:
      throw new Error(`Can't select any node with this selector: ${selector(path)}`);
    case 1:
      return true;
    default:
      return false;
  }
}

function id(input: Element): Node | null {
  const elementId = input.getAttribute('id');
  if (elementId && config.idName(elementId)) {
    return {
      name: '#' + elementId,
      penalty: 0,
    };
  }
  return null;
}

function classNames(input: Element): Node[] {
  const names: string[] = [].slice.call(input.classList).filter(config.className);

  return names.map(
    (name): Node => ({
      name: '.' + name,
      penalty: 1,
    })
  );
}

function tagName(input: Element): Node | null {
  const name = input.tagName.toLowerCase();
  if (config.tagName(name)) {
    return {
      name,
      penalty: 2,
    };
  }
  return null;
}

function any(): Node {
  return {
    name: '*',
    penalty: 3,
  };
}

function index(input: Element): number | null {
  const parent = input.parentNode;
  if (!parent) {
    return null;
  }

  let child = parent.firstChild;
  if (!child) {
    return null;
  }

  let i = 0;
  while (child) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      i++;
    }

    if (child === input) {
      break;
    }

    child = child.nextSibling as any;
  }

  return i;
}

function nthChild(node: Node, i: number): Node {
  return {
    name: node.name + `:nth-child(${i})`,
    penalty: node.penalty + 1,
  };
}

function dispensableNth(node: Node) {
  return node.name !== 'html' && !(node.name[0] === '#');
}

function maybe(...level: (Node | null)[]): Node[] | null {
  const list = level.filter(notEmpty);
  if (list.length > 0) {
    return list;
  }
  return null;
}

function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function* combinations(stack: Node[][], path: Node[] = []): any {
  if (stack.length > 0) {
    for (let node of stack[0]) {
      yield* combinations(stack.slice(1, stack.length), path.concat(node));
    }
  } else {
    yield path;
  }
}

function sort(paths: Iterable<Path>): Path[] {
  return ([].slice.call(paths) as any[]).sort((a, b) => penalty(a) - penalty(b));
}

function* optimize(path: Path, input: Element): any /* IterableIterator<Node[]> */ {
  if (path.length > 2 && path.length > config.optimizedMinLength) {
    for (let i = 1; i < path.length - 1; i++) {
      const newPath = [...path];
      newPath.splice(i, 1);

      if (unique(newPath) && same(newPath, input)) {
        yield newPath;
        yield* optimize(newPath, input);
      }
    }
  }
}

function same(path: Path, input: Element) {
  return rootDocument.querySelector(selector(path)) === input;
}
