// x86-64 register list
export const WORD_REGISTERS = [
    '%eax', '%ebx', '%ecx', '%edx', '%esi', '%edi', '%esp', '%ebp',
    '%rax', '%rbx', '%rcx', '%rdx', '%rsi', '%rdi', '%rsp', '%rbp',
    '%r8', '%r9', '%r10', '%r11', '%r12', '%r13', '%r14', '%r15',
    '%cs', '%ds', '%es', '%fs', '%gs', '%ss',
    '%cr0', '%cr2', '%cr3', '%cr4', 
    '%db0', '%db1', '%db2', '%db3', '%db6', '%db7'
];

// x86-64 opecode list
export const WORD_OPCODES = [
    'mov', 'movl', 'movq', 'movb', 'movw',
    'push', 'pushl', 'pushq', 
    'pop', 'popl', 'popq',
    'ret', 'call', 
    'jmp', 'je', 'jne', 'jg', 'jge', 'jl', 'jle', 'jz', 'jnz',
    'add', 'addl', 'addq', 
    'sub', 'subl', 'subq',
    'imul', 'idiv', 
    'and', 'or', 'xor', 'not', 'neg',
    'inc', 'dec',
    'cmp', 'test', 
    'lea', 'nop', 'int', 'syscall'
];