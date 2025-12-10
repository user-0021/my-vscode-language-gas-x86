import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  Connection,
  TextDocumentPositionParams,
  Hover,
  SemanticTokensBuilder, 
  SemanticTokensParams,
  Range,            
  MarkupContent,
  MarkupKind,
  CompletionItem,
  CompletionItemKind,
  FileChangeType, 
  DidChangeWatchedFilesParams ,
	Location,
	DefinitionParams
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';
import { URI } from 'vscode-uri'; // URI変換用
import { REGISTERS, OPCODES , COMPLETION_ITEMS_REGISTER, COMPLETION_ITEMS_OPCODE } from './define';
import { SyntaxCacher } from './syntaxCacher';


const tokenTypes = ['macro','variable']; 
const tokenModifiers:string[] = [];

//connection object
const connection: Connection = createConnection(ProposedFeatures.all);

// document manager
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);
// save workpath
let workspaceRootPath: string | null = null;

const syntaxCacher = new SyntaxCacher();

//change text callback
documents.onDidChangeContent(change => {
	syntaxCacher.update(change.document.uri, change.document.getText());
});

//initilize callback
connection.onInitialize((params) => {
	if (params.workspaceFolders && params.workspaceFolders.length > 0) {
		workspaceRootPath = URI.parse(params.workspaceFolders[0].uri).fsPath;
	} else if (params.rootUri) {
		workspaceRootPath = URI.parse(params.rootUri).fsPath;
	}

  return {
	capabilities: {
	  // Document Sync
	  textDocumentSync: TextDocumentSyncKind.Full,
	  // Hover support
	  hoverProvider: true,
		//definition jump support
		definitionProvider: true,
	  // Completion support
	  completionProvider: {
		resolveProvider: false
	  },
	  // Semantic support
	  semanticTokensProvider: {
		  legend: {
			  tokenTypes: tokenTypes,
			  tokenModifiers: tokenModifiers
		  },
		  full: true
	  }
	},     
  };
});

// Completion Item List
const staticCompletionItems: CompletionItem[] = [
	...COMPLETION_ITEMS_REGISTER,
	...COMPLETION_ITEMS_OPCODE
];


// Completion callback
connection.onCompletion(
	(textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		const document = documents.get(textDocumentPosition.textDocument.uri);
		if (!document) {
			return [];
		}

		//get cache
		const data = syntaxCacher.get(document.uri);
		const defines = data.macros;
		const labels = data.labels;
		
		// export macro data
		const macroItems: CompletionItem[] = Object.keys(defines).map(macroName => {
			const value = defines[macroName];
			return {
				label: macroName,
				kind: CompletionItemKind.Constant, 
				detail: `Macro: ${value}`,         
				documentation: `Defined as: ${value}`
			};
		});

		// export label data
		const labelItems: CompletionItem[] = Object.keys(labels).map(labelName => {
			return {
				label: labelName,
				kind: CompletionItemKind.Value, 
				detail: "",         
				documentation: ""
			};
		});

		// build
		return [
			...macroItems,
			...staticCompletionItems,
			...labelItems
		];
	}
);

//resolve Path
function resolvePath(p: string): string {
	if (!p) return p;

	if (workspaceRootPath) {
		p = p.replace(/\$\{workspaceFolder\}/g, workspaceRootPath)
			 .replace(/\$\{workspaceRoot\}/g, workspaceRootPath);
	}
	
	if (p.startsWith('~/') || p === '~') {
		const homeDir = process.env.HOME || process.env.USERPROFILE || '';
		p = p.replace(/^~(?=$|\/|\\)/, homeDir);
	}

	return path.normalize(p);
}

// change event
connection.onDidChangeConfiguration(change => {
	const settings = change.settings.gasMacroLsp || {};
	
	if (settings && Array.isArray(settings.includePaths)) {
		// resolve path
		const resolvedPaths = settings.includePaths.map((p: string) => resolvePath(p));
		connection.console.log(`[Config] Resolved include paths: ${resolvedPaths.join(', ')}`);
		
		// clear cache
		syntaxCacher.setIncludePaths(resolvedPaths)
		syntaxCacher.clear();
		connection.console.log('[Cache] Configuration changed. Cache cleared.');

		// update cache
		documents.all().forEach(doc => {
			syntaxCacher.update(doc.uri, doc.getText());
		});

	} else {
		syntaxCacher.setIncludePaths([])
		syntaxCacher.clear();
	}
	
	connection.languages.semanticTokens.refresh();
});


// word
const WORD_REGEX = /[%a-zA-Z0-9_.]+/g;

// Get Cursol Position
function getWordRangeAtPosition(document: TextDocument, position: { line: number, character: number }): { word: string, start: number, end: number } | null {
	const lineText = document.getText({ start: { line: position.line, character: 0 }, end: { line: position.line, character: 99999 } });
	
	// cursol position
	const cursorChar = position.character;

	let match: RegExpExecArray | null;
	
	// find Word
	while ((match = WORD_REGEX.exec(lineText)) !== null) {
		const wordStart = match.index;
		const wordEnd = match.index + match[0].length;
		
		// position check 
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

// file watcher
connection.onDidChangeWatchedFiles((change: DidChangeWatchedFilesParams) => {
  let hasChanges = false;
	for (const event of change.changes) {
		
		if (event.type === FileChangeType.Deleted) {
			//deleate
			if (syntaxCacher.has(event.uri)) {
				syntaxCacher.delete(event.uri);
				connection.console.log(`[Cache] File deleted, removed from cache: ${event.uri}`);
				hasChanges = true;
			}
		} else if (event.type === FileChangeType.Changed) {
			//event
			if (syntaxCacher.has(event.uri)) {
				syntaxCacher.delete(event.uri);
				connection.console.log(`[Cache] File changed externally, invalidated: ${event.uri}`);
				hasChanges = true;
			}
		}
	}
	
	//refresh
	if (hasChanges) {
		connection.languages.semanticTokens.refresh();
	}
});



// Hover event
connection.onHover((params: TextDocumentPositionParams): Hover | null => {
  const document = documents.get(params.textDocument.uri);
  if (!document) {
	return null;
  }
  
  // get word pos
  const wordResult = getWordRangeAtPosition(document, params.position);
  if (!wordResult) {
		return null;
  }
  const word = wordResult.word;

  // get macro
  const data = syntaxCacher.get(document.uri);
  const labels = data.labels;
  const defines = data.macros;

  
  if (defines.hasOwnProperty(word)) {
		// define
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
  }else if(labels.hasOwnProperty(word)){
		// label
		const content: MarkupContent = {
			kind: MarkupKind.Markdown,
			value: [
			`## ${word}`,
			`---`
			].join('\n')
		};

		return {
			contents: content
		};
	}else if (REGISTERS.hasOwnProperty(word)) {
		// register
		const content: MarkupContent = {
			kind: MarkupKind.Markdown,
			value: [
				`**Register** \`${word}\``,
				'---',
				REGISTERS[word] || ''
			].join('\n')
		};
		return { contents: content };
  }else if (OPCODES.hasOwnProperty(word)) {
		//opecode
		const content: MarkupContent = {
			kind: MarkupKind.Markdown,
			value: [
				`**Opecode** \`${word}\``,
				'---',
				OPCODES[word] || ''
			].join('\n')
		};
		return { contents: content };
  }

  return null;
});

//difinition
connection.onDefinition((params: DefinitionParams): Location | null => {
	const document = documents.get(params.textDocument.uri);
	if (!document) return null;

	const wordResult = getWordRangeAtPosition(document, params.position);
	if (!wordResult) return null;
	const word = wordResult.word;

	const data = syntaxCacher.get(document.uri);

	// find difinition
	if (data.macros.hasOwnProperty(word)) {
		const def = data.macros[word];
		return Location.create(def.location.uri, {
			start: { line: def.location.line, character: 0 },
			end: { line: def.location.line, character: 100 }
		});
	}

	// find difinition
	if (data.labels.hasOwnProperty(word)) {
		const loc = data.labels[word];
		return Location.create(loc.uri, {
			start: { line: loc.line, character: 0 },
			end: { line: loc.line, character: 100 }
		});
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
	const data = syntaxCacher.get(document.uri);
	const labels = data.labels;
	const defines = data.macros;
	const labeledNames = Object.keys(labels);
	const definedMacroNames = Object.keys(defines);

	// check word
	const allWordsRegex = /[a-zA-Z0-9_.]+/g;
	let match: RegExpExecArray | null;
	let line = 0;
	

	while ((match = allWordsRegex.exec(text)) !== null) {
		// find token
		const range: Range = {
				start: document.positionAt(match.index),
				end: document.positionAt(match.index + match[0].length)
		};
		const word = match[0];
		
		// get line number
		while (range.start.line > line) {
				line++;
		}

		// push
		if (definedMacroNames.includes(word)) {
			builder.push(
				range.start.line, 
				range.start.character, 
				word.length, 
				tokenTypes.indexOf('macro'), 
				0 
			);
		}else if(labeledNames.includes(word)){
			let length = word.length
			let nextIndex = match.index+length
			if(nextIndex < text.length && text[nextIndex] === ':')
				length += 1

			builder.push(
				range.start.line, 
				range.start.character, 
				length, 
				tokenTypes.indexOf('variable'), 
				0 
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