const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

try {
  const doc = new Docxtemplater(new PizZip(), {
    delimiters: { start: '{{', end: '}}' }
  });
  console.log('Success');
} catch(e) {
  console.log(e.message);
}
