import jsdom = require('jsdom');

export interface HtmlLooksLike {
  (actual: string, expected: string): void;
  bool(actual: string, expected: string): boolean;
}

export type Doc = jsdom.DocumentWithParentWindow;

export interface NodeObj {
  nodeName: string;
  attributes: undefined | {
    [name: string]: string;
  };
  data: undefined | string;
  childNodes: Array<NodeObj>;
}
