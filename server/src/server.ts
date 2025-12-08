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
  
  // 現在のカーソル位置の単語を取得
  const wordRange = document.getWordRangeAtPosition(params.position);
  if (!wordRange) {
    return null;
  }
  const word = document.getText(wordRange);

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