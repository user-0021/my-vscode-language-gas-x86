import * as path from 'path';
import { ExtensionContext, SemanticTokens, workspace } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  // Generate server path
  const serverModule = context.asAbsolutePath(
    path.join('server', 'out', 'server.js')
  );

  // debug options
  const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

  // server options
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: { module: serverModule, transport: TransportKind.ipc, options: debugOptions }
  };

  // client options
  const clientOptions: LanguageClientOptions = {
    initializationOptions: {semanticTokens: true},
    // document fillter
    documentSelector: [{ scheme: 'file', language: 'gas' }],
    // output name
    outputChannelName: 'MY LANGUAGE GAS X86-64',
    // sync setting
    synchronize: {
      // sync config
      configurationSection: 'gasMacroLsp',
      // sync file
      fileEvents: workspace.createFileSystemWatcher('**/*.{s,S,h,inc}')
    }
  };

  // create client
  client = new LanguageClient(
    'gasMacroLsp',
    'GNU Assembly Macro Language Server',
    serverOptions,
    clientOptions
  );

  // lunch client
  client.start();
  console.log('GAS Macro LSP Client activated.');
}

//deactivate
export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}