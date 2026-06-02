import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  if (file.type === "application/pdf") {
    const parser = new PDFParse(new Uint8Array(arrayBuffer));
    const result = await parser.getText();
    return result.text;
  }

  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(arrayBuffer),
    });
    return result.value;
  }

  throw new Error(`不支持的文件格式: ${file.type}`);
}
