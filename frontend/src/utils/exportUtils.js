import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export const exportTxt = (text, filename) => {
  const element = document.createElement("a");
  const file = new Blob([text], {type: 'text/plain'});
  element.href = URL.createObjectURL(file);
  element.download = `${filename}.txt`;
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
  document.body.removeChild(element);
};

export const exportPdf = (text, filename) => {
  const doc = new jsPDF();
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - margin * 2;
  
  const textLines = doc.splitTextToSize(text, maxLineWidth);
  
  let cursorY = margin;
  for (let i = 0; i < textLines.length; i++) {
    if (cursorY > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(textLines[i], margin, cursorY);
    cursorY += 7; // line height
  }
  
  doc.save(`${filename}.pdf`);
};

export const exportWord = async (text, filename) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: text.split('\n').map(line => 
        new Paragraph({
          children: [new TextRun(line)],
        })
      ),
    }],
  });

  const blob = await Packer.toBlob(doc);
  const element = document.createElement("a");
  element.href = URL.createObjectURL(blob);
  element.download = `${filename}.docx`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
