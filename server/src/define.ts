import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';

//value type
enum ParamType {
	GENERAL_8BIT,
	GENERAL_16BIT,
	GENERAL_32BIT,
	GENERAL_64BIT,
	CONTROL,
	MMX,
	XMM,
	YMM,
	ZMM
}



//types
type OperandType = Record<string,[ParamType[][],string]>;
type RegisterType = Record<string,[ParamType,string]>;

const seq = (prefix: string, start: number, end: number,type:ParamType, desc: string, suffix: string = "") => 
	Object.fromEntries(Array.from({ length: end - start + 1 }, (_, i) => [`${prefix}${start + i}${suffix}`, [type,desc]]));
const suf = (prefix: string, desc: string) => 
	Object.fromEntries([['',''],['b','(8-bit).'],['w','(16-bit).'],['l','(32-bit).'],['q','(64-bit).']].map(([s, d]) => [`${prefix}${s}`,`${desc}${d}`]));

// 生のデータリスト（メンテナンスしやすいように文字列のまま定義）
export const REGISTERS: RegisterType = {
	// 64-bit General Ragisters
	'%rax':  [ParamType.GENERAL_64BIT,'Accumulator Register (64-bit). Used for arithmetic and return values.'],
	'%rbx':  [ParamType.GENERAL_64BIT,'Base Register (64-bit). General purpose, often used as a base pointer.'],
	'%rcx':  [ParamType.GENERAL_64BIT,'Counter Register (64-bit). Used for loops and string operations.'],
	'%rdx':  [ParamType.GENERAL_64BIT,'Data Register (64-bit). Used for I/O and arithmetic.'],
	'%rsi':  [ParamType.GENERAL_64BIT,'Source Index (64-bit). Used for string operations (source).'],
	'%rdi':  [ParamType.GENERAL_64BIT,'Destination Index (64-bit). Used for string operations (destination) and 1st argument.'],
	'%rsp':  [ParamType.GENERAL_64BIT,'Stack Pointer (64-bit). Points to the top of the stack.'],
	'%rbp':  [ParamType.GENERAL_64BIT,'Base Pointer (64-bit). Points to the base of the stack frame.'],
	...seq('%r',8,15,ParamType.GENERAL_64BIT,'General Purpose Register (64-bit).'),

	// 32-bit General Ragisters
	'%eax':  [ParamType.GENERAL_32BIT,'Accumulator Register (32-bit lower half of %rax).'],
	'%ebx':  [ParamType.GENERAL_32BIT,'Base Register (32-bit lower half of %rbx).'],
	'%ecx':  [ParamType.GENERAL_32BIT,'Counter Register (32-bit lower half of %rcx).'],
	'%edx':  [ParamType.GENERAL_32BIT,'Data Register (32-bit lower half of %rdx).'],
	'%esi':  [ParamType.GENERAL_32BIT,'Source Index (32-bit).'],
	'%edi':  [ParamType.GENERAL_32BIT,'Destination Index (32-bit).'],
	'%esp':  [ParamType.GENERAL_32BIT,'Stack Pointer (32-bit).'],
	'%ebp':  [ParamType.GENERAL_32BIT,'Base Pointer (32-bit).'],
	...seq('%r',8,15,ParamType.GENERAL_32BIT,'General Purpose Register (32-bit).','d'),

	// 16-bit General Ragisters
	'%ax':   [ParamType.GENERAL_16BIT,'Accumulator Register (16-bit lower half of %eax).'],
	'%bx':   [ParamType.GENERAL_16BIT,'Base Register (16-bit lower half of %ebx).'],
	'%cx':   [ParamType.GENERAL_16BIT,'Counter Register (16-bit lower half of %ecx).'],
	'%dx':   [ParamType.GENERAL_16BIT,'Data Register (16-bit lower half of %edx).'],
	'%si':   [ParamType.GENERAL_16BIT,'Source Index (16-bit).'],
	'%di':   [ParamType.GENERAL_16BIT,'Destination Index (16-bit).'],
	'%sp':   [ParamType.GENERAL_16BIT,'Stack Pointer (16-bit).'],
	'%bp':   [ParamType.GENERAL_16BIT,'Base Pointer (16-bit).'],
	...seq('%r',8,15,ParamType.GENERAL_16BIT,'General Purpose Register (16-bit).','w'),

	// 8-bit General Ragisters
	'%al':   [ParamType.GENERAL_8BIT,'Accumulator Register (8-bit lower half of %ax).'],
	'%ah':   [ParamType.GENERAL_8BIT,'Accumulator Register (8-bit higher half of %ax).'],
	'%bh':   [ParamType.GENERAL_8BIT,'Base Register (8-bit higher half of %bx).'],
	'%bl':   [ParamType.GENERAL_8BIT,'Base Register (8-bit lower half of %bx).'],
	'%ch':   [ParamType.GENERAL_8BIT,'Counter Register (8-bit higher half of %cx).'],
	'%cl':   [ParamType.GENERAL_8BIT,'Counter Register (8-bit lower half of %cx).'],
	'%dh':   [ParamType.GENERAL_8BIT,'Data Register (8-bit higher half of %dx).'],
	'%dl':   [ParamType.GENERAL_8BIT,'Data Register (8-bit lower half of %dx).'],
	'%sil':  [ParamType.GENERAL_8BIT,'Source Index (8-bit).'],
	'%dil':  [ParamType.GENERAL_8BIT,'Destination Index (8-bit).'],
	'%spl':  [ParamType.GENERAL_8BIT,'Stack Pointer (8-bit).'],
	'%bpl':  [ParamType.GENERAL_8BIT,'Base Pointer (8-bit).'],
	...seq('%r',8,15,ParamType.GENERAL_8BIT,'General Purpose Register (8-bit).','b'),

	// Vector Registers
	...seq('%mm',0,7,ParamType.MMX,'Multi Media EXtensions.'),
	...seq('%xmm',0,15,ParamType.XMM,'Streaming SIMD Extensions.'),
	...seq('%ymm',0,31,ParamType.YMM,'Advanced Vector Extensions.'),
	...seq('%zmm',0,31,ParamType.ZMM,'Advanced Vector Extensions 512.'),

	// program Registers
	'%rip':  [ParamType.GENERAL_64BIT,',Instruction Pointer (64-bit)'],
	'%eip':  [ParamType.GENERAL_32BIT,',Instruction Pointer (32-bit)'],
	'%ip' :  [ParamType.GENERAL_16BIT,',Instruction Pointer (16-bit)'],

	// Segment Registers
	'%cs': [ParamType.GENERAL_16BIT,'Code Segment.'],
	'%ds': [ParamType.GENERAL_16BIT,'Data Segment.'],
	'%es': [ParamType.GENERAL_16BIT,'Extra Segment.'],
	'%fs': [ParamType.GENERAL_16BIT,'F Segment.'],
	'%gs': [ParamType.GENERAL_16BIT,'G Segment.'],
	'%ss': [ParamType.GENERAL_16BIT,'Stack Segment.'],

	// Control Registers
	'%cr0': [ParamType.CONTROL,'Control Register 0. Controls operating mode and states.'],
	'%cr2': [ParamType.CONTROL,'Control Register 2. Page Fault Linear Address.'],
	'%cr3': [ParamType.CONTROL,'Control Register 3. PML4 Address.'],
	'%cr4': [ParamType.CONTROL,'Control Register 4. Architectural extensions.'],
	'%cr8': [ParamType.CONTROL,'Control Register 4. Architectural extensions.']
};

export const OPCODES: OperandType = {
	
	//ret/call
	'ret':      [[],'Return from procedure.'],
	'call':     'Call procedure.',

	//inc/dec
	'inc':      'Increment operand by 1.',
	'dec':      'Decrement operand by 1.',
	
	//general register math
	'adc':      'Add with carry bit.',
	'adcx':     'Unsigned integer add with carry flag.',
	'adox':     'Unsigned integer add with overflow flag.',
	'sub':      'Subtract source from destination.',
	'imul':     'Signed multiply.',
	'idiv':     'Signed divide.',
	...suf('add','Add source to destination'),

	//general register logic
	'and':      'Logical AND.',
	'andn':     'Logical NAND.',
	'or':       'Logical OR.',
	'xor':      'Logical Exclusive OR.',
	'not':      'One\'s complement negation.',
	'neg':      'Two\'s complement negation.',
  'bextr':    'Bit field extract.',
  'blsi':     'Extract lowest set isolated bit.',
  'blsmsk':   'Get mask up to lowest set bit.',
  'blsr':     'Reset lowest set bit.',
	'bsf':      'Bit scan forward.',
  'bsr':      'Bit scan reverse.',
  'bt':       'Bit test.',
  'btc':      'Bit test and complement.',
  'btr':      'Bit test and reset.',
  'bts':      'Bit test and set.',
  'bzhi':     'Zero high bits starting with specified bit position.',

	// general register control
  'bswap':    'Byte swap.',
  'cbw':        'Convert byte to word / convert word to doubleword / convert doubleword to quadword.',
  'cdq':        'Convert word to doubleword / convert doubleword to quadword.',
  'cdqe':       'Convert byte to word / convert word to doubleword / convert doubleword to quadword.',
	
	//packed data math
	'addpd':    'Add packed double precision floating-point values.',
	'addps':    'Add packed single precision floating-point values.',
	'addsd':    'Add scalar double precision floating-point values.',
	'addss':    'Add scalar single precision floating-point values.',
	'addsubpd': 'add/sub packed double precision floating-point.',
	'addsubps': 'add/sub packed single precision floating-point.',

	//packed register logic
	'andpd':    'Bitwise logical AND of packed double-precision floating-point values.',
  'andps':    'Bitwise logical AND of packed single-precision floating-point values.',
  'andnpd':   'Bitwise logical AND NOT of packed double-precision floating-point values.',
  'andnps':   'Bitwise logical AND NOT of packed single-precision floating-point values.',

	//blend 
	'blendpd':  'Blend packed double precision floating-point values.',
	'blendps':  'Blend packed single precision floating-point values.',
	'blendvpd': 'Variable blend packed double precision floating-point values.',
	'blendvps': 'Variable blend packed single precision floating-point values.',

	// AES
	'aesdec':          'Perform one round of an AES decryption flow.',
	'aesdec128kl':     'Perform ten rounds of AES decryption flow with Key Locker using 128-bit key.',
	'aesdec256kl':     'Perform 14 rounds of AES decryption flow with Key Locker using 256-bit key.',
	'aesdeclast':      'Perform last round of an AES decryption flow.',
	'aesdecwide128kl': 'Perform ten rounds of AES decryption flow with Key Locker on 8 blocks using 128-bit key.',
	'aesdecwide256kl': 'Perform 14 rounds of AES decryption flow with Key Locker on 8 blocks using 256-bit key.',
	'aesenc':          'Perform one round of an AES encryption flow.',
	'aesenc128kl':     'Perform ten rounds of AES encryption flow with Key Locker using 128-bit key.',
	'aesenc256kl':     'Perform 14 rounds of AES encryption flow with Key Locker using 256-bit key.',
	'aesenclast':      'Perform last round of an AES encryption flow.',
	'aesencwide128kl': 'Perform ten rounds of AES encryption flow with Key Locker on 8 blocks using 128-bit key.',
	'aesencwide256kl': 'Perform 14 rounds of AES encryption flow with Key Locker on 8 blocks using 256-bit key.',
	'aesimc':          'Perform the AES InvMixColumn transformation.',
	'aeskeygenassist': 'AES round key generation assist.',

	//ABC
	'aaa':      'ASCII Adjust After Addition (Can\' use in 64-bit).',
	'aas':      'ASCII Adjust After Subtraction (Can\' use in 64-bit).',
	'aam':      'ASCII Adjust After Multiplication (Can\' use in 64-bit).',
	'aad':      'ASCII Adjust Befor Devision (Can\' use in 64-bit).',

	//move
	'mov':      'Move data from source to destination.',
	'movl':     'Move data (32-bit long).',
	'movq':     'Move data (64-bit quad word).',
	'movb':     'Move data (8-bit byte).',
	'movw':     'Move data (16-bit word).',
	'cmov':     'Conditional move.',
	
	//push
	'push':     'Push source operand onto the stack.',
	'pushl':    'Push 32-bit value onto the stack.',
	'pushq':    'Push 64-bit value onto the stack.',
	
	//pop
	'pop':      'Pop top of stack into destination operand.',
	'popl':     'Pop 32-bit value from stack.',
	'popq':     'Pop 64-bit value from stack.',

	//jmp
	'jmp':      'Jump unconditionally.',
	'je':       'Jump if Equal (ZF=1).',
	'jne':      'Jump if Not Equal (ZF=0).',
	'jg':       'Jump if Greater (signed).',
	'jge':      'Jump if Greater or Equal (signed).',
	'jl':       'Jump if Less (signed).',
	'jle':      'Jump if Less or Equal (signed).',
	'jz':       'Jump if Zero.',
	'jnz':      'Jump if Not Zero.',
	
	//flag
	'test':       'Logical Compare (AND) (updates flags).',
	'cmp':        'Compare two operands.',
	'cmppd':      'Compare packed double precision floating-point values.',
	'cmpps':      'Compare packed single precision floating-point values.',
	'cmps':       'Compare string operands.',
	'cmpsb':      'Compare string operands (byte).',
	'cmpsd':      'Compare scalar double precision floating-point value.', 
	'cmpsl':      'Compare string operands (doubleword).',
	'cmpsq':      'Compare string operands (quadword).',
	'cmpss':      'Compare scalar single precision floating-point value.',
	'cmpsw':      'Compare string operands (word).',
	'cmpxchg':    'Compare and exchange.',
	'cmpxchg16b': 'Compare and exchange 16 bytes.',
	'cmpxchg8b':  'Compare and exchange 8 bytes.',
	'comisd':     'Compare scalar ordered double precision floating-point values and set EFLAGS.',
	'comiss':     'Compare scalar ordered single precision floating-point values and set EFLAGS.',

	//state bit
  'clac':       'Clear AC flag in EFLAGS register.',
  'clc':        'Clear carry flag.',
  'cld':        'Clear direction flag.',
  'cldemote':   'Cache line demote.',
  'clflush':    'Flush cache line.',
  'clflushopt': 'Flush cache line optimized.',
  'cli':        'Clear interrupt flag.',
  'clrssbsy':   'Clear busy flag in a supervisor shadow stack token.',
  'clts':       'Clear task-switched flag in CR0.',
  'clui':       'Clear user interrupt flag.',
	'clwb':       'Cache line write back.',
  'cmc':        'Complement carry flag.',
	
	//other
	'arpl':     'Adjust RPL field of segment selector.',
	'lea':      'Load Effective Address.',
	'nop':      'No Operation.',
	'int':      'Software Interrupt.',
	'hlt':      'stop cpu until a interrupt occurs.',
	'syscall':  'Fast system call.',








	//bound
  'bndcl':  'Check lower bound.',
  'bndcn':  'Check upper bound.',
  'bndcu':  'Check upper bound.',
  'bndldx': 'Load extended bounds using address translation.',
  'bndmk':  'Make bounds.',
  'bndmov': 'Move bounds.',
  'bndstx': 'Store extended bounds using address translation.',
  'bound':  'Check array index against bounds.',
};

//create Completion
function createCompletionItemsRegister(defs: RegisterType, kind: CompletionItemKind, typeName: string): CompletionItem[] {
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