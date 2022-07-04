import fs from "fs";

export default function fixDeprecatedBuffer() {
    const files = fs.readdirSync("./dist", { withFileTypes: true });
    for (const file of files.filter(x => x.isFile())) {
        const content = fs.readFileSync(`./dist/${file.name}`, "utf8");
        const fixedContent = content.replace(/new Buffer\(/g, "Buffer.from(");
        fs.writeFileSync(`./dist/${file.name}`, fixedContent, "utf8");
    }
}
