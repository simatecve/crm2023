import { hasParentNodeOfType } from 'prosemirror-utils';
import { TextSelection, NodeSelection } from 'prosemirror-state';
import { mapSlice } from './utils';

export const applyMarkOnRange = (from, to, removeMark, mark, tr) => {
  // const { schema } = tr.doc.type;
  // const { code } = schema.marks;
  // if (mark.type === code) {
  // // When turning to code we need to flat some special characters
  // import { transformSmartCharsMentionsAndEmojis } from '../plugins/text-formatting/commands/transform-to-code';
  //   transformSmartCharsMentionsAndEmojis(from, to, tr);
  // }

  tr.doc.nodesBetween(tr.mapping.map(from), tr.mapping.map(to), (node, pos) => {
    if (!node.isText) {
      return true;
    }

    // This is an issue when the user selects some text.
    // We need to check if the current node position is less than the range selection from.
    // If it’s true, that means we should apply the mark using the range selection,
    // not the current node position.
    const nodeBetweenFrom = Math.max(pos, tr.mapping.map(from));
    const nodeBetweenTo = Math.min(pos + node.nodeSize, tr.mapping.map(to));

    if (removeMark) {
      tr.removeMark(nodeBetweenFrom, nodeBetweenTo, mark);
    } else {
      tr.addMark(nodeBetweenFrom, nodeBetweenTo, mark);
    }

    return true;
  });

  return tr;
};

export const insertBlock = (state, nodeType, nodeName, start, end, attrs) => {
  // To ensure that match is done after HardBreak.
  const { hardBreak, codeBlock, listItem } = state.schema.nodes;
  const $pos = state.doc.resolve(start);
  if ($pos.nodeAfter.type !== hardBreak) {
    return null;
  }

  // To ensure no nesting is done. (unless we're inserting a codeBlock inside lists)
  if (
    $pos.depth > 1 &&
    !(nodeType === codeBlock && hasParentNodeOfType(listItem)(state.selection))
  ) {
    return null;
  }

  // Split at the start of autoformatting and delete formatting characters.
  let tr = state.tr.delete(start, end).split(start);
  let currentNode = tr.doc.nodeAt(start + 1);

  // If node has more content split at the end of autoformatting.
  let nodeHasMoreContent = false;
  tr.doc.nodesBetween(start, start + currentNode.nodeSize, (node, pos) => {
    if (!nodeHasMoreContent && node.type === hardBreak) {
      nodeHasMoreContent = true;
      tr = tr.split(pos + 1).delete(pos, pos + 1);
    }
  });
  if (nodeHasMoreContent) {
    currentNode = tr.doc.nodeAt(start + 1);
  }

  // Create new node and fill with content of current node.
  const { blockquote, paragraph } = state.schema.nodes;
  let content;
  let depth;
  if (nodeType === blockquote) {
    depth = 3;
    content = [paragraph.create({}, currentNode.content)];
  } else {
    depth = 2;
    content = currentNode.content;
  }
  const newNode = nodeType.create(attrs, content);

  // Add new node.
  tr = tr
    .setSelection(new NodeSelection(tr.doc.resolve(start + 1)))
    .replaceSelectionWith(newNode)
    .setSelection(new TextSelection(tr.doc.resolve(start + depth)));
  return tr;
};

export function transformToCodeBlockAction(state, attrs) {
  if (!state.selection.empty) {
    // Don't do anything, if there is something selected
    return state.tr;
  }

  const codeBlock = state.schema.nodes.code_block;
  const startOfCodeBlockText = state.selection.$from;
  const parentPos = startOfCodeBlockText.before();
  const end = startOfCodeBlockText.end();

  const codeBlockSlice = mapSlice(
    state.doc.slice(startOfCodeBlockText.pos, end),
    node => {
      if (node.type === state.schema.nodes.hard_break) {
        return state.schema.text('\n');
      }

      if (node.isText) {
        return node.mark([]);
      }
      if (node.isInline) {
        return node.attrs.text ? state.schema.text(node.attrs.text) : null;
      }
      return node.content.childCount ? node.content : null;
    }
  );

  const tr = state.tr.replaceRange(
    startOfCodeBlockText.pos,
    end,
    codeBlockSlice
  );
  // If our offset isnt at 3 (backticks) at the start of line, cater for content.
  if (startOfCodeBlockText.parentOffset >= 3) {
    return tr.split(startOfCodeBlockText.pos, undefined, [
      { type: codeBlock, attrs },
    ]);
  }
  // TODO: Check parent node for valid code block marks, ATM It's not necessary because code block doesn't have any valid mark.
  const codeBlockMarks = [];
  return tr.setNodeMarkup(parentPos, codeBlock, attrs, codeBlockMarks);
}

export function isConvertableToCodeBlock(state) {
  // Before a document is loaded, there is no selection.
  if (!state.selection) {
    return false;
  }

  const { $from } = state.selection;
  const node = $from.parent;

  if (!node.isTextblock || node.type === state.schema.nodes.code_block) {
    return false;
  }

  const parentDepth = $from.depth - 1;
  const parentNode = $from.node(parentDepth);
  const index = $from.index(parentDepth);

  return parentNode.canReplaceWith(
    index,
    index + 1,
    state.schema.nodes.code_block
  );
}
