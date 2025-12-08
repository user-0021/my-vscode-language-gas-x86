import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  Connection,
  TextDocumentPositionParams,
  Hover,
  MarkupContent,
  MarkupKind
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

// /server/src/server.ts 内に追加

// 有効な単語文字の正規表現 (C/GASマクロ名として有効な文字)
const WORD_REGEX = /[a-zA-Z0-9_]+/g;

// カーソル位置にある単語の範囲を計算するヘルパー関数
function getWordRangeAtPosition(document: TextDocument, position: { line: number, character: number }): { word: string, start: number, end: number } | null {
    const lineText = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: 99999 } });
    
    // カーソル位置のオフセット (その行の先頭からの文字数)
    const cursorChar = position.character;

    let match: RegExpExecArray | null;
    
    // 行全体で単語を検索
    while ((match = WORD_REGEX.exec(lineText)) !== null) {
        const wordStart = match.index;
        const wordEnd = match.index + match[0].length;
        
        // カーソルが単語の範囲内にあるかチェック
        if (cursorChar >= wordStart && cursorChar <= wordEnd) {
            return {
                word: match[0],
                start: wordStart,
                end: wordEnd
            };
        }
    }
    return null;
}

// LSP接続の作成
const connection: Connection = createConnection(ProposedFeatures.all);

// テキストドキュメントマネージャー
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(() => {
	
  return {
    capabilities: {
      // ドキュメント同期機能 (テキスト変更を通知)
      textDocumentSync: TextDocumentSyncKind.Full,
      // ホバー機能のサポート
      hoverProvider: true,
    },
  };
});

// ドキュメント内のすべての `#define` を解析する関数
function parseDefines(text: string): { [key: string]: string } {
  const defines: { [key: string]: string } = {};
  const defineRegex = /^#\s*define\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)/gm;
  let match: RegExpExecArray | null;

  while ((match = defineRegex.exec(text)) !== null) {
    // 1: マクロ名, 2: マクロの値
    const macroName = match[1];
    const macroValue = match[2].trim();
    defines[macroName] = macroValue;
  }
  return defines;
}

// ホバーリクエストのハンドリング
connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const offset = document.offsetAt(params.position);
  const text = document.getText();
  
  // 現在のカーソル位置の単語を取得// ★ 修正箇所：新しいヘルパー関数を使用 ★
  const wordResult = getWordRangeAtPosition(document, params.position);
  if (!wordResult) {
    return null;
  }
  const word = wordResult.word;

  // ドキュメント全体からマクロ定義を解析
  const defines = parseDefines(text);

  // カーソル下の単語がマクロとして定義されているかチェック
  if (defines.hasOwnProperty(word)) {
    const macroValue = defines[word];
    const content: MarkupContent = {
      kind: MarkupKind.Markdown,
      value: [
        `**#define** \`${word}\``,
        '---',
        `**Value:** \`${macroValue}\``
      ].join('\n')
    };

    return {
      contents: content
    };
  }

  return null;
});

// ドキュメントの内容変更を監視し、LSP接続を開始
documents.listen(connection);
connection.listen();

console.log('GNU Assembly Macro LSP Server is running...');