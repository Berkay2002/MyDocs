import { EditorState, SelectionState, convertToRaw } from "draft-js";

// Save current selection (cursor position) to restore it later
export const saveCursorPosition = (editorState) => {
  return editorState.getSelection();
};

// Set the editor state with the saved cursor position
export const restoreCursorPosition = (editorState, selectionState) => {
  return EditorState.forceSelection(editorState, selectionState);
};
