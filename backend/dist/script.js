"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() { await prisma.contract.updateMany({ data: { status: 'ACTIVE' } }); console.log('Done'); }
main();
//# sourceMappingURL=script.js.map