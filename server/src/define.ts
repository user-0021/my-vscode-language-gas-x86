import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';

//value type
enum ParamType {
	IMMU_8BIT,
	IMMU_16BIT,
	IMMU_32BIT,
	IMMU_64BIT,
	GENERAL_8BIT,
	GENERAL_16BIT,
	GENERAL_32BIT,
	GENERAL_64BIT,
	MEMORY_8BIT,
	MEMORY_16BIT,
	MEMORY_32BIT,
	MEMORY_64BIT,
	MEMORY_128BIT,
	MEMORY_256BIT,
	MEMORY_384BIT,
	MEMORY_512BIT,
	MEMREG_8BIT,
	MEMREG_16BIT,
	MEMREG_32BIT,
	MEMREG_64BIT,
	MEMXMM_128BIT,
	MEMBND_64BIT,
	MEMBND_128BIT,
	CONTROL,
	MMX,
	XMM,
	XMM0,
	YMM,
	ZMM,
	BND,
}

enum FlagBit {
	OF,
	SF,
	ZF,
	AF,
	CF,
	PF,
	OE,
	UE,
	IE,
	PE,
	DE
}

interface OperandVariant {
	args: ParamType[];
	description: string; 
}

interface OperandInfo {
	args: OperandVariant[],
	flags_affected: FlagBit[];
	desc: string
}

//types
type OperandList = Record<string,OperandInfo>;
type RegisterList = Record<string,[ParamType,string]>;

const seq = (prefix: string, start: number, end: number,type:ParamType, desc: string, suffix: string = "") => 
	Object.fromEntries(Array.from({ length: end - start + 1 }, (_, i) => [`${prefix}${start + i}${suffix}`, [type,desc]]));

// 生のデータリスト（メンテナンスしやすいように文字列のまま定義）
export const REGISTERS: RegisterList = {
// 64-bit General Registers
  '%rax':  [ParamType.GENERAL_64BIT,'アキュムレータレジスタ (64bit)。算術演算や戻り値に使用されます。'],
  '%rbx':  [ParamType.GENERAL_64BIT,'ベースレジスタ (64bit)。汎用目的、またはベースポインタとして使用されます。'],
  '%rcx':  [ParamType.GENERAL_64BIT,'カウンタレジスタ (64bit)。ループやストリング操作に使用されます。'],
  '%rdx':  [ParamType.GENERAL_64BIT,'データレジスタ (64bit)。I/Oポート操作や算術演算に使用されます。'],
  '%rsi':  [ParamType.GENERAL_64BIT,'ソースインデックス (64bit)。ストリング操作（転送元）に使用されます。'],
  '%rdi':  [ParamType.GENERAL_64BIT,'デスティネーションインデックス (64bit)。ストリング操作（転送先）や第1引数に使用されます。'],
  '%rsp':  [ParamType.GENERAL_64BIT,'スタックポインタ (64bit)。現在のスタックのトップを指します。'],
  '%rbp':  [ParamType.GENERAL_64BIT,'ベースポインタ (64bit)。スタックフレームのベースを指します。'],
  ...seq('%r',8,15,ParamType.GENERAL_64BIT,'汎用レジスタ (64bit)。'),

  // 32-bit General Registers
  '%eax':  [ParamType.GENERAL_32BIT,'アキュムレータレジスタ (%raxの下位32bit)。'],
  '%ebx':  [ParamType.GENERAL_32BIT,'ベースレジスタ (%rbxの下位32bit)。'],
  '%ecx':  [ParamType.GENERAL_32BIT,'カウンタレジスタ (%rcxの下位32bit)。'],
  '%edx':  [ParamType.GENERAL_32BIT,'データレジスタ (%rdxの下位32bit)。'],
  '%esi':  [ParamType.GENERAL_32BIT,'ソースインデックス (32bit)。'],
  '%edi':  [ParamType.GENERAL_32BIT,'デスティネーションインデックス (32bit)。'],
  '%esp':  [ParamType.GENERAL_32BIT,'スタックポインタ (32bit)。'],
  '%ebp':  [ParamType.GENERAL_32BIT,'ベースポインタ (32bit)。'],
  ...seq('%r',8,15,ParamType.GENERAL_32BIT,'汎用レジスタ (32bit)。','d'),

  // 16-bit General Registers
  '%ax':   [ParamType.GENERAL_16BIT,'アキュムレータレジスタ (%eaxの下位16bit)。'],
  '%bx':   [ParamType.GENERAL_16BIT,'ベースレジスタ (%ebxの下位16bit)。'],
  '%cx':   [ParamType.GENERAL_16BIT,'カウンタレジスタ (%ecxの下位16bit)。'],
  '%dx':   [ParamType.GENERAL_16BIT,'データレジスタ (%edxの下位16bit)。'],
  '%si':   [ParamType.GENERAL_16BIT,'ソースインデックス (16bit)。'],
  '%di':   [ParamType.GENERAL_16BIT,'デスティネーションインデックス (16bit)。'],
  '%sp':   [ParamType.GENERAL_16BIT,'スタックポインタ (16bit)。'],
  '%bp':   [ParamType.GENERAL_16BIT,'ベースポインタ (16bit)。'],
  ...seq('%r',8,15,ParamType.GENERAL_16BIT,'汎用レジスタ (16bit)。','w'),

  // 8-bit General Registers
  '%al':   [ParamType.GENERAL_8BIT,'アキュムレータレジスタ (%axの下位8bit)。'],
  '%ah':   [ParamType.GENERAL_8BIT,'アキュムレータレジスタ (%axの上位8bit)。'],
  '%bh':   [ParamType.GENERAL_8BIT,'ベースレジスタ (%bxの上位8bit)。'],
  '%bl':   [ParamType.GENERAL_8BIT,'ベースレジスタ (%bxの下位8bit)。'],
  '%ch':   [ParamType.GENERAL_8BIT,'カウンタレジスタ (%cxの上位8bit)。'],
  '%cl':   [ParamType.GENERAL_8BIT,'カウンタレジスタ (%cxの下位8bit)。'],
  '%dh':   [ParamType.GENERAL_8BIT,'データレジスタ (%dxの上位8bit)。'],
  '%dl':   [ParamType.GENERAL_8BIT,'データレジスタ (%dxの下位8bit)。'],
  '%sil':  [ParamType.GENERAL_8BIT,'ソースインデックス (8bit)。'],
  '%dil':  [ParamType.GENERAL_8BIT,'デスティネーションインデックス (8bit)。'],
  '%spl':  [ParamType.GENERAL_8BIT,'スタックポインタ (8bit)。'],
  '%bpl':  [ParamType.GENERAL_8BIT,'ベースポインタ (8bit)。'],
  ...seq('%r',8,15,ParamType.GENERAL_8BIT,'汎用レジスタ (8bit)。','b'),

  // Vector Registers
  ...seq('%mm',0,7,ParamType.MMX,'MMXレジスタ。'),
  ...seq('%xmm',0,15,ParamType.XMM,'XMMレジスタ (Streaming SIMD Extensions)。'),
  ...seq('%ymm',0,31,ParamType.YMM,'YMMレジスタ (Advanced Vector Extensions)。'),
  ...seq('%zmm',0,31,ParamType.ZMM,'ZMMレジスタ (Advanced Vector Extensions 512)。'),

  // Program Registers
  '%rip':  [ParamType.GENERAL_64BIT,'インストラクションポインタ (64bit)。次に実行する命令のアドレスを保持します。'],
  '%eip':  [ParamType.GENERAL_32BIT,'インストラクションポインタ (32bit)。'],
  '%ip' :  [ParamType.GENERAL_16BIT,'インストラクションポインタ (16bit)。'],

  // Segment Registers
  '%cs': [ParamType.GENERAL_16BIT,'コードセグメントレジスタ。'],
  '%ds': [ParamType.GENERAL_16BIT,'データセグメントレジスタ。'],
  '%es': [ParamType.GENERAL_16BIT,'エクストラセグメントレジスタ。'],
  '%fs': [ParamType.GENERAL_16BIT,'FSセグメントレジスタ（スレッドローカルストレージ等で使用）。'],
  '%gs': [ParamType.GENERAL_16BIT,'GSセグメントレジスタ（カーネルデータ構造等で使用）。'],
  '%ss': [ParamType.GENERAL_16BIT,'スタックセグメントレジスタ。'],

  // Control Registers
  '%cr0': [ParamType.CONTROL,'コントロールレジスタ0。動作モード（保護モード、ページング等）や状態を制御します。'],
  '%cr2': [ParamType.CONTROL,'コントロールレジスタ2。ページフォールトが発生したリニアアドレスを保持します。'],
  '%cr3': [ParamType.CONTROL,'コントロールレジスタ3。ページディレクトリのベースアドレス(PML4等)を保持します。'],
  '%cr4': [ParamType.CONTROL,'コントロールレジスタ4。アーキテクチャ拡張機能を制御します。'],
  '%cr8': [ParamType.CONTROL,'コントロールレジスタ8。タスク優先度レジスタ(TPR)。']
};

export const OPCODES: OperandList = {
	'aaa':      {
		args: [
			{args:[],description:"十進数の加算後にalレジスタを調整します。"}
		],
		flags_affected: [FlagBit.AF,FlagBit.CF],
		desc: '加算後のASCII調整'
	},
	'aad':      {
		args: [
			{args:[],description:"十進数の除算のためにaxレジスタを調整します。"},
			{args:[ParamType.IMMU_8BIT],description:"{0}で指定した基数について、\n除算のためにaxレジスタを調整します。"}
		],
		flags_affected: [FlagBit.SF,FlagBit.ZF,FlagBit.PF],
		desc: '加算後のASCII調整'
	},
	'aam':      {
		args: [
			{args:[],description:"十進数の乗算後axレジスタを調整します。"},
			{args:[ParamType.IMMU_8BIT],description:"{0}で指定した基数について、\n乗算後axレジスタを調整します。"}
		],
		flags_affected: [FlagBit.SF,FlagBit.ZF,FlagBit.PF],
		desc: '加算後のASCII調整'
	},
	'aas': {
		args: [
			{args:[],description:"十進数の減算後にalレジスタを調整します"}
		],
		flags_affected: [FlagBit.AF,FlagBit.CF],
		desc: '減算後のASCII調整AL'
	},
	'adc': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.IMMU_16BIT  ,ParamType.MEMREG_16BIT],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_32BIT],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.IMMU_64BIT  ,ParamType.MEMREG_64BIT],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_8BIT ,ParamType.MEMREG_8BIT ],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_16BIT,ParamType.MEMREG_16BIT],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_32BIT,ParamType.MEMREG_32BIT],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.MEMREG_64BIT],description:"{0}を{1}にキャリー付きで加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_16BIT],description:"{0}を符号拡張して{1}にキャリー付きで加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_32BIT],description:"{0}を符号拡張して{1}にキャリー付きで加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_64BIT],description:"{0}を符号拡張して{1}にキャリー付きで加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_64BIT],description:"{0}を符号拡張して{1}にキャリー付きで加算します。"}
		],
		flags_affected: [FlagBit.OF,FlagBit.SF,FlagBit.ZF,FlagBit.AF,FlagBit.CF,FlagBit.PF],
		desc: 'キャリー付き加算'
	},
	'adcx': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT],description:"{0}と{1}に符号なし加算し、キャリーフラグに書き込みます。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT],description:"{0}と{1}に符号なし加算し、キャリーフラグに書き込みます。"}
		],
		flags_affected: [FlagBit.CF],
		desc: 'キャリーフラグ付きの2つのオペランドの符号なし整数加算'
	},
	'add': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:"{0}を{1}に加算します。"},
			{args:[ParamType.IMMU_16BIT  ,ParamType.MEMREG_16BIT],description:"{0}を{1}に加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_32BIT],description:"{0}を{1}に加算します。"},
			{args:[ParamType.IMMU_64BIT  ,ParamType.MEMREG_64BIT],description:"{0}を{1}に加算します。"},
			{args:[ParamType.MEMREG_8BIT ,ParamType.MEMREG_8BIT ],description:"{0}を{1}に加算します。"},
			{args:[ParamType.MEMREG_16BIT,ParamType.MEMREG_16BIT],description:"{0}を{1}に加算します。"},
			{args:[ParamType.MEMREG_32BIT,ParamType.MEMREG_32BIT],description:"{0}を{1}に加算します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.MEMREG_64BIT],description:"{0}を{1}に加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_16BIT],description:"{0}を符号拡張して{1}に加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_32BIT],description:"{0}を符号拡張して{1}に加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_64BIT],description:"{0}を符号拡張して{1}に加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_64BIT],description:"{0}を符号拡張して{1}に加算します。"}
		],
		flags_affected: [FlagBit.OF,FlagBit.SF,FlagBit.ZF,FlagBit.AF,FlagBit.CF,FlagBit.PF],
		desc: '加算'
	},
	'addpd': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM ],description:"パックされたDouble値として{0}に{1}を加算し{1}に格納します"},
		],
		flags_affected: [FlagBit.OE,FlagBit.UE,FlagBit.IE,FlagBit.PE,FlagBit.DE],
		desc: 'パックされた倍精度浮動小数点値の加算'
	},
	'addps': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM ],description:"パックされたfloat値として{0}に{1}を加算し{1}に格納します"},
		],
		flags_affected: [FlagBit.OE,FlagBit.UE,FlagBit.IE,FlagBit.PE,FlagBit.DE],
		desc: 'パックされた単精度浮動小数点値の加算'
	},
	'addsd': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM ],description:"下位にセットされたdouble値として{0}に{1}を加算し{1}に格納します"},
		],
		flags_affected: [FlagBit.OE,FlagBit.UE,FlagBit.IE,FlagBit.PE,FlagBit.DE],
		desc: 'スカラー倍精度浮動小数点値の加算'
	},
	'addss': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM ],description:"下位にセットされたfloat値として{0}に{1}を加算し{1}に格納します。"},
		],
		flags_affected: [FlagBit.OE,FlagBit.UE,FlagBit.IE,FlagBit.PE,FlagBit.DE],
		desc: 'スカラー単精度浮動小数点値の加算'
	},
	'addsubpd': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM ],description:"パックされたdouble値として{0}に{1}を加算/減算し{1}に格納します。\n{1}[127:64]={1}[127:64]+{0}[127:64]\n{1}[63:0]={1}[63:0]-{0}[63:0]"},
		],
		flags_affected: [FlagBit.OE,FlagBit.UE,FlagBit.IE,FlagBit.PE,FlagBit.DE],
		desc: 'パックされた倍精度浮動小数点加算/減算'
	},
	'addsubps': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM ],description:"パックされたfloat値として{0}に{1}を加算/減算し{1}に格納します。\n{1}[127:96]={1}[127:96]+{0}[127:96]\n{1}[95:64]={1}[95:64]-{0}[95:64]\n{1}[63:32]={1}[63:32]+{0}[63:32]\n{1}[31:0]={1}[31:0]-{0}[31:0]"},
		],
		flags_affected: [FlagBit.OE,FlagBit.UE,FlagBit.IE,FlagBit.PE,FlagBit.DE],
		desc: 'パックされた単精度浮動小数点加算/減算'
	},
	'adox': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT ],description:"{0}を{1}に符号なし加算し、オーバーフローフラグに書き込みます。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT ],description:"{0}を{1}に符号なし加算し、オーバーフローフラグに書き込みます。"},
		],
		flags_affected: [FlagBit.OF],
		desc: 'オーバーフローフラグ付きの2つのオペランドの符号なし整数加算'
	},
	'aesdec': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}の1つの128bitAESキーと{1}の一つの128bitデータを使用し、\nAES復号フローの1ラウンドを実行します。"},
		],
		flags_affected: [],
		desc: 'AES復号フローの1ラウンドの実行'
	},
	'aesdec128kl': {
		args: [
			{args:[ParamType.MEMORY_256BIT,ParamType.XMM],description:"{0}の128bitAESキーで{1}のデータを復号し、{1}に格納します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.SF,FlagBit.AF,FlagBit.PF,FlagBit.CF],
		desc: '128ビットキーを使用したキーロッカーによるAES復号フローの10ラウンドの実行'
	},
	'aesdec256kl': {
		args: [
			{args:[ParamType.MEMORY_512BIT,ParamType.XMM],description:"{0}の256bitAESキーで{1}のデータを復号し、{1}に格納します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.SF,FlagBit.AF,FlagBit.PF,FlagBit.CF],
		desc: '256ビットキーを使用したキーロッカーによるAES復号フローの14ラウンドの実行'
	},
	'aesdeclast': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{1}の128bitデータと{0}の128bitラウンドキーを使用して、\nAES復号フローの最終ラウンドを行います。"},
		],
		flags_affected: [],
		desc: 'AES復号フローの最終ラウンドの実行'
	},
	'aesdecwide128kl': {
		args: [
			{args:[ParamType.MEMORY_384BIT],description:"{0}の128bitAESキーを使用しXMM0~7を復号します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.SF,FlagBit.AF,FlagBit.PF,FlagBit.CF],
		desc: '128ビットキーを使用した8ブロックでのキーロッカーによるAES復号フローの10ラウンドの実行'
	},
	'aesdecwide256kl': {
		args: [
			{args:[ParamType.MEMORY_512BIT],description:"{0}の256bitAESキーを使用しXMM0~7を復号します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.SF,FlagBit.AF,FlagBit.PF,FlagBit.CF],
		desc: '256ビットキーを使用した8ブロックでのキーロッカーによるAES復号フローの14ラウンドの実行'
	},
	'aesenc': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}の128bitラウンドキーと{1}の128bitデータを使用して、\nAES暗号化フローの1ラウンドを実行します。"},
		],
		flags_affected: [],
		desc: 'AES暗号化フローの1ラウンドの実行'
	},
	'aesenc128kl': {
		args: [
			{args:[ParamType.MEMORY_384BIT,ParamType.XMM],description:"{0}の128bitAESキーで{1}を暗号化し、{1}に格納します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.SF,FlagBit.AF,FlagBit.PF,FlagBit.CF],
		desc: '128ビットキーを使用したキーロッカーによるAES暗号化フローの10ラウンドの実行'
	},
	'aesenc256kl': {
		args: [
			{args:[ParamType.MEMORY_512BIT,ParamType.XMM],description:"{0}の256bitAESキーで{1}を暗号化し、{1}に格納します。"},
		],
		flags_affected: [],
		desc: '256ビットキーを使用したキーロッカーによるAES暗号化フローの14ラウンドの実行'
	},
	'aesenclast': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}の128ビットラウンドキーと{1}の128bitデータを使用して、\nAES暗号化フローの最終ラウンドを実行します"},
		],
		flags_affected: [],
		desc: 'AES暗号化フローの最終ラウンドの実行'
	},
	'aesencwide128kl': {
		args: [
			{args:[ParamType.MEMORY_384BIT],description:"{0}の128bitAESキーでXMM0~7を暗号化します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.SF,FlagBit.AF,FlagBit.PF,FlagBit.CF],
		desc: '128ビットキーを使用した8ブロックでのキーロッカーによるAES暗号化フローの10ラウンドの実行'
	},
	'aesencwide256kl': {
		args: [
			{args:[ParamType.MEMORY_512BIT],description:"{0}の256bitAESキーでXMM0~7を暗号化します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.SF,FlagBit.AF,FlagBit.PF,FlagBit.CF],
		desc: '256ビットキーを使用した8ブロックでのキーロッカーによるAES暗号化フローの14ラウンドの実行'
	},
	'aesimc': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}の128bitラウンドキーにInvMixColumn変換を実行し、\n{1}に格納します。"},
		],
		flags_affected: [],
		desc: 'AES InvMixColumn変換の実行'
	},
	'aeskeygenassist': {
		args: [
			{args:[ParamType.IMMU_8BIT,ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}のラウンド定数で鍵生成のために、{1}に演算を行い{2}に格納します。"},
		],
		flags_affected: [],
		desc: 'AESラウンドキー生成アシスト'
	},
	'and': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.IMMU_16BIT  ,ParamType.MEMREG_16BIT],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_32BIT],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.IMMU_64BIT  ,ParamType.MEMREG_64BIT],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.MEMREG_8BIT ,ParamType.MEMREG_8BIT ],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.MEMREG_16BIT,ParamType.MEMREG_16BIT],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.MEMREG_32BIT,ParamType.MEMREG_32BIT],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.MEMREG_64BIT],description:"{0}と{1}の論理積を計算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_16BIT],description:"符号拡張した{0}と{1}の論理積を計算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_32BIT],description:"符号拡張した{0}と{1}の論理積を計算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_64BIT],description:"符号拡張した{0}と{1}の論理積を計算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_64BIT],description:"符号拡張した{0}と{1}の論理積を計算します。"}
		],
		flags_affected: [FlagBit.OF,FlagBit.CF,FlagBit.SF,FlagBit.ZF,FlagBit.PF],
		desc: '論理AND'
	},
	'andn': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT,ParamType.GENERAL_32BIT],description:"{2}に{0}とビット反転された{1}の論理積の計算結果を格納します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT,ParamType.GENERAL_64BIT],description:"{2}に{0}とビット反転された{1}の論理積の計算結果を格納します。"}
		],
		flags_affected: [FlagBit.SF,FlagBit.ZF,FlagBit.OF,FlagBit.CF],
		desc: '論理AND NOT'
	},
	'andnpd': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}と{1}内のパックされたdouble値の論理積のビット反転を計算します。"},
		],
		flags_affected: [],
		desc: 'パックされた倍精度浮動小数点値のビット単位の論理AND NOT'
	},
	'andnps': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}とビット反転された{1}内のパックされたfloat値の論理積を計算します。"},
		],
		flags_affected: [],
		desc: 'パックされた単精度浮動小数点値のビット単位の論理AND NOT'
	},
	'andpd': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}と{1}内のパックされたdouble値の論理積を計算します。"},
		],
		flags_affected: [],
		desc: 'パックされた倍精度浮動小数点値のビット単位の論理AND'
	},
	'andps': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}と{1}内のパックされたfloat値の論理積を計算します。"},
		],
		flags_affected: [],
		desc: 'パックされた単精度浮動小数点値のビット単位の論理AND'
	},
	'arpl': {
		args: [
			{args:[ParamType.GENERAL_16BIT,ParamType.MEMREG_16BIT],description:"{1}が{0}のRPL以下にならないよう調整する。"},
		],
		flags_affected: [FlagBit.ZF],
		desc: 'セグメントセレクタのRPLフィールドの調整'
	},
	'bextr': {
		args: [
			{args:[ParamType.GENERAL_32BIT,ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT],description:"{0}を使用し{1}からビットを抽出し、{2}に格納します。"},
			{args:[ParamType.GENERAL_64BIT,ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT],description:"{0}を使用し{1}からビットを抽出し、{2}に格納します。"}
		],
		flags_affected: [FlagBit.ZF,FlagBit.OF,FlagBit.CF],
		desc: 'ビットフィールド抽出'
	},
	'blendpd': {
		args: [
			{args:[ParamType.IMMU_8BIT,ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}のマスクデータで{1}と{2}からパックされたdouble値を選択し{2}に格納します。"},
		],
		flags_affected: [],
		desc: 'パックされた倍精度浮動小数点値のブレンド'
	},
	'blendps': {
		args: [
			{args:[ParamType.IMMU_8BIT,ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}のマスクデータで{1}と{2}からパックされたfloat値を選択し{2}に格納します。"},
		],
		flags_affected: [],
		desc: 'パックされた単精度浮動小数点値のブレンド'
	},
	'blendvpd': {
		args: [
			{args:[ParamType.XMM0,ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}のマスクデータで{1}と{0}からパックされたdouble値を選択し、{1}に格納します。"},
		],
		flags_affected: [],
		desc: '可変ブレンドパックされた倍精度浮動小数点値'
	},
	'blendvps': {
		args: [
			{args:[ParamType.XMM0,ParamType.MEMXMM_128BIT,ParamType.XMM],description:"{0}のマスクデータで{1}と{0}からパックされたfloat値を選択し、{1}に格納します。"},
		],
		flags_affected: [],
		desc: '可変ブレンドパックされた単精度浮動小数点値'
	},
	'blsi': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT],description:"{0}から最下位セットビットを抽出し{1}に格納します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT],description:"{0}から最下位セットビットを抽出し{1}に格納します。"},
		],
		flags_affected: [FlagBit.ZF,FlagBit.SF,FlagBit.CF,FlagBit.OF],
		desc: '最下位セット分離ビットの抽出'
	},
	'blsmsk': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT],description:"{0}の最下位セットビットより下位のビットを\nすべてセットしたマスクを生成し、{1}に格納します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT],description:"{0}の最下位セットビットより下位のビットを\nすべてセットしたマスクを生成し、{1}に格納します。"},
		],
		flags_affected: [FlagBit.SF,FlagBit.CF,FlagBit.ZF,FlagBit.OF],
		desc: '最下位セットビットまでのマスクの取得'
	},
	'blsr': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT],description:"{0}の最下位セットビットをリセットし、{1}に格納します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT],description:"{0}の最下位セットビットをリセットし、{1}に格納します。"}
		],
		flags_affected: [FlagBit.ZF,FlagBit.SF,FlagBit.CF,FlagBit.OF],
		desc: '最下位セットビットのリセット'
	},
	'bndcl': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.BND],description:"{0}のアドレスが{1}.LBの下限より小さい場合、#BRを生成します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.BND],description:"{0}のアドレスが{1}.LBの下限より小さい場合、#BRを生成します。"}
		],
		flags_affected: [],
		desc: '下限のチェック'
	},
	'bndcn': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.BND],description:"{0}のアドレスが{1}.UB(bnb.UBを1の補数で表したもの)\nの上限より大きい場合、#BRを生成します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.BND],description:"{0}のアドレスが{1}.UB(bnb.UBを1の補数で表したもの)\nの上限より大きい場合、#BRを生成します。"}
		],
		flags_affected: [],
		desc: '上限のチェック'
	},
	'bndcu': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.BND],description:"{0}のアドレスが{1}.UB(bnb.UBを1の補数で表したものではない)\nの上限より大きい場合、#BRを生成します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.BND],description:"{0}のアドレスが{1}.UB(bnb.UBを1の補数で表したものではない)\nの上限より大きい場合、#BRを生成します。"}
		],
		flags_affected: [],
		desc: '上限のチェック'
	},
	'bndldx': {
		args: [
			{args:[ParamType.IMMU_64BIT,ParamType.BND],description:"BTE二格納された境界を{0}のベースを使用して、\nアドレス変換をし{1}にロードします。"},
		],
		flags_affected: [],
		desc: 'アドレス変換を使用した拡張境界のロード'
	},
	'bndmk': {
		args: [
			{args:[ParamType.MEMORY_32BIT,ParamType.BND],description:"{0}から下限と上限を生成し、{1}に格納します。"},
			{args:[ParamType.MEMORY_64BIT,ParamType.BND],description:"{0}から下限と上限を生成し、{1}に格納します。"}
		],
		flags_affected: [],
		desc: '境界の作成'
	},
	'bndmov': {
		args: [
			{args:[ParamType.MEMBND_64BIT ,ParamType.BND],description:"下限と上限のboundsを{0}から{1}に移動します。"},
			{args:[ParamType.MEMBND_128BIT,ParamType.BND],description:"下限と上限のboundsを{0}から{1}に移動します。"},
			{args:[ParamType.BND,ParamType.MEMBND_64BIT ],description:"下限と上限のboundsを{0}から{1}に移動します。"},
			{args:[ParamType.BND,ParamType.MEMBND_128BIT],description:"下限と上限のboundsを{0}から{1}に移動します。"}
		],
		flags_affected: [],
		desc: '境界の移動'
	},
	'bndstx': {
		args: [
			{args:[ParamType.BND,ParamType.IMMU_64BIT],description:"{1}のベースを使用しアドレス変換を行い、\n{1}のインデックスレジスタ内の{0}とポインタ値をBTEに格納します。"},
		],
		flags_affected: [],
		desc: 'アドレス変換を使用した拡張境界の格納'
	},
	'bound': {
		args: [
			{args:[ParamType.MEMORY_16BIT,ParamType.GENERAL_16BIT],description:"{1}が{0}で指定された境界内にあるかチェックする。"},
			{args:[ParamType.MEMORY_32BIT,ParamType.GENERAL_32BIT],description:"{1}が{0}で指定された境界内にあるかチェックする。"}
		],
		flags_affected: [],
		desc: '境界に対する配列インデックスのチェック'
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
	'': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:""},
		],
		flags_affected: [],
		desc: ''
	},
};

//create Completion
function createCompletionItemsRegister(defs: RegisterList, kind: CompletionItemKind, typeName: string): CompletionItem[] {
    return Object.entries(defs).map(([name, info]) => ({
        label: name,
        kind: kind,
        detail: typeName,           
        documentation: info[1]
    }));
}

function createCompletionItems(defs: ItemType, kind: CompletionItemKind, typeName: string): CompletionItem[] {
    return Object.entries(defs).map(([name, description]) => ({
        label: name,
        kind: kind,
        detail: typeName,           
        documentation: description
    }));
}

export const COMPLETION_ITEMS_REGISTER = createCompletionItemsRegister(REGISTERS, CompletionItemKind.Variable, 'Register');
export const COMPLETION_ITEMS_OPCODE   = createCompletionItems(OPCODES  , CompletionItemKind.Keyword , 'Instruction');