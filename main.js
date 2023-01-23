const fs = require('fs');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const { chromium } = require('playwright');

function launchChromeAndRunLighthouse(url, flags = {}, config = null) {
   return chromeLauncher.launch(flags).then((chrome) => {
      flags.port = chrome.port;
      return lighthouse(url, flags, config).then((results) => chrome.kill().then(() => results));
   });
}

const translations = {
   es: {
      title: 'Informes de Lighthouse',
      subtitle: 'Más detalles en cada enlace',
      description: 'Estos informes se generaron a través de un script',
      lang: 'Español',
   },
   gl: {
      title: 'Informes de Lighthouse',
      subtitle: 'Máis detalles en cada enlace',
      description: 'Estes informes foron xerados a través dun script',
      lang: 'Galego',
   },
   en: {
      title: 'Lighthouse reports',
      subtitle: 'More details in each link',
      description: 'These reports were generated via a script',
      lang: 'English',
   },
};
// LightHouse options
const options = {
   logLevel: 'info',
   output: 'html',
   onlyCategories: ['performance', 'accessibility', 'seo'],
   chromeFlags: ['--headless'],
   settings: {
      formFactor: 'desktop',
   },
};

const langs = ['es', 'gl', 'en'];

(async () => {
   const browser = await chromium.launch();
   const page = await browser.newPage();
   await page.goto('https://xabierlameiro.com/sitemap.xml');
   // get site map inside a body
   const sitemap = await page.$eval('body', (el) => el.innerHTML);
   // get all urls inside sitemap
   const urls = sitemap.match(/<loc>(.*?)<\/loc>/g).map((url) => url.replace(/<\/?loc>/g, ''));
   // split urls in locales bearing in mind that 'en' is the default locale and it's not included in the url
   let locales = urls.reduce((acc, url) => {
      let locale = url.split('/')[3];
      if (locale !== 'gl' && locale !== 'es') {
         locale = 'en';
      }
      if (!acc[locale]) {
         acc[locale] = [];
      }
      acc[locale].push(url);
      return acc;
   }, {});

   const index = locales.en.indexOf('https://xabierlameiro.com');
   locales.en[index] = 'https://xabierlameiro.com/home';

   await browser.close();

   // clean and create output folder
   // if (fs.existsSync('output')) {
   //    fs.rmdirSync('output', { recursive: true });
   // }
   // if (!fs.existsSync('output')) {
   //    fs.mkdirSync('output');
   // }
   // Object.keys(locales).forEach((locale) => {
   //    if (!fs.existsSync(`output/${locale}`)) {
   //       fs.mkdirSync(`output/${locale}`);
   //    }
   // });

   for (const lang of langs) {
      let levels = {};

      for (const url of locales[lang]) {
         // Report
         // const result = await launchChromeAndRunLighthouse(
         //    url === 'https://xabierlameiro.com/home' ? 'https://xabierlameiro.com' : url,
         //    options,
         // );
         let fileName = url.split('/').pop();

         if (fileName === 'es' || fileName === 'gl') {
            fileName = 'home';
         }
         // write report in output folder
         // fs.writeFileSync(`output/${lang}/${fileName}.html`, result.report);

         const cleanUrl = url.replace(/https:\/\/xabierlameiro.com\//, '');
         const urlWithoutLocale = cleanUrl.replace(/(gl|es)\//, '');

         const urlSplitted = urlWithoutLocale.split('/');
         let currentLevel = levels;
         for (let i = 0; i < urlSplitted.length; i++) {
            const part = urlSplitted[i];
            if (i === urlSplitted.length - 1) {
               if (!currentLevel[part]) {
                  currentLevel[part] = [];
               }

               currentLevel[part].push({
                  url: url,
                  route: `../${lang}/${fileName}.html`,
                  locale: lang,
               });
            } else {
               if (!currentLevel[part]) {
                  currentLevel[part] = {};
               }
               currentLevel = currentLevel[part];
            }
         }
      }
      // Make connectors.js file
      const config = {
         ...chart,
         nodeStructure: {
            ...nodeStructure,
            children: Object.keys(levels).map((firstLevel) => {
               let url = '';
               if (Array.isArray(levels[firstLevel])) {
                  url = levels[firstLevel].find((item) => item.locale === lang);
               }
               return {
                  text: { name: firstLevel === 'es' || firstLevel === 'gl' ? 'home' : firstLevel },
                  ...(url && { link: { href: url?.route } }),
                  stackChildren: true,
                  connectors: {
                     style: {
                        stroke: '#8080FF',
                        'arrow-end': 'block-wide-long',
                     },
                  },

                  ...(Object.keys(levels[firstLevel]).length > 0 && {
                     children: Object.keys(levels[firstLevel]).map((secondLevel) => {
                        if (isNaN(secondLevel)) {
                           let url = '';
                           if (Array.isArray(levels[firstLevel][secondLevel])) {
                              url = levels[firstLevel][secondLevel].find((item) => item.locale === lang);
                           }

                           return {
                              text: { name: secondLevel },
                              ...(url && { link: { href: url?.route } }),
                              drawLineThrough: true,
                              collapsable: true,
                              stackChildren: true,
                              connectors: {
                                 stackIndent: 30,
                                 style: {
                                    stroke: '#E3C61A',
                                    'arrow-end': 'block-wide-long',
                                 },
                              },

                              ...(Object.keys(levels[firstLevel][secondLevel]).length > 0 && {
                                 children: Object.keys(levels[firstLevel][secondLevel]).map((thirdLevel) => {
                                    if (isNaN(thirdLevel)) {
                                       let url = '';
                                       if (Array.isArray(levels[firstLevel][secondLevel][thirdLevel])) {
                                          url = levels[firstLevel][secondLevel][thirdLevel].find(
                                             (item) => item.locale === lang,
                                          );
                                       }

                                       return {
                                          text: { name: thirdLevel },
                                          ...(url && { link: { href: url?.route } }),
                                          drawLineThrough: true,
                                          collapsable: true,
                                          stackChildren: true,
                                       };
                                    }
                                 }),
                              }),
                           };
                        }
                     }),
                  }),
               };
            }),
         },
      };
      // clean empty childrens
      config.nodeStructure.children.forEach((item) => {
         if (item.children && item.children.every((item) => item === undefined)) {
            delete item.children;
         } else if (item.children) {
            item.children.forEach((item) => {
               if (item.children && item.children.every((item) => item === undefined)) {
                  delete item.children;
               }
            });
         }
      });
      // write connectors to make a tree
      fs.writeFileSync(`output/${lang}/connectors.js`, `const config = ${JSON.stringify(config, null, 2)}`);
      // Make links for the others languages
      const links = langs
         .filter((item) => item !== lang)
         .map((item) => `<li><a href="../${item}/index.html">${translations[item].lang}</a></li>`);

      // write entry point
      fs.writeFileSync(
         `output/${lang}/index.html`,
         `<!DOCTYPE html>
            <html lang="${lang}">
               <head>
                  <meta charset="utf-8" />
                  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
                  <meta name="viewport" content="width=device-width" />
                  <title>${translations[lang].title}</title>
                  <link rel="stylesheet" href="../../assets/connectors.css" />
                  <meta name="robots" content="noindex" />
                  <link rel="icon" href="/favicon.svg" title="The favicon" />
               </head>
               <body class="container">
                  <h1>${translations[lang].title}</h1>
                  <h2>${translations[lang].subtitle}</h2>
                  <p class="notice">${translations[lang].description}</p>
                  <ul class="links">${links.join('')}</ul>
                  <div class="chart" id="OrganiseChart-big-commpany"></div>
            
                  <script src="../../assets/raphael.js"></script>
                  <script src="../../assets/Treant.js"></script>
                  <script src="../${lang}/connectors.js"></script>
            
                  <script>
                     new Treant(config);
                  </script>
               </body>
            </html>`,
      );
   }
})();

const chart = {
   chart: {
      container: '#OrganiseChart-big-commpany',
      levelSeparation: 40,
      siblingSeparation: 20,
      subTeeSeparation: 30,
      rootOrientation: 'NORTH',
      nodeAlign: 'BOTTOM',

      connectors: {
         type: 'step',
         style: {
            'stroke-width': 2,
         },
      },
      node: {
         HTMLclass: 'big-commpany',
      },
   },
};

const nodeStructure = {
   text: { name: 'xabierlameiro.com' },
   HTMLclass: 'domain',
   drawLineThrough: true,
   collapsable: true,
   connectors: {
      style: {
         stroke: 'blue',
         'arrow-end': 'oval-wide-long',
      },
   },
};
