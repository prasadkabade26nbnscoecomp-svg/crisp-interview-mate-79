export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  fullText: string;
}

export class ResumeParser {
  static async parsePDF(file: File): Promise<ResumeData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // For now, we'll use a simple text extraction approach
          // In a production app, you'd use pdf-parse or similar
          const text = await this.extractTextFromPDF(uint8Array);
          const parsed = this.extractInfoFromText(text);
          
          resolve({
            ...parsed,
            fullText: text
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  static async parseDOCX(file: File): Promise<ResumeData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // For now, we'll extract basic text
          // In production, use mammoth.js properly
          const text = await this.extractTextFromDOCX(arrayBuffer);
          const parsed = this.extractInfoFromText(text);
          
          resolve({
            ...parsed,
            fullText: text
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read DOCX file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private static async extractTextFromPDF(uint8Array: Uint8Array): Promise<string> {
    // Simplified PDF text extraction
    // In production, use pdf-parse or PDF.js
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(uint8Array);
    
    // Extract readable text (this is a simplified approach)
    const readableText = text.match(/BT\s.*?ET/g)?.join(' ') || text;
    return readableText.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private static async extractTextFromDOCX(arrayBuffer: ArrayBuffer): Promise<string> {
    // Simplified DOCX text extraction
    // In production, use mammoth.js properly
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(arrayBuffer);
    
    // Extract readable text (this is a simplified approach)
    return text.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private static extractInfoFromText(text: string): Omit<ResumeData, 'fullText'> {
    const result: Omit<ResumeData, 'fullText'> = {};

    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) {
      result.email = emailMatch[0];
    }

    // Extract phone number
    const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
    if (phoneMatch) {
      result.phone = phoneMatch[0];
    }

    // Extract name (simplified approach - look for capitalized words at the beginning)
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines.slice(0, 5)) {
      const nameMatch = line.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (nameMatch && !nameMatch[0].includes('@') && !nameMatch[0].match(/\d/)) {
        result.name = nameMatch[0];
        break;
      }
    }

    return result;
  }

  static getMissingFields(data: ResumeData): string[] {
    const missing: string[] = [];
    
    if (!data.name) missing.push('name');
    if (!data.email) missing.push('email');
    if (!data.phone) missing.push('phone');
    
    return missing;
  }
}