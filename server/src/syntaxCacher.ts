import * as fs from 'fs';
import * as path from 'path';
import { emitWarning } from 'process';
import { URI } from 'vscode-uri';

// Symbol table
export interface symbolTable {
  macros: { [key: string]: string },
	labels: string[]
}

// Cache entry
interface CacheEntry {
	table: symbolTable;
	dependences: string[];
}


export class SyntaxCacher {
	private cache = new Map<string, CacheEntry>();
	private includePaths: string[] = [];

	// set include
	public setIncludePaths(paths: string[]) {
		this.includePaths = paths;
	}

	// cache clear
	public clear() {
		this.cache.clear();
	}

	// cache deleate
	public delete(uri: string) {
		this.cache.delete(uri);
	}

	// cache has 
	public has(uri: string): boolean {
		return this.cache.has(uri);
	}

	//cache update
	public update(uri: string, text: string) {
		const table: symbolTable = {
			macros: {},
			labels: []
		};
		const dependences: string[] = [];

		//parse Label
		table.labels = parseLabel(text)

		//parse Macro
		table.macros = parseMacroDefinitions(text)

		// check include
		const files = parseIncludeFilenames(text)
		const currentFilePath = URI.parse(uri).fsPath;
		const currentDir = path.dirname(currentFilePath);

		for (const filename of files) {
			let targetPath = path.resolve(currentDir, filename);

			// インクルードパス設定の探索
			if (!fs.existsSync(targetPath)) {
				for (const includePath of this.includePaths) {
					const candidate = path.resolve(includePath, filename);
					if (fs.existsSync(candidate)) {
						targetPath = candidate;
						break;
					}
				}
			}

			if (fs.existsSync(targetPath)) {
					dependences.push(URI.file(targetPath).toString());
			}
		}

		// キャッシュに保存
		this.cache.set(uri, {
			table,
			dependences
		});
	}

	//get
	public get(uri: string, visited = new Set<string>()): symbolTable {
		if (visited.has(uri)) return { macros: {} ,labels: []};
		visited.add(uri);

		let entry = this.cache.get(uri);

		//load
		if (!entry) {
			const filePath = URI.parse(uri).fsPath;
			if (fs.existsSync(filePath)) {
				try {
					const text = fs.readFileSync(filePath, 'utf-8');
					this.update(uri, text);
					entry = this.cache.get(uri);
				} catch (e) {
					console.error(`Read error: ${filePath}`);
				}
			}
		}

		if (!entry) return { macros: {} ,labels: []};

		//marge data
		let mergedData: symbolTable = {
			macros: { ...entry.table.macros },
			labels: entry.table.labels
		};

		// インクルード先のデータを再帰的にマージ
		for (const includeUri of entry.dependences) {
			const includedData = this.get(includeUri, visited);

			mergedData.macros = { ...mergedData.macros, ...includedData.macros };
		}

		return mergedData;
	}
}

// parse Macros
function parseMacroDefinitions(text: string): { [key: string]: string } {
    const defines: { [key: string]: string } = {};
    const defineRegex = /^\s*#\s*define\s+([a-zA-Z_]\w*)(?:\s+(.*?))?$/gm;
    let match: RegExpExecArray | null;

    while ((match = defineRegex.exec(text)) !== null) {
        const name = match[1];
        let value = match[2] || "";

        const lineCommentIdx = value.indexOf('//');
        if (lineCommentIdx !== -1) value = value.substring(0, lineCommentIdx);
        
        const blockCommentIdx = value.indexOf('/*');
        if (blockCommentIdx !== -1) value = value.substring(0, blockCommentIdx);

        defines[name] = value.trim();
    }
    return defines;
}

// parse Include
function parseIncludeFilenames(text: string): string[] {
    const filenames: string[] = [];
		
    const includeRegex = /^\s*#\s*include\s+["<](.*?\.(?:h|inc))[">]/gmi;
    let match: RegExpExecArray | null;

    while ((match = includeRegex.exec(text)) !== null) {
        filenames.push(match[1]);
    }
    return filenames;
}

//parse label
function parseLabel(text: string): string[] {
	const labels: string[] = [];

	const externLabelRegex = /^\s*(?:\.extern\s+([a-zA-Z_][a-zA-Z0-9_.]*))/gm;
	const labelRegex = /^\s*([a-zA-Z_][a-zA-Z0-9_.]*)\s*:/gm;

	let match: RegExpExecArray | null;

	while ((match = externLabelRegex.exec(text)) !== null) {
		labels.push(match[1]);
	}

	while ((match = labelRegex.exec(text)) !== null) {
		labels.push(match[1]);
	}

	return labels
}