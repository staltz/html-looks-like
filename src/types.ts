import { JSDOM } from 'jsdom';

export interface HtmlLooksLike {
  (actual: string, expected: string): void;
  bool(actual: string, expected: string): boolean;
}

export type Doc = JSDOM;

export interface NodeObj {
  nodeName: string;
  attributes: undefined | {
    [name: string]: string;
  };
  data: undefined | string;
  childNodes: Array<NodeObj>;
}
