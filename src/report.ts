import {NodeObj, Doc} from './types';
import {Diff} from './diff';

function routeToNode(doc: Node, route: Array<number>) {
  let ref: Node = doc;
  route.forEach(i => {
    ref = ref.childNodes[i];
  });
  return ref;
}

function serializeTextNodeObj(nodeObj: NodeObj): string {
  return nodeObj.data as string;
}

function serializeCommentNodeObj(nodeObj: NodeObj): string {
  return `<!--${nodeObj.data}-->`;
}

function serializeElementNodeObj(nodeObj: NodeObj): string {
  if (typeof nodeObj.attributes === 'undefined') {
    nodeObj.attributes = {};
  }
  if (typeof nodeObj.childNodes === 'undefined') {
    nodeObj.childNodes = [];
  }
  const tagName = nodeObj.nodeName.toLowerCase();
  const attrs = Object.keys(nodeObj.attributes)
    .map(name => `${name}="${(nodeObj.attributes as any)[name]}"`);
  const head = [tagName].concat(attrs).join(' ');
  const children = nodeObj.childNodes.map(serializeNodeObj).join('');
  return `<${head}>${children}</${tagName}>`;
}

function serializeNodeObj(nodeObj: NodeObj): string {
  if (nodeObj.nodeName === '#text') {
    return serializeTextNodeObj(nodeObj);
  } else if (nodeObj.nodeName === '#comment') {
    return serializeCommentNodeObj(nodeObj);
  } else if (nodeObj.nodeName[0] !== '#') {
    return serializeElementNodeObj(nodeObj);
  } else {
    return `serializeNodeObj(${JSON.stringify(nodeObj)})`;
  }
}

function mdHTML(html: string): string {
  return '```html\n' + html + '\n```';
}

function renderMismatch(diff: Diff, actualDoc: Doc, expectedDoc: Doc): string {
  if (diff.action === 'addElement') {
    const snippet = mdHTML(serializeNodeObj(diff.element));
    return `HTML has an unexpected element\n${snippet}`;
  } else if (diff.action === 'removeElement') {
    const snippet = mdHTML(serializeNodeObj(diff.element));
    return `HTML is missing the expected element\n${snippet}`;
  } else if (diff.action === 'removeAttribute') {
    const node = routeToNode(actualDoc.window.document, diff.route) || '???';
    const attr = `${diff.name}="${diff.value}"`;
    const snippet = mdHTML((node as HTMLElement).outerHTML || node.toString());
    return `HTML is missing the attribute \`${attr}\` on the element\n${snippet}`;
  } else if (diff.action === 'replaceElement') {
    const eSnippet = mdHTML(serializeNodeObj(diff.oldValue));
    const aSnippept = mdHTML(serializeNodeObj(diff.newValue));
    return `HTML expected element\n${eSnippet}\nbut got element\n${aSnippept}`;
  } else if (diff.action === 'modifyAttribute') {
    const node = routeToNode(expectedDoc.window.document, diff.route) || '???';
    const htmlSnippet = mdHTML((node as HTMLElement).outerHTML || node.toString());
    const eSnippet = diff.oldValue;
    const aSnippet = diff.newValue;
    return `HTML mismatch on attribute \`${diff.name}\` in element\n${htmlSnippet}\n` +
      `Expected\n${eSnippet}\nbut got\n${aSnippet}`;
  } else if (diff.action === 'addTextElement') {
    return `HTML has an unexpected text\n${diff.value}`;
  } else if (diff.action === 'removeTextElement') {
    return `HTML is missing the expected text\n${diff.value}`;
  } else if (diff.action === 'modifyTextElement') {
    const eSnippet = diff.oldValue;
    const aSnippet = diff.newValue;
    return `HTML text mismatch. Expected\n${eSnippet}\nbut got\n${aSnippet}`;
  } else {
    return `renderMismatch(${JSON.stringify(diff)})`;
  }
}

export function reportMismatches(diffs: Array<Diff>, actualDoc: Doc, expectedDoc: Doc): void {
  const msg = diffs
    .map(d => renderMismatch(d, actualDoc, expectedDoc))
    .join('\n\n');
  throw new Error(msg);
}
