const puppeteer = require('puppeteer');
const fs = require('fs');

const split = (value, index) => [value.slice(0, index), value.slice(index)]
const minify = it => it.replace(/\s+/g, ' ');

(async() => {
    try {
        const arguments = process.argv;

        if (!arguments[2] || (!arguments[2].includes('https://sketchfab.com/') && !arguments[2].includes('/3d-models/'))) {
            console.log('Please provide a valid sketchfab model url.');
            return;
        }

        const browser = await puppeteer.launch({headless: false, devtools: true, args: ['--disable-web-security']});
        const page = (await browser.pages())[0];
        
        await page.setBypassCSP(true);
        await page.setRequestInterception(true);

        const source_texture = fs.readFileSync('extract_textures.js', 'utf8');
        const source_geometry = fs.readFileSync('extract_geometry.js', 'utf8');

        page.on('request', async(request) => {
            if (request.url().includes('.js')) {
                const request_intercept = new Request(request.url(), {
                    method: request.method(),
                    headers: request.headers()
                });
                
                const response_intercept = await fetch(request_intercept);

                let body = await response_intercept.text();
                let index1 = body.search(/\},.\}const .=function\(.,.,.,.,.,.\)/); //body.indexOf('},g}const v=function(t,e,i,r,n,a)');
                let index2 = body.indexOf('this._viewer.requestRedraw(),this._viewer.frame()'); // body.search(/var .=.,.=.\[.\(\d*\)\]\(\),.=.\.getInstanceID\(\);/);

                if (index1 != -1) {
                    const [prefix, suffix] = split(body, index1);
                    body = prefix + minify(source_texture) + suffix;
                    console.log("Intercepted texture source.");
                } else if (index2 != -1) {
                    const [prefix, suffix] = split(body, index2);
                    body = prefix + minify(source_geometry) + suffix;
                    console.log("Intercepted geometry source.");
                }

                request.respond({
                    status: response_intercept.status,
                    contentType: response_intercept.contentType,
                    body: body
                });
            } else {
                request.continue();
            }
        });

        page.exposeFunction('adm_log', async(data) => {
            console.log(data);
        });
    
        page.exposeFunction('adm_download', async(filename, data) => {
            if (fs.existsSync('output/' + filename)) {
                return;
            }

            console.log('Generating output/' + filename);

            if (filename.includes('.png')) {
                data = data.split(',')[1];
                fs.writeFileSync('output/' + filename, data, 'base64');
            } else {
                fs.writeFileSync('output/' + filename, data);
            }
        });

        await page.goto(arguments[2], {waitUntil: 'networkidle2', timeout: 0});
    } catch (err) {
        console.error(err);
    }
})();
