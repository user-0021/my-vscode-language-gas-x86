import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  Connection,
  TextDocumentPositionParams,
  Hover,
  SemanticTokensBuilder, // TS2304 (SemanticTokensBuilder) を修正
  SemanticTokensParams,  // TS2304 (SemanticTokensParams) を修正
  Range,                 // Rangeの型をインポート
  MarkupContent,
  MarkupKind,
  CompletionItem,
  CompletionItemKind,
  FileChangeType, // ★追加
  DidChangeWatchedFilesParams // ★追加
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import * as fs from 'fs';
import * as path from 'path';
import { URI } from 'vscode-uri'; // URI変換用
import { WORD_REGISTERS, WORD_OPCODES } from './define';

// /server/src/server.ts 内に追加


const tokenTypes = ['macro','function']; 
const tokenModifiers = [];

//connection object
const connection: Connection = createConnection(ProposedFeatures.all);

// document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
// save workpath
let workspaceRootPath: string | null = null;

// Macro cache interface
interface FileCache {
    defines: { [key: string]: string }; // Macro List
    includes: string[];                 // dependencies
}

// macro cache
const macroCache = new Map<string, FileCache>();

// updeate macro cache
function updateMacroCache(uri: string, text: string) {
    // find define macro
    const defines: { [key: string]: string } = {};
    const defineRegex = /^#\s*define\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(.*)/gm;
    let match: RegExpExecArray | null;
    while ((match = defineRegex.exec(text)) !== null) {
        defines[match[1]] = match[2].trim();
    }

    // parse include 
    const includes: string[] = [];
    const includeRegex = /^#\s*include\s+["<](.*?\.(?:h|inc))[">]/gm;
    const currentFilePath = URI.parse(uri).fsPath;
    const currentDir = path.dirname(currentFilePath);

    while ((match = includeRegex.exec(text)) !== null) {
        const filename = match[1];
        let targetPath = path.resolve(currentDir, filename);

        // コンフィグの includePaths も考慮してパス解決
        if (!fs.existsSync(targetPath)) {
            for (const includePath of globalIncludePaths) {
                const candidate = path.resolve(includePath, filename);
                if (fs.existsSync(candidate)) {
                    targetPath = candidate;
                    break;
                }
            }
        }

        if (fs.existsSync(targetPath)) {
            includes.push(URI.file(targetPath).toString());
        }
    }

    // regist cache
    macroCache.set(uri, {
        defines,
        includes
    });
}

//change text callback
documents.onDidChangeContent(change => {
    updateMacroCache(change.document.uri, change.document.getText());
});

//initilize callback
connection.onInitialize((params) => {
  // ★追加: ワークスペースのルートパスを取得・変換して保存
    if (params.workspaceFolders && params.workspaceFolders.length > 0) {
        // マルチルートワークスペース対応（とりあえず最初のフォルダを使う）
        workspaceRootPath = URI.parse(params.workspaceFolders[0].uri).fsPath;
    } else if (params.rootUri) {
        // シングルルートの場合
        workspaceRootPath = URI.parse(params.rootUri).fsPath;
    }

  return {
    capabilities: {
      // Document Sync
      textDocumentSync: TextDocumentSyncKind.Full,
      // Hover support
      hoverProvider: true,
      // Completion support
      completionProvider: {
        resolveProvider: false
      },
      // Semantic support
      semanticTokensProvider: {
          legend: {
              tokenTypes: ['macro'],
              tokenModifiers: []
          },
          full: true
      }
    },     
  };
});

// Completion Item List
const staticCompletionItems: CompletionItem[] = [
    ...WORD_REGISTERS.map(reg => ({
        label: reg,
        kind: CompletionItemKind.Variable,
        detail: 'Register'
    })),
    ...WORD_OPCODES.map(inst => ({
        label: inst,
        kind: CompletionItemKind.Keyword, // 命令はキーワード扱い
        detail: 'Instruction'
    }))
];

// ※注意: 未オープンのファイル（インクルード先など）については、
// 必要になったタイミングでオンデマンドでキャッシュする仕組みが必要です（後述）。

// Completion callback
connection.onCompletion(
    (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        const document = documents.get(textDocumentPosition.textDocument.uri);
        if (!document) {
            return [];
        }

        // 1. 現在のファイル（+インクルード先）からマクロ定義を取得
        // ※ 前回作った getAllDefines を再利用！
        const defines = getAllDefines(document.uri);
        
        // 2. マクロ定義を補完アイテム形式に変換
        const macroItems: CompletionItem[] = Object.keys(defines).map(macroName => {
            const value = defines[macroName];
            return {
                label: macroName,
                kind: CompletionItemKind.Constant, // マクロは定数扱い
                detail: `Macro: ${value}`,         // 補完リストの横に値を表示
                documentation: `Defined as: ${value}` // ドキュメントとしても表示
            };
        });

        // 3. 静的リストと合体させて返す
        return [
            ...macroItems,
            ...staticCompletionItems
        ];
    }
);

/**
 * パス内の変数を展開し、正規化された絶対パスを返す
 */
function resolvePath(p: string): string {
    if (!p) return p;

    // ワークスペースルートが取得できている場合のみ置換
    if (workspaceRootPath) {
        // ${workspaceFolder} または ${workspaceRoot} (旧仕様) を置換
        p = p.replace(/\$\{workspaceFolder\}/g, workspaceRootPath)
             .replace(/\$\{workspaceRoot\}/g, workspaceRootPath);
    }
    
    // ~ (チルダ) をホームディレクトリに置換 (Linux/Mac用のおまけ)
    if (p.startsWith('~/') || p === '~') {
        const homeDir = process.env.HOME || process.env.USERPROFILE || '';
        p = p.replace(/^~(?=$|\/|\\)/, homeDir);
    }

    // パスセパレータをOSに合わせて正規化 (例: / -> \)
    return path.normalize(p);
}

// インクルードパスを保存するグローバル変数
let globalIncludePaths: string[] = [];
connection.onDidChangeConfiguration(change => {
    // settings.json から gasMacroLsp.includePaths を取得
    const settings = change.settings.gasMacroLsp || {};
    
    if (settings && Array.isArray(settings.includePaths)) {
        // ★変更: 設定されたすべてのパスに対して変数置換を実行
        globalIncludePaths = settings.includePaths.map((p: string) => resolvePath(p));
        
        connection.console.log(`[Config] Resolved include paths: ${globalIncludePaths.join(', ')}`);
        // ★ 追加手順 1: 古いキャッシュをすべて破棄する
        macroCache.clear();
        connection.console.log('[Cache] Configuration changed. Cache cleared.');

        // ★ 追加手順 2: 現在開いているファイルのみ、新しい設定ですぐに再解析する
        // これをやらないと、ユーザーがファイルを編集するまでキャッシュが空のままになってしまいます
        documents.all().forEach(doc => {
            updateMacroCache(doc.uri, doc.getText());
        });

        connection.languages.semanticTokens.refresh();
    } else {
        globalIncludePaths = [];
    }
    
    console.log(`[LSP] Include paths updated: ${globalIncludePaths.join(', ')}`);
    
    // 設定が変わったので、キャッシュをクリアして再解析などを促すべきですが、
    // 簡易的には次回のホバー/ハイライト時に反映されます。
});


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

// ファイルシステム上の変更（作成・変更・削除）を検知
connection.onDidChangeWatchedFiles((change: DidChangeWatchedFilesParams) => {
  let hasChanges = false;
    for (const event of change.changes) {
        // event.uri: 変更があったファイルのURI
        // event.type: Created(1), Changed(2), Deleted(3)

        if (event.type === FileChangeType.Deleted) {
            // ファイルが削除されたら、キャッシュから抹消する
            if (macroCache.has(event.uri)) {
                macroCache.delete(event.uri);
                connection.console.log(`[Cache] File deleted, removed from cache: ${event.uri}`);
                hasChanges = true;
            }
        } else if (event.type === FileChangeType.Changed) {
            // VS Codeで開いていないファイル（ヘッダなど）が外部で変更された場合
            // キャッシュに残っていると古い情報のままになるので、一度削除して
            // 次回必要になったときに読み直させる
            
            // ※ 開いているファイルの場合、onDidChangeContent が先に走って
            // updateMacroCache されているので、ここでは何もしなくてOK（または念のため削除でも可）
            if (macroCache.has(event.uri)) {
                macroCache.delete(event.uri);
                connection.console.log(`[Cache] File changed externally, invalidated: ${event.uri}`);
                hasChanges = true;
            }
        }
    }
    // ★ もしキャッシュに何らかの変更があったら、VS Codeに「色の再計算」を依頼する
    if (hasChanges) {
        connection.languages.semanticTokens.refresh();
    }
});

/**
 * キャッシュからマクロ定義を再帰的に収集する
 */
function getAllDefines(uri: string, visited = new Set<string>()): { [key: string]: string } {
    if (visited.has(uri)) return {};
    visited.add(uri);

    // 1. キャッシュを確認
    let cached = macroCache.get(uri);

    // 2. キャッシュがない場合（まだ開いていないインクルードファイルなど）は、ディスクから読んで即席でキャッシュ作成
    if (!cached) {
        const filePath = URI.parse(uri).fsPath;
        if (fs.existsSync(filePath)) {
            try {
                const text = fs.readFileSync(filePath, 'utf-8');
                updateMacroCache(uri, text); // ここでキャッシュを作る
                cached = macroCache.get(uri);
            } catch (e) {
                console.error(`Read error: ${filePath}`);
            }
        }
    }

    if (!cached) return {};

    // 3. 自分のマクロと、インクルード先のマクロを結合
    let allDefines = { ...cached.defines };

    for (const includeUri of cached.includes) {
        const includedDefines = getAllDefines(includeUri, visited);
        allDefines = { ...allDefines, ...includedDefines };
    }

    return allDefines;
}


// ホバーリクエストのハンドリング
connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }
  
  // 現在のカーソル位置の単語を取得// ★ 修正箇所：新しいヘルパー関数を使用 ★
  const wordResult = getWordRangeAtPosition(document, params.position);
  if (!wordResult) {
    return null;
  }
  const word = wordResult.word;

  // ドキュメント全体からマクロ定義を解析
  const defines = getAllDefines(document.uri);

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

// Senmatuc tokens
connection.languages.semanticTokens.on((params: SemanticTokensParams) => {
	// get document
	const document = documents.get(params.textDocument.uri);
	if (!document) {
			return { data: [] };
	}

	// init builder
	const builder = new SemanticTokensBuilder();
	const text = document.getText();
	
	// get cache
	const defines = getAllDefines(document.uri);
	const definedMacroNames = Object.keys(defines);

	// ドキュメント全体からすべての単語を抽出し、それが定義済みマクロ名かチェックする
	const allWordsRegex = /[a-zA-Z_][a-zA-Z0-9_]*/g;
	let match: RegExpExecArray | null;
	let line = 0;

	while ((match = allWordsRegex.exec(text)) !== null) {
			// トークンの位置を計算
			const range: Range = {
					start: document.positionAt(match.index),
					end: document.positionAt(match.index + match[0].length)
			};
			const word = match[0];
			
			// トークンが新しい行にある場合、行番号を更新
			while (range.start.line > line) {
					line++;
			}

			// ★ 定義済みマクロ名との照合 ★
			if (definedMacroNames.includes(word) && !word.startsWith("#")) {
					// トークンが定義済みマクロ名リストに存在する場合、トークンとして追加
					// パラメータ: line (差分行), char (列), length (長さ), tokenType (インデックス), tokenModifiers (ビットマスク)
					builder.push(
							range.start.line, 
							range.start.character, 
							word.length, 
							tokenTypes.indexOf('macro'), // 'macro' タイプを使用
							0 // モディファイアなし
					);
			}
	}

	//build
	return builder.build();
});

// lunch
documents.listen(connection);
connection.listen();

console.log('GNU Assembly Macro LSP Server is running...');