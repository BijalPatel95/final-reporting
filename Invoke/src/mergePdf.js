require('dotenv').config();
const PdfDocument = require('hummus-recipe');
async function superImpose(filename) {
    const pdfDoc = new PdfDocument(filename);
    const len = pdfDoc.metadata.pages;
    console.log(len);
    console.log(pdfDoc);
    for (let i = 1; i <= len; i++) {
        
        pdfDoc.editPage(i);
        pdfDoc.overlay('./src/Report Template L3.pdf');
        pdfDoc.endPage();
    }
    pdfDoc.endPDF();
}

exports.superImpose = superImpose;