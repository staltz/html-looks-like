import DiffDOM = require('diff-dom');
import stableSort = require('lodash.sortby');
import {NodeObj, Doc} from './types';

const dd = new DiffDOM();

export interface AddElementDiff {
  action: 'addElement';
  route: Array<number>;
  element: NodeObj;
}

export interface ReplaceElementDiff {
  action: 'replaceElement';
  route: Array<number>;
  oldValue: NodeObj;
  newValue: NodeObj;
}

export interface RemoveElementDiff {
  action: 'removeElement';
  route: Array<number>;
  element: NodeObj;
}

export interface AddAttributeDiff {
  action: 'addAttribute';
  route: Array<number>;
  name: string;
  value: string;
}

export interface ModifyAttributeDiff {
  action: 'modifyAttribute';
  route: Array<number>;
  name: string;
  oldValue: string;
  newValue: string;
}

export interface RemoveAttributeDiff {
  action: 'removeAttribute';
  route: Array<number>;
  name: string;
  value: string;
}

export interface ModifyTextElementDiff {
  action: 'modifyTextElement';
  route: Array<number>;
  oldValue: string;
  newValue: string;
}

export interface RemoveTextElementDiff {
  action: 'removeTextElement';
  route: Array<number>;
  value: string;
}

export interface AddTextElementDiff {
  action: 'addTextElement';
  route: Array<number>;
  value: string;
}

export interface ModifyValueDiff {
  action: 'modifyValue';
  route: Array<number>;
  oldValue: any;
  newValue: any;
}

export interface ModifySelectedDiff {
  action: 'modifySelected';
  route: Array<number>;
  oldValue: any;
  newValue: any;
}

export interface ModifyCheckedDiff {
  action: 'modifyChecked';
  route: Array<number>;
  oldValue: any;
  newValue: any;
}

export interface ModifyCommentDiff {
  action: 'modifyComment';
  route: Array<number>;
  oldValue: string;
  newValue: string;
}

export type Diff =
  AddElementDiff | RemoveElementDiff | ReplaceElementDiff |
  AddAttributeDiff | RemoveAttributeDiff | ModifyAttributeDiff |
  AddTextElementDiff | RemoveTextElementDiff | ModifyTextElementDiff |
  ModifyValueDiff | ModifySelectedDiff | ModifyCheckedDiff | ModifyCommentDiff;

function splitReplaceDiff(diff: Diff): Array<Diff> {
  if (diff.action !== 'replaceElement') {
    return [diff];
  }
  if (!isWildcardComment(diff.oldValue)) {
    return [diff];
  }
  const removeDiff: RemoveElementDiff = {
    action: 'removeElement',
    route: diff.route,
    element: diff.oldValue,
  };
  const addDiff: AddElementDiff = {
    action: 'addElement',
    route: diff.route,
    element: diff.newValue,
  };
  return [removeDiff, addDiff];
}

function areRoutesAdjacent(diffA: Diff, diffB: Diff): boolean {
  const routeA: string = diffA.route.join('');
  const routeB: string = diffB.route.join('');
  const prefixA: string = routeA.substring(0, routeA.length - 1);
  const prefixB: string = routeB.substring(0, routeB.length - 1);
  const lastA: number = diffA.route[diffA.route.length - 1];
  const lastB: number = diffB.route[diffB.route.length - 1];
  return routeA.length === routeB.length
    && prefixA === prefixB
    && (lastA === lastB || lastA + 1 === lastB);
}

function groupByWildcard(groups: Array<Array<Diff>>,
                         diff: Diff,
                         index: number,
                         diffs: Array<Diff>): Array<Array<Diff>> {
  const group = groups[groups.length - 1];
  const firstInGroup = group[0];
  const lastInGroup = group[group.length - 1];
  if (firstInGroup
  && isRemoveWildcardDiff(firstInGroup)
  && lastInGroup
  && areRoutesAdjacent(lastInGroup, diff)
  && isAddSomethingDiff(diff)) {
    group.push(diff);
  } else {
    groups.push([diff]);
  }
  return groups;
}

function isAddAttribute(diff: Diff): diff is AddAttributeDiff {
  return diff.action === 'addAttribute';
}

function isWildcardComment(element: any): boolean {
  return element.nodeName === '#comment'
    && (element as Comment).data.trim() === '$ignored-wildcard-element$';
}

function isRemoveWildcardDiff(diff: Diff): diff is RemoveElementDiff {
  return diff.action === 'removeElement' && isWildcardComment(diff.element);
}

function isAddElementDiff(diff: Diff): diff is AddElementDiff {
  return diff.action === 'addElement';
}

function isAddTextElementDiff(diff: Diff): diff is AddElementDiff {
  return diff.action === 'addTextElement';
}

function isAddSomethingDiff(diff: Diff): boolean {
  return isAddElementDiff(diff) || isAddTextElementDiff(diff);
}

export function makeDiff(actualDoc: Doc, expectedDoc: Doc): Array<Diff> {
  const diffs1 = dd.diff(expectedDoc, actualDoc) as Array<Diff>;
  const diffs2 = stableSort(diffs1, (d: Diff) => d.route.join('')) as Array<Diff>;
  const diffs = diffs2
    .map(splitReplaceDiff)
    .reduce((a, b) => a.concat(b), [])
    .filter(d => !isAddAttribute(d))
    .reduce(groupByWildcard, [[]])
    .filter(group => group.length > 0 && !isRemoveWildcardDiff(group[0]))
    .reduce((a, b) => a.concat(b), []);
  return diffs;
}