
export enum ReceiptStatus {
  PAID = 'Paid',
  PENDING = 'Pending',
  CANCELLED = 'Cancelled',
  PARTIAL = 'Partially Paid'
}

export interface Receipt {
  id: string;
  date: string;
  receiptNo: string;
  name: string;
  itemDescription: string;
  customerRequest: string;
  quantity: number;
  price: number;
  discount: number;
  amount: number; // Qty * Price
  totalAmount: number; // Amount - Discount
  status: ReceiptStatus;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalDiscount: number;
  totalCancelled: number;
  activeReceiptCount: number;
  cancelledReceiptCount: number;
}
