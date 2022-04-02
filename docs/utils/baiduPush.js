/**
 * 生成百度链接推送文件
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk')
const matter = require('gray-matter'); // FrontMatter解析器 https://github.com/jonschlinkert/gray-matter
const readFileList = require('./modules/readFileList');
const basePath = path.join(__dirname, '..');
const urlsRoot = path.join(__dirname, '..', 'urls.txt'); // 百度链接推送文件

console.log(urlsRoot)
const DOMAIN = process.argv.splice(2)[0]; // 获取命令行传入的参数

if (!DOMAIN) {
    console.log(chalk.red('请在运行此文件时指定一个你要进行百度推送的域名参数，例：node utils/baiduPush.js https://www.share-java.com'))
    return
}

main();

/**
 * 主体函数
 */
function main() {
    fs.writeFileSync(urlsRoot, DOMAIN)
    const files = readFileList(); // 读取所有md文件数据

    files.forEach( file => {
        const newUrl = '\r\n'+ DOMAIN +  file.filePath.replace(basePath,'').replace('.md','.html')
        console.log(newUrl)
        fs.appendFileSync(urlsRoot, newUrl);
    })
}