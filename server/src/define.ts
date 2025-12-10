import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';

//item
type ItemType = Record<string,string>;

// 生のデータリスト（メンテナンスしやすいように文字列のまま定義）
export const REGISTERS: ItemType = {
	// 64-bit Ragisters
	'%rax': 'Accumulator Register (64-bit). Used for arithmetic and return values.',
	'%rbx': 'Base Register (64-bit). General purpose, often used as a base pointer.',
	'%rcx': 'Counter Register (64-bit). Used for loops and string operations.',
	'%rdx': 'Data Register (64-bit). Used for I/O and arithmetic.',
	'%rsi': 'Source Index (64-bit). Used for string operations (source).',
	'%rdi': 'Destination Index (64-bit). Used for string operations (destination) and 1st argument.',
	'%rsp': 'Stack Pointer (64-bit). Points to the top of the stack.',
	'%rbp': 'Base Pointer (64-bit). Points to the base of the stack frame.',
	'%r8':  'General Purpose Register (64-bit).',
	'%r9':  'General Purpose Register (64-bit).',
	'%r10': 'General Purpose Register (64-bit).',
	'%r11': 'General Purpose Register (64-bit).',
	'%r12': 'General Purpose Register (64-bit).',
	'%r13': 'General Purpose Register (64-bit).',
	'%r14': 'General Purpose Register (64-bit).',
	'%r15': 'General Purpose Register (64-bit).',

	// 32-bit Ragisters
	'%eax': 'Accumulator Register (32-bit lower half of %rax).',
	'%ebx': 'Base Register (32-bit lower half of %rbx).',
	'%ecx': 'Counter Register (32-bit lower half of %rcx).',
	'%edx': 'Data Register (32-bit lower half of %rdx).',
	'%esi': 'Source Index (32-bit).',
	'%edi': 'Destination Index (32-bit).',
	'%esp': 'Stack Pointer (32-bit).',
	'%ebp': 'Base Pointer (32-bit).',
	
	// Segment Registers
	'%cs': 'Code Segment.',
	'%ds': 'Data Segment.',
	'%es': 'Extra Segment.',
	'%fs': 'F Segment (often used for thread-local storage).',
	'%gs': 'G Segment.',
	'%ss': 'Stack Segment.',

	// Control Registers
	'%cr0': 'Control Register 0. Controls operating mode and states.',
	'%cr2': 'Control Register 2. Page Fault Linear Address.',
	'%cr3': 'Control Register 3. Page Directory Base Address.',
	'%cr4': 'Control Register 4. Architectural extensions.'
};

export const OPCODES: ItemType = {
	//move
	'mov':     'Move data from source to destination.',
	'movl':    'Move data (32-bit long).',
	'movq':    'Move data (64-bit quad word).',
	'movb':    'Move data (8-bit byte).',
	'movw':    'Move data (16-bit word).',
	
	//push
	'push':    'Push source operand onto the stack.',
	'pushl':   'Push 32-bit value onto the stack.',
	'pushq':   'Push 64-bit value onto the stack.',
	
	//pop
	'pop':     'Pop top of stack into destination operand.',
	'popl':    'Pop 32-bit value from stack.',
	'popq':    'Pop 64-bit value from stack.',
	
	//ret/call
	'ret':     'Return from procedure.',
	'call':    'Call procedure.',
	
	//math
	'add':     'Add source to destination.',
	'sub':     'Subtract source from destination.',
	'imul':    'Signed multiply.',
	'idiv':    'Signed divide.',
	
	//logic
	'and':     'Logical AND.',
	'or':      'Logical OR.',
	'xor':     'Logical Exclusive OR.',
	'not':     'One\'s complement negation.',
	'neg':     'Two\'s complement negation.',
	
	//inc/dec
	'inc':     'Increment operand by 1.',
	'dec':     'Decrement operand by 1.',
	
	//jmp
	'jmp':     'Jump unconditionally.',
	'je':      'Jump if Equal (ZF=1).',
	'jne':     'Jump if Not Equal (ZF=0).',
	'jg':      'Jump if Greater (signed).',
	'jge':     'Jump if Greater or Equal (signed).',
	'jl':      'Jump if Less (signed).',
	'jle':     'Jump if Less or Equal (signed).',
	'jz':      'Jump if Zero.',
	'jnz':     'Jump if Not Zero.',
	
	//flag
	'cmp':     'Compare two operands (updates flags).',
	'test':    'Logical Compare (AND) (updates flags).',
	
	//other
	'lea':     'Load Effective Address.',
	'nop':     'No Operation.',
	'int':     'Software Interrupt.',
	'hlt':     'stop cpu until a interrupt occurs.',
	'syscall': 'Fast system call.'
};

//create Completion
function createCompletionItems(defs: ItemType, kind: CompletionItemKind, typeName: string): CompletionItem[] {
    return Object.entries(defs).map(([name, description]) => ({
        label: name,
        kind: kind,
        detail: typeName,           
        documentation: description
    }));
}

export const COMPLETION_ITEMS_REGISTER = createCompletionItems(REGISTERS, CompletionItemKind.Variable, 'Register');
export const COMPLETION_ITEMS_OPCODE   = createCompletionItems(OPCODES  , CompletionItemKind.Keyword , 'Instruction');