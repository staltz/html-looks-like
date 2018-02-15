import domWalk = require('domwalk');
import { JSDOM } from 'jsdom';
import { HtmlLooksLike } from './types';
import { makeDiff, Diff } from './diff';
import { reportMismatches } from './report';

function trimTextNode(node: Node) {
  if (node.nodeType === 3) {
    const trimmedText = (node.textContent as string).trim();
    if (trimmedText.length === 0) {
      (node.parentNode as Node).removeChild(node);
    } else {
      node.textContent = trimmedText;
    }
  }
}

function makeDocsAndDiff(actual: string, expected: string): [Array<Diff>, Document, Document] {
  const actualDoc = new JSDOM(actual).window.document;
  domWalk(actualDoc, trimTextNode);

  const expectedWithWildcards = expected
    .replace(/{{[^}]*}}/g, '<!--$ignored-wildcard-element$-->');
  const expectedDoc = new JSDOM(expectedWithWildcards).window.document;

  domWalk(expectedDoc, trimTextNode);
  const diffs = makeDiff(actualDoc, expectedDoc);

  return [diffs, actualDoc, expectedDoc];
}

const htmlLooksLike: HtmlLooksLike = ((actual: string, expected: string) => {
  const [diffs, actualDoc, expectedDoc] = makeDocsAndDiff(actual, expected);
  if (diffs.length > 0) {
    reportMismatches(diffs, actualDoc, expectedDoc);
  }
}) as any;

htmlLooksLike.bool = function (actual: string, expected: string): boolean {
  const [diffs] = makeDocsAndDiff(actual, expected);
  return diffs.length === 0;
};

export = htmlLooksLike;
