import * as path from 'path';
import { ExtensionContext, workspace } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	
  // サーバーモジュールの絶対パス
  const serverModule = context.asAbsolutePath(
    path.join('server', 'out', 'server.js')
  );

	console.log(serverModule)

  // デバッグ用オプション
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // サーバー起動オプション
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
  };

  // クライアント起動オプション
  const clientOptions: LanguageClientOptions = {
    // サーバーに送信する言語ドキュメントを定義
    documentSelector: [{ scheme: 'file', language: 'gas' }],
    // サーバーのログ出力をVS CodeのOutput Channelにリダイレクト
    outputChannelName: 'GAS Macro LSP'
  };

  // 言語クライアントの作成
  client = new LanguageClient(
    'gasMacroLsp',
    'GNU Assembly Macro Language Server',
    serverOptions,
    clientOptions
  );

  // クライアントを起動。これによりサーバーが起動されます。
  client.start();
  console.log('GAS Macro LSP Client activated.');
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  // 拡張機能終了時にクライアントとサーバーを停止
  return client.stop();
}