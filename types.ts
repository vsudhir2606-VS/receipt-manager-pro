
export enum ReceiptStatus {
  WORK_IN_PROGRESS = 'Work in Progress',
  PENDING = 'Pending',
  PAID = 'Paid',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
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
  advance: number;
  amount: number; // Qty * Price
  totalAmount: number; // Amount - Discount
  balance: number; // Total Amount - Advance
  status: ReceiptStatus;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalDiscount: number;
  totalCancelled: number;
  activeReceiptCount: number;
  cancelledReceiptCount: number;
}