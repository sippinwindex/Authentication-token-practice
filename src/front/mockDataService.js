// src/front/services/mockDataService.js - Demo service with fake data
export const mockDataService = {
  // Mock user data
  mockUser: {
    id: 1,
    email: "demo@example.com",
    is_active: true
  },

  // Mock invoice data
  mockInvoices: [
    {
      id: 1,
      invoice_number: "INV-2024-001",
      invoice_amount: 1250.00,
      invoice_date: "2024-01-15",
      user_id: 1
    },
    {
      id: 2,
      invoice_number: "INV-2024-002", 
      invoice_amount: 875.50,
      invoice_date: "2024-02-10",
      user_id: 1
    },
    {
      id: 3,
      invoice_number: "INV-2024-003",
      invoice_amount: 2100.75,
      invoice_date: "2024-03-05",
      user_id: 1
    },
    {
      id: 4,
      invoice_number: "INV-2024-004",
      invoice_amount: 450.25,
      invoice_date: "2024-03-20",
      user_id: 1
    }
  ],

  // Mock authentication
  async mockLogin(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email && password) {
          const mockToken = "demo-jwt-token-" + Date.now();
          resolve({
            token: mockToken,
            access_token: mockToken,
            user: this.mockUser
          });
        } else {
          throw new Error("Invalid credentials");
        }
      }, 1000); // Simulate network delay
    });
  },

  // Mock registration
  async mockRegister(email, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "User created successfully. Please log in."
        });
      }, 1000);
    });
  },

  // Mock get invoices
  async mockGetInvoices() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          invoices: [...this.mockInvoices]
        });
      }, 500);
    });
  },

  // Mock create invoice
  async mockCreateInvoice(invoiceData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newInvoice = {
          id: this.mockInvoices.length + 1,
          invoice_number: `INV-${Date.now()}`,
          invoice_amount: parseFloat(invoiceData.invoice_amount),
          invoice_date: invoiceData.invoice_date,
          user_id: 1
        };
        this.mockInvoices.unshift(newInvoice);
        resolve(newInvoice);
      }, 500);
    });
  },

  // Mock update invoice
  async mockUpdateInvoice(invoiceId, invoiceData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoice = this.mockInvoices.find(inv => inv.id === invoiceId);
        if (invoice) {
          invoice.invoice_amount = parseFloat(invoiceData.invoice_amount);
          invoice.invoice_date = invoiceData.invoice_date;
        }
        resolve(invoice);
      }, 500);
    });
  },

  // Mock delete invoice
  async mockDeleteInvoice(invoiceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.mockInvoices.findIndex(inv => inv.id === invoiceId);
        if (index > -1) {
          this.mockInvoices.splice(index, 1);
        }
        resolve({ success: true });
      }, 500);
    });
  },

  // Mock get single invoice
  async mockGetInvoice(invoiceId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoice = this.mockInvoices.find(inv => inv.id === parseInt(invoiceId));
        resolve(invoice);
      }, 500);
    });
  }
};