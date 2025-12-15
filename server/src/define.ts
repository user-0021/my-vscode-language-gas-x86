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
	MEMREG_8BIT,
	MEMREG_16BIT,
	MEMREG_32BIT,
	MEMREG_64BIT,
	MEMXMM_128BIT,
	CONTROL,
	MMX,
	XMM,
	YMM,
	ZMM
}

enum FlagBit {
	OF,
	SF,
	ZF,
	AF,
	CF,
	PF
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
			{args:[ParamType.IMMU_8BIT],description:"<第一引数>進数の除算のためにaxレジスタを調整します。"}
		],
		flags_affected: [FlagBit.SF,FlagBit.ZF,FlagBit.PF],
		desc: '加算後のASCII調整'
	},
	'aam':      {
		args: [
			{args:[],description:"十進数の乗算後axレジスタを調整します。"},
			{args:[ParamType.IMMU_8BIT],description:"<第一引数>進数の乗算後axレジスタを調整します。"}
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
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:"8bitの即値を8bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.IMMU_16BIT  ,ParamType.MEMREG_16BIT],description:"16bitの即値を16bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_32BIT],description:"32bitの即値を32bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.IMMU_64BIT  ,ParamType.MEMREG_64BIT],description:"64bitの即値を64bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_8BIT ,ParamType.MEMREG_8BIT ],description:"8bitの即値を8bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_16BIT,ParamType.MEMREG_16BIT],description:"16bitの即値を16bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_32BIT,ParamType.MEMREG_32BIT],description:"32bitの即値を32bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.MEMREG_64BIT],description:"64bitの即値を64bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_16BIT],description:"8bitの即値を符号拡張して16bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_32BIT],description:"8bitの即値を符号拡張して32bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_64BIT],description:"8bitの即値を符号拡張して64bitのメモリ/レジスタにキャリー付きで加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_64BIT],description:"32bitの即値を符号拡張して64bitのメモリ/レジスタにキャリー付きで加算します。"}
		],
		flags_affected: [FlagBit.OF,FlagBit.SF,FlagBit.ZF,FlagBit.AF,FlagBit.CF,FlagBit.PF],
		desc: 'キャリー付き加算'
	},
	'adcx': {
		args: [
			{args:[ParamType.MEMREG_32BIT,ParamType.GENERAL_32BIT],description:"32bitのメモリ/レジスタと32bitレジスタを符号なし加算し、キャリーフラグに書き込みます。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.GENERAL_64BIT],description:"64bitのメモリ/レジスタと64bitレジスタを符号なし加算し、キャリーフラグに書き込みます。"}
		],
		flags_affected: [FlagBit.CF],
		desc: 'キャリーフラグ付きの2つのオペランドの符号なし整数加算'
	},
	'add': {
		args: [
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_8BIT ],description:"8bitの即値を8bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.IMMU_16BIT  ,ParamType.MEMREG_16BIT],description:"16bitの即値を16bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_32BIT],description:"32bitの即値を32bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.IMMU_64BIT  ,ParamType.MEMREG_64BIT],description:"64bitの即値を64bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.MEMREG_8BIT ,ParamType.MEMREG_8BIT ],description:"8bitの即値を8bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.MEMREG_16BIT,ParamType.MEMREG_16BIT],description:"16bitの即値を16bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.MEMREG_32BIT,ParamType.MEMREG_32BIT],description:"32bitの即値を32bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.MEMREG_64BIT,ParamType.MEMREG_64BIT],description:"64bitの即値を64bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_16BIT],description:"8bitの即値を符号拡張して16bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_32BIT],description:"8bitの即値を符号拡張して32bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.IMMU_8BIT   ,ParamType.MEMREG_64BIT],description:"8bitの即値を符号拡張して64bitのメモリ/レジスタに加算します。"},
			{args:[ParamType.IMMU_32BIT  ,ParamType.MEMREG_64BIT],description:"32bitの即値を符号拡張して64bitのメモリ/レジスタに加算します。"}
		],
		flags_affected: [FlagBit.OF,FlagBit.SF,FlagBit.ZF,FlagBit.AF,FlagBit.CF,FlagBit.PF],
		desc: '加算'
	},
	'addpd': {
		args: [
			{args:[ParamType.MEMXMM_128BIT,ParamType.XMM ],description:"1:xmmレジスタに2:xmm/128bitメモリを加算し1:xmmレジスタに格納します"},
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