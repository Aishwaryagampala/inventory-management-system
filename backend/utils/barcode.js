const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');

const generateBarcodeImage = async (sku, barcodeText) => {
    try {
        const png = await bwipjs.toBuffer({
            bcid: 'code128',       
            text: barcodeText,     
            scale: 3,              
            height: 10,            
            includetext: true,     
            textxalign: 'center', 
        });

        const barcodeDir = path.join(__dirname, '..', 'barcodes');
        const filePath = path.join(barcodeDir, `${sku}.png`);

        if (!fs.existsSync(barcodeDir)) {
            fs.mkdirSync(barcodeDir);
        }

        fs.writeFileSync(filePath, png);

        const barcodeUrl = `/api/products/barcode/${sku}`; // frontend can hit this URL to get the image

        return `/api/products/barcode/${sku}`;
        
    } catch (err) {
        console.error(`Error generating barcode for SKU ${sku}:`, err);
        throw err;
    }
};

module.exports = {generateBarcodeImage}
