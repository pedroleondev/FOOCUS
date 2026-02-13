import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const devices = [
  { name: 'iPhone-SE', width: 375, height: 667 },
  { name: 'iPhone-12', width: 390, height: 844 },
  { name: 'iPhone-14-Pro', width: 393, height: 852 },
  { name: 'Pixel-7', width: 412, height: 915 },
  { name: 'Samsung-S24', width: 384, height: 854 }
];

async function captureMobileScreenshots() {
  console.log('🎭 Iniciando Playwright para screenshots mobile...\n');
  
  const browser = await chromium.launch();
  
  for (const device of devices) {
    console.log(`📱 Capturando: ${device.name} (${device.width}x${device.height})`);
    
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: 2
    });
    
    const page = await context.newPage();
    
    try {
      await page.goto('https://foocus.metagente360.cloud/', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Aguarda renderização completa
      await page.waitForTimeout(2000);
      
      const screenshotPath = join(__dirname, '..', 'screenshots', `mobile-${device.name}.png`);
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: false 
      });
      
      console.log(`   ✅ Salvo: mobile-${device.name}.png`);
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}`);
    }
    
    await context.close();
  }
  
  await browser.close();
  console.log('\n🎬 Screenshots concluídos!');
}

captureMobileScreenshots();
