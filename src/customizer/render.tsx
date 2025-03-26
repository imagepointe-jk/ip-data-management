// import { CartStateProductView } from "@/types/schema/customizer";
// import { productEditorSize } from "@/constants";
// import puppeteer, { Browser } from "puppeteer";
// import { convertDesignerObjectData } from "./utils";

// //! A cached browser will be running constantly in order to reduce cold start up time for renders.
// //! Monitor resource usage, and consider a cron job that periodically restarts the browser during off-hours.
// let cachedBrowser: Browser | null = null;
// let browserBeingInitialized: Promise<Browser> | null = null;
// async function getBrowser() {
//   if (cachedBrowser) return cachedBrowser;
//   if (browserBeingInitialized) return browserBeingInitialized;

//   browserBeingInitialized = puppeteer.launch({
//     args: ["--no-sandbox"],
//   });
//   cachedBrowser = await browserBeingInitialized;
//   browserBeingInitialized = null;

//   return cachedBrowser;
// }

// //use puppeteer to render a single view with Konva and a real chromium browser
// export async function renderCartProductView(
//   view: CartStateProductView,
//   bgImgUrl: string,
//   renderScale = 1
// ) {
//   const browser = await getBrowser();
//   const page = await browser.newPage();

//   await page.setContent(`
//       <html>
//       <head>
//       </head>
//       <body>
//       <div id="container">
//       <script src="https://unpkg.com/konva@9/konva.min.js"></script>
//       </div>
//       </body>
//       </html>
//     `);

//   const renderSize = productEditorSize * renderScale;
//   //process the view here using some existing functions since we can't pass functions to the headless browser
//   // const processedView = {
//   //   locations: view.locations.map((location) => ({
//   //     artworks: location.artworks.map((artwork) => {
//   //       const { position, size } = convertDesignerObjectData(
//   //         renderSize,
//   //         renderSize,
//   //         artwork.objectData
//   //       );
//   //       return {
//   //         imageUrl: artwork.imageUrl,
//   //         objectData: {
//   //           position,
//   //           size,
//   //           rotationDegrees: artwork.objectData.rotationDegrees,
//   //         },
//   //       };
//   //     }),
//   //     texts: location.texts.map((text) => {
//   //       const { position, size } = convertDesignerObjectData(
//   //         renderSize,
//   //         renderSize,
//   //         text.objectData
//   //       );
//   //       const unscaledFontSize = text.textData.style?.fontSize;
//   //       return {
//   //         textData: {
//   //           text: text.textData.text,
//   //           style: {
//   //             ...text.textData.style,
//   //             fontSize: unscaledFontSize
//   //               ? unscaledFontSize * renderScale
//   //               : undefined,
//   //           },
//   //         },

//   //         objectData: {
//   //           position,
//   //           size,
//   //           rotationDegrees: text.objectData.rotationDegrees,
//   //         },
//   //       };
//   //     }),
//   //   })),
//   // };

//   await page.evaluate(
//     async (bgImgUrl, processedView, renderSize) => {
//       const Konva = (window as any).Konva; //Konva will be there because of the above script tag, so force TS to recognize it
//       const Image = (window as any).Image;

//       //temp test font
//       const font = new FontFace(
//         "Londrina Sketch",
//         'url("https://fonts.gstatic.com/s/londrinasketch/v25/c4m41npxGMTnomOHtRU68eIJn8qvXmP4.woff2")'
//       );
//       await font.load();
//       document.fonts.add(font);

//       const stage = new Konva.Stage({
//         container: "container",
//         width: renderSize,
//         height: renderSize,
//         id: "canvas",
//       });

//       const layer = new Konva.Layer();

//       const bgImgObj = await loadImage(bgImgUrl);
//       const bgImgNode = new Konva.Image({
//         x: 0,
//         y: 0,
//         width: renderSize,
//         height: renderSize,
//         image: bgImgObj,
//       });
//       layer.add(bgImgNode);

//       for (const location of processedView.locations) {
//         for (const artwork of location.artworks) {
//           const { rotationDegrees, position, size } = artwork.objectData;
//           const imgObj = await loadImage(artwork.imageUrl);
//           const imgNode = new Konva.Image({
//             x: position.x,
//             y: position.y,
//             width: size.x,
//             height: size.y,
//             rotation: rotationDegrees,
//             image: imgObj,
//           });
//           layer.add(imgNode);
//         }
//         for (const text of location.texts) {
//           const {
//             objectData: { rotationDegrees, position, size },
//             textData: { text: textStr, style },
//           } = text;

//           const textKonva = new Konva.Text({
//             fill: style?.hexCode,
//             fontSize: style?.fontSize,
//             fontStyle: style?.fontStyle,
//             fontFamily: "Londrina Sketch",
//             align: style?.align,
//             textDecoration: style?.textDecoration,
//             stroke: style?.strokeHexCode || undefined,
//             strokeWidth: style?.strokeWidth,
//             x: position.x,
//             y: position.y,
//             width: size.x,
//             height: size.y,
//             rotation: rotationDegrees,
//             text: textStr,
//           });
//           layer.add(textKonva);
//         }
//       }

//       stage.add(layer);

//       //from https://stackoverflow.com/questions/2342132/waiting-for-image-to-load-in-javascript/66180709#66180709
//       async function loadImage(src: string) {
//         return new Promise((resolve, reject) => {
//           const img = new Image();
//           img.onload = () => resolve(img);
//           img.onerror = reject;
//           img.src = src;
//         });
//       }
//     },
//     bgImgUrl,
//     processedView,
//     renderSize
//   );

//   const canvas = await page.$("canvas");
//   if (!canvas) throw new Error("no canvas");
//   const screenshotBuffer = await canvas.screenshot({ type: "jpeg" });

//   await page.close();
//   return screenshotBuffer;
// }
