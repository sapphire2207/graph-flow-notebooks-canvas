
import { NodeTypes } from '@xyflow/react';
import CodeNode from './CodeNode';
import MarkdownNode from './MarkdownNode';
import OutputNode from './OutputNode';

export const nodeTypes: NodeTypes = {
  code: CodeNode,
  markdown: MarkdownNode,
  output: OutputNode,
};
