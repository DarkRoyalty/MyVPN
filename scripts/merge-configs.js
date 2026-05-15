const fs = require('fs');
const path = require('path');

const GITHUB_MIRROR = 'https://raw.githubusercontent.com/DarkRoyalty/shnajder-vpn-configs/main/githubmirror/';
const OUTPUT_FILE = './servers.json';

async function fetchFile(url) {
  const response = await fetch(url);
  return response.text();
}

async function mergeAll() {
  const allLinks = [];
  
  for (let i = 1; i <= 26; i++) {
    try {
      const url = `${GITHUB_MIRROR}${i}.txt`;
      const content = await fetchFile(url);
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && (trimmed.startsWith('vless://') || trimmed.startsWith('trojan://') || trimmed.startsWith('vmess://'))) {
          allLinks.push(trimmed);
        }
      }
      console.log(`✅ Файл ${i}.txt: добавлено ${lines.length} строк`);
    } catch (err) {
      console.error(`❌ Ошибка ${i}.txt:`, err.message);
    }
  }
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ servers: allLinks }, null, 2));
  console.log(`\n🎉 Готово! Всего серверов: ${allLinks.length}`);
  console.log(`📁 Файл сохранён: ${OUTPUT_FILE}`);
}

mergeAll();
