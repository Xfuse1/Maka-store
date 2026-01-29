const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/lib/products-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to capture: "/path/to/image.ext?query..."
// We assume they start with / and have .jpg or .svg extensions and contain ?height= or ?width=
const regex = /"(\/[^"]+\.(jpg|svg|png))\?height=[^"]*"/g;

let replacements = 0;

const newContent = content.replace(regex, (match, filePath, ext) => {
    replacements++;
    // If it's already a placeholder file, just strip the query string
    if (filePath.includes('placeholder')) {
        return `"${filePath}"`;
    }
    // Otherwise replace with placeholder.jpg (photo)
    return `"/placeholder.jpg"`;
});

fs.writeFileSync(filePath, newContent);
console.log(`Replaced ${replacements} image strings.`);
