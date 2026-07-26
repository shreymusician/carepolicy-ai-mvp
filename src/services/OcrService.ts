import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import { OcrError } from '../types/analysis';

export interface OcrResult {
  text: string;
  method: 'DIGITAL_PDF' | 'SCANNED_PDF' | 'IMAGE_OCR' | 'IMAGE_DIRECT';
  confidence: 'high' | 'medium' | 'low';
  pageCount?: number;
}

export class OcrService {
  async extractTextFromPdf(pdfBuffer: Buffer): Promise<OcrResult> {
    try {
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new OcrError('PDF buffer is empty');
      }

      // First, try to extract text from digital PDF
      const pdfData = await pdfParse(pdfBuffer);

      if (pdfData.text && pdfData.text.trim().length > 100) {
        // Digital PDF with substantial text content
        return {
          text: pdfData.text,
          method: 'DIGITAL_PDF',
          confidence: 'high',
          pageCount: pdfData.numpages
        };
      }

      // PDF likely scanned or has minimal text - use OCR
      return await this.performOcrOnPdf(pdfBuffer, pdfData.numpages);
    } catch (error) {
      if (error instanceof OcrError) {
        throw error;
      }
      throw new OcrError(
        `Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async extractTextFromImage(imageBuffer: Buffer, mimeType: string): Promise<OcrResult> {
    try {
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new OcrError('Image buffer is empty');
      }

      // Validate MIME type
      const validMimes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validMimes.includes(mimeType)) {
        throw new OcrError(`Unsupported image format: ${mimeType}`);
      }

      // Use Tesseract for image OCR
      return await this.performOcrOnImage(imageBuffer);
    } catch (error) {
      if (error instanceof OcrError) {
        throw error;
      }
      throw new OcrError(
        `Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async performOcrOnPdf(_pdfBuffer: Buffer, pageCount?: number): Promise<OcrResult> {
    try {
      // For now, use Tesseract on PDF via image conversion
      // In production, would use more sophisticated PDF OCR
      console.log('Performing OCR on scanned PDF...');

      // Try to convert PDF to image and perform OCR
      // For MVP, we'll mark as scanned but with lower confidence
      return {
        text: '', // Would implement proper PDF to image conversion and OCR
        method: 'SCANNED_PDF',
        confidence: 'medium',
        pageCount
      };
    } catch (error) {
      throw new OcrError(
        `OCR on PDF failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async performOcrOnImage(imageBuffer: Buffer): Promise<OcrResult> {
    try {
      // Optimize image for OCR using sharp
      const optimized = await sharp(imageBuffer)
        .grayscale()
        .threshold()
        .toBuffer();

      // Perform OCR using Tesseract
      const result = await Tesseract.recognize(optimized, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      });

      const text = result.data.text;

      if (!text || text.trim().length === 0) {
        throw new OcrError('OCR produced no readable text from image');
      }

      return {
        text,
        method: 'IMAGE_OCR',
        confidence: result.data.confidence > 80 ? 'high' : 'medium'
      };
    } catch (error) {
      throw new OcrError(
        `Image OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async extractText(fileBuffer: Buffer, mimeType?: string): Promise<string> {
    try {
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new OcrError('File buffer is empty');
      }

      // Determine file type and use appropriate extraction
      if (mimeType?.includes('pdf') || this.isPdfBuffer(fileBuffer)) {
        const result = await this.extractTextFromPdf(fileBuffer);
        return result.text;
      } else if (mimeType?.includes('image') || this.isImageBuffer(fileBuffer)) {
        const result = await this.extractTextFromImage(fileBuffer, mimeType || 'image/jpeg');
        return result.text;
      }

      throw new OcrError('File type could not be determined or is not supported');
    } catch (error) {
      if (error instanceof OcrError) {
        throw error;
      }
      throw new OcrError(
        `Unexpected error in text extraction: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private isPdfBuffer(buffer: Buffer): boolean {
    // PDF magic number: %PDF
    return buffer.length >= 4 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;
  }

  private isImageBuffer(buffer: Buffer): boolean {
    if (buffer.length < 4) return false;

    // PNG magic number: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return true;
    }

    // JPEG magic number: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return true;
    }

    return false;
  }
}

export default new OcrService();
