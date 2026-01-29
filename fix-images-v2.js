const fs = require('fs');
const path = require('path');

const publicDir = path.join(process.cwd(), 'public');
const filePath = path.join(process.cwd(), 'src/lib/products-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Regex to capture: "/path/to/image.ext"
// matching strings starting with / and ending with typical image extensions
const regex = /"(\/[^"]+\.(jpg|jpeg|png|svg|webp))"/gi;

let replacements = 0;

const newContent = content.replace(regex, (match, urlPath) => {
    // Remove query strings if any (though we cleaned them, just in case)
    const cleanPath = urlPath.split('?')[0];

    // Construct local system path
    // Remove leading slash for join
    const relativePath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
    const fullPath = path.join(publicDir, relativePath);

    if (fs.existsSync(fullPath)) {
        // File exists, keep it (but maybe clean query string from original match if we want, 
        // strictly speaking we are replacing the whole match string).
        // If the original match had no query string, it's fine.
        // If it did, we are essentially stripping it if we return `"${cleanPath}"`.
        // But the regex captures the path part inside quotes.
        // Wait, regex `/"(\/[^"]+\.(jpg...))"/` will match `"/foo.jpg"` but NOT `"/foo.jpg?q=1"` because of the quote at the end.

        // Actually, my previous script removed query strings, so now most should be `"/foo.jpg"`.
        // But some like `"/elegant...modest-fashion.jpg"` remained.

        return `"${cleanPath}"`;
    } else {
        // File does not exist
        replacements++;
        return `"/placeholder.jpg"`;
    }
});

fs.writeFileSync(filePath, newContent);
console.log(`Replaced ${replacements} missing image references.`);
