export interface SmartBillClient {
  name: string;
  vatCode?: string; // CUI for B2B, empty for B2C if not applicable
  regCom?: string; // J... for B2B
  address: string;
  isTaxPayer: boolean;
  city: string;
  county: string;
  country: string;
  email?: string;
}

export interface SmartBillProduct {
  name: string;
  code: string;
  isTaxIncluded: boolean;
  taxName: string; // e.g., 'Normala' (19%) or 'Scutita'
  taxPercentage: number;
  measuringUnitName: string;
  currency: string;
  quantity: number;
  price: number;
  isService: boolean;
}

export interface SmartBillInvoiceRequest {
  companyVatCode: string;
  client: SmartBillClient;
  issueDate: string;
  seriesName: string;
  isDraft: boolean;
  dueDate: string;
  deliveryDate: string;
  products: SmartBillProduct[];
  mentions?: string;
  observations?: string;
}

export const generateSmartBillInvoice = async (invoiceData: SmartBillInvoiceRequest) => {
  const username = process.env.SMARTBILL_USERNAME;
  const token = process.env.SMARTBILL_TOKEN;
  const companyVatCode = process.env.SMARTBILL_COMPANY_VAT_CODE;

  if (!username || !token) {
    console.warn("SmartBill credentials not found. Returning mock invoice.");
    // Return mock data so the app can continue working without real credentials
    return {
      series: invoiceData.seriesName || 'TYS',
      number: `MOCK-${Math.floor(Math.random() * 10000)}`,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Placeholder PDF
    };
  }

  // Inject company VAT code from env if not provided
  if (!invoiceData.companyVatCode) {
    invoiceData.companyVatCode = companyVatCode || '';
  }

  const authHeader = `Basic ${Buffer.from(`${username}:${token}`).toString('base64')}`;

  try {
    const response = await fetch('https://ws.smartbill.ro/SBORO/api/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Accept': 'application/json'
      },
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SmartBill API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return {
      series: data.series,
      number: data.number,
      // The API doesn't directly return a PDF URL, it returns an endpoint you can call to get the PDF
      // For simplicity, we'll construct the URL that the user can use to download the PDF through our backend
      url: `/api/invoices/download?cui=${invoiceData.companyVatCode}&series=${data.series}&number=${data.number}`
    };
  } catch (error) {
    console.error("SmartBill generation error:", error);
    throw error;
  }
};
