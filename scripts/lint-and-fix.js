#!/usr/bin/env node

/**
 * Script de Validação e Correção de Identação
 * 
 * Este script automatiza a verificação e correção de:
 * 1. Identação de código (ESLint + Prettier)
 * 2. Consistência de layout (Tailwind classes)
 * 3. Responsividade dos componentes
 * 
 * Uso:
 *   node scripts/lint-and-fix.js [arquivo/diretorio]
 *   node scripts/lint-and-fix.js --check (apenas verificação)
 *   node scripts/lint-and-fix.js --all (todos os arquivos)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function runCommand(command, description) {
  log(`📦 ${description}...`, 'cyan');
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    if (output.trim()) {
      console.log(output);
    }
    return true;
  } catch (error) {
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return false;
  }
}

function findFiles(dir, pattern) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules' && item !== 'dist') {
      files.push(...findFiles(fullPath, pattern));
    } else if (pattern.test(item)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];
  
  // Verificar imports não utilizados
  const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(s => s.trim());
    const source = match[2];
    
    for (const imp of imports) {
      // Ignorar React e hooks comuns
      if (['React', 'useState', 'useEffect', 'useCallback', 'useMemo'].includes(imp)) {
        continue;
      }
      
      // Verificar se o import é usado no arquivo
      const usageRegex = new RegExp(`\\b${imp}\\b`, 'g');
      const usages = content.match(usageRegex);
      
      if (!usages || usages.length <= 1) {
        issues.push(`⚠️  Import '${imp}' from '${source}' pode não estar sendo utilizado`);
      }
    }
  }
  
  return issues;
}

function checkTailwindClasses(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Verificar classes duplicadas
  const classRegex = /className={cn\(([\s\S]*?)\)}/g;
  let match;
  
  while ((match = classRegex.exec(content)) !== null) {
    const classBlock = match[1];
    
    // Verificar classes inconsistentes de cores dark
    if (classBlock.includes('dark:') && classBlock.includes('bg-white')) {
      issues.push(`🎨 Classe dark: encontrada junto com bg-white - possível inconsistência de tema`);
    }
    
    // Verificar padding/margin inconsistente
    const paddingMatches = classBlock.match(/p-\d+/g);
    if (paddingMatches && paddingMatches.length > 1) {
      const unique = [...new Set(paddingMatches)];
      if (unique.length > 1) {
        issues.push(`📏 Múltiplos valores de padding: ${unique.join(', ')}`);
      }
    }
  }
  
  return issues;
}

function checkResponsiveClasses(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Verificar se componentes críticos têm classes responsivas
  const hasMobileClasses = /sm:|md:|lg:|xl:/.test(content);
  const hasGrid = /grid-cols-/.test(content);
  const hasFlex = /flex-/.test(content);
  
  if (hasGrid && !hasMobileClasses) {
    issues.push(`📱 Grid sem classes responsivas (sm:, md:, lg:) - pode quebrar em mobile`);
  }
  
  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const isCheckOnly = args.includes('--check');
  const isAllFiles = args.includes('--all');
  const target = args.find(arg => !arg.startsWith('--')) || 'src';
  
  logSection('🔍 SISTEMA DE VALIDAÇÃO DE IDENTAÇÃO');
  
  log(`Modo: ${isCheckOnly ? 'VERIFICAÇÃO' : 'CORREÇÃO'}`, 'yellow');
  log(`Target: ${target}\n`, 'yellow');
  
  // 1. Verificar se ferramentas estão instaladas
  logSection('1. VERIFICAÇÃO DE DEPENDÊNCIAS');
  
  const tools = [
    { cmd: 'npx eslint --version', name: 'ESLint' },
    { cmd: 'npx prettier --version', name: 'Prettier' },
  ];
  
  for (const tool of tools) {
    const installed = runCommand(tool.cmd, `Verificando ${tool.name}`);
    if (!installed) {
      log(`❌ ${tool.name} não encontrado. Instalando...`, 'red');
      runCommand('npm install -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier-plugin-tailwindcss', 'Instalando dependências');
    } else {
      log(`✅ ${tool.name} OK\n`, 'green');
    }
  }
  
  // 2. ESLint - Verificação de identação
  logSection('2. ESLINT - PADRONIZAÇÃO DE CÓDIGO');
  
  const eslintCmd = isCheckOnly 
    ? `npx eslint "${target}" --ext .ts,.tsx --max-warnings=0`
    : `npx eslint "${target}" --ext .ts,.tsx --fix`;
  
  const eslintSuccess = runCommand(eslintCmd, 'Executando ESLint');
  
  if (eslintSuccess) {
    log('✅ ESLint passou sem erros\n', 'green');
  } else if (isCheckOnly) {
    log('❌ ESLint encontrou problemas\n', 'red');
    process.exit(1);
  } else {
    log('⚠️  ESLint encontrou problemas que não puderam ser corrigidos automaticamente\n', 'yellow');
  }
  
  // 3. Prettier - Formatação
  logSection('3. PRETTIER - FORMATAÇÃO AUTOMÁTICA');
  
  const prettierCmd = isCheckOnly
    ? `npx prettier --check "${target}/**/*.{ts,tsx,json,md,css}"`
    : `npx prettier --write "${target}/**/*.{ts,tsx,json,md,css}"`;
  
  const prettierSuccess = runCommand(prettierCmd, 'Executando Prettier');
  
  if (prettierSuccess) {
    log('✅ Prettier passou\n', 'green');
  } else if (isCheckOnly) {
    log('❌ Prettier encontrou arquivos não formatados\n', 'red');
    process.exit(1);
  }
  
  // 4. Análise de código personalizada
  logSection('4. ANÁLISE DE LAYOUT E RESPONSIVIDADE');
  
  const files = isAllFiles 
    ? findFiles('.', /\.(tsx|ts)$/)
    : [target].filter(f => fs.existsSync(f));
  
  let totalIssues = 0;
  
  for (const file of files) {
    if (fs.statSync(file).isDirectory()) continue;
    
    const importIssues = checkImports(file);
    const tailwindIssues = checkTailwindClasses(file);
    const responsiveIssues = checkResponsiveClasses(file);
    
    const allIssues = [...importIssues, ...tailwindIssues, ...responsiveIssues];
    
    if (allIssues.length > 0) {
      log(`\n📄 ${file}:`, 'cyan');
      allIssues.forEach(issue => console.log(`   ${issue}`));
      totalIssues += allIssues.length;
    }
  }
  
  if (totalIssues === 0) {
    log('✅ Nenhum problema de layout encontrado\n', 'green');
  } else {
    log(`\n⚠️  Total de issues: ${totalIssues}\n`, 'yellow');
  }
  
  // 5. Validação de build
  logSection('5. VALIDAÇÃO DE BUILD');
  
  const buildSuccess = runCommand('npm run build', 'Compilando projeto');
  
  if (buildSuccess) {
    log('✅ Build realizado com sucesso\n', 'green');
  } else {
    log('❌ Build falhou\n', 'red');
    process.exit(1);
  }
  
  // Resumo
  logSection('✨ RESUMO');
  
  if (eslintSuccess && prettierSuccess && buildSuccess && totalIssues === 0) {
    log('🎉 TODAS AS VALIDAÇÕES PASSARAM!', 'green');
    log('✅ Código pronto para produção', 'green');
    process.exit(0);
  } else {
    log('⚠️  ALGUMAS VALIDAÇÕES ENCONTRARAM PROBLEMAS', 'yellow');
    log('📝 Revise os warnings acima', 'yellow');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
