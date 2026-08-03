const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            callback(dirPath);
        }
    });
}

const mappings = [
    { regex: /\b(focus:bg-white)\b/g, add: 'dark:focus:bg-gray-900' },
    { regex: /\b(bg-white)\b/g, add: 'dark:bg-gray-900' },
    { regex: /\b(bg-gray-50)\b/g, add: 'dark:bg-gray-950' },
    { regex: /\b(bg-gray-100)\b/g, add: 'dark:bg-gray-900' },
    { regex: /\b(bg-gray-200)\b/g, add: 'dark:bg-gray-800' },
    { regex: /\b(bg-slate-50)\b/g, add: 'dark:bg-gray-950' },
    { regex: /\b(bg-slate-100)\b/g, add: 'dark:bg-gray-900' },
    { regex: /\b(text-gray-900)\b/g, add: 'dark:text-white' },
    { regex: /\b(text-gray-800)\b/g, add: 'dark:text-gray-200' },
    { regex: /\b(text-gray-700)\b/g, add: 'dark:text-gray-300' },
    { regex: /\b(text-gray-600)\b/g, add: 'dark:text-gray-400' },
    { regex: /\b(text-gray-500)\b/g, add: 'dark:text-gray-400' },
    { regex: /\b(border-gray-100)\b/g, add: 'dark:border-gray-800' },
    { regex: /\b(border-gray-200)\b/g, add: 'dark:border-gray-800' },
    { regex: /\b(border-gray-300)\b/g, add: 'dark:border-gray-700' },
    { regex: /\b(hover:bg-gray-50)\b/g, add: 'dark:hover:bg-gray-900' },
    { regex: /\b(hover:bg-gray-100)\b/g, add: 'dark:hover:bg-gray-800' },
    { regex: /\b(hover:text-gray-700)\b/g, add: 'dark:hover:text-gray-300' },
    { regex: /\b(hover:text-gray-900)\b/g, add: 'dark:hover:text-white' },
];

const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'violet', 'indigo', 'cyan', 'teal', 'pink'];
colors.forEach(color => {
    mappings.push({ regex: new RegExp(`\\b(bg-${color}-50)\\b`, 'g'), add: `dark:bg-${color}-900/20` });
    mappings.push({ regex: new RegExp(`\\b(bg-${color}-100)\\b`, 'g'), add: `dark:bg-${color}-900/30` });
    mappings.push({ regex: new RegExp(`\\b(text-${color}-600)\\b`, 'g'), add: `dark:text-${color}-400` });
    mappings.push({ regex: new RegExp(`\\b(text-${color}-700)\\b`, 'g'), add: `dark:text-${color}-400` });
    mappings.push({ regex: new RegExp(`\\b(text-${color}-800)\\b`, 'g'), add: `dark:text-${color}-300` });
    mappings.push({ regex: new RegExp(`\\b(text-${color}-900)\\b`, 'g'), add: `dark:text-${color}-200` });
    mappings.push({ regex: new RegExp(`\\b(border-${color}-100)\\b`, 'g'), add: `dark:border-${color}-900/50` });
    mappings.push({ regex: new RegExp(`\\b(border-${color}-200)\\b`, 'g'), add: `dark:border-${color}-800` });
});

let changed = 0;

walkDir('./app', (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    let newContent = content.replace(/(["'`])([\s\S]*?)\1/g, (match, quote, inner) => {
        // Only process strings that likely contain tailwind classes
        if (!inner.includes('-')) return match; 
        
        let modifiedInner = inner;
        mappings.forEach(m => {
            if (m.regex.test(modifiedInner)) {
                m.regex.lastIndex = 0; // reset regex state
                
                let prefix = m.add.split('-').slice(0, -1).join('-');
                
                if (m.add.startsWith('dark:focus:bg-')) prefix = 'dark:focus:bg-';
                else if (m.add.startsWith('dark:hover:bg-')) prefix = 'dark:hover:bg-';
                else if (m.add.startsWith('dark:hover:text-')) prefix = 'dark:hover:text-';
                else if (m.add.startsWith('dark:bg-')) prefix = 'dark:bg-';
                else if (m.add.startsWith('dark:text-')) prefix = 'dark:text-';
                else if (m.add.startsWith('dark:border-')) prefix = 'dark:border-';
                
                if (!modifiedInner.includes(prefix)) {
                    modifiedInner = modifiedInner.replace(m.regex, `$1 ${m.add}`);
                }
            }
        });
        return quote + modifiedInner + quote;
    });

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent);
        console.log(`Updated: ${filePath}`);
        changed++;
    }
});

console.log(`Modified ${changed} files.`);
