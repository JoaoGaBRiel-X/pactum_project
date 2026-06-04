const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');

const content = fs.readFileSync('uploads/templates/1780518933073_template.docx', 'binary'); // I don't know the exact name, let's create a dummy template.
