// Invoice Generator Utility

export function generateInvoiceHtml({ order }: { order: any }) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: string | number, currency = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(amount.toString()));
  };

  // Calculate subtotal (without shipping)
  const subtotal = order.items.reduce((sum: number, item: any) => {
    return sum + parseFloat(item.subtotal);
  }, 0);

  // Format shipping cost
  const shippingCost = parseFloat(order.shippingCost || 0);

  // Format total amount
  const totalAmount = parseFloat(order.totalAmount);

  // Generate the invoice HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${order.orderNumber}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 30px;
          color: #333;
          background-color: #f9f9f9;
        }
        .invoice-container {
          background-color: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          padding: 40px;
          max-width: 210mm;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }
        .invoice-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, #2c5e2d, #f59e0b);
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          padding-bottom: 30px;
          border-bottom: 2px solid #f0f0f0;
          margin-bottom: 30px;
        }
        .logo-container {
          display: flex;
          flex-direction: column;
        }
        .logo {
          font-size: 36px;
          font-weight: 800;
          color: #2c5e2d;
          letter-spacing: -0.5px;
          position: relative;
          display: inline-block;
        }
        .logo span {
          color: #f59e0b;
          font-weight: 800;
        }
        .logo::after {
          content: "";
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 30px;
          height: 3px;
          background-color: #f59e0b;
          border-radius: 3px;
        }
        .company-details {
          font-size: 13px;
          color: #666;
          margin-top: 12px;
          line-height: 1.5;
        }
        .invoice-title {
          text-align: right;
        }
        .invoice-title h1 {
          margin: 0;
          font-size: 44px;
          font-weight: 800;
          background: linear-gradient(135deg, #2c5e2d, #4b9950);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          position: relative;
          display: inline-block;
        }
        .invoice-title h1:after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, #2c5e2d, #f59e0b);
          border-radius: 4px;
        }
        .invoice-title p {
          margin: 8px 0;
          font-size: 15px;
          color: #555;
        }
        .invoice-info {
          background-color: #f8fafd;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 35px;
          display: flex;
          justify-content: space-between;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
        }
        .invoice-info-item {
          flex: 1;
          padding: 0 15px;
          position: relative;
        }
        .invoice-info-item:not(:last-child)::after {
          content: "";
          position: absolute;
          top: 15%;
          right: 0;
          height: 70%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, #e0e0e0, transparent);
        }
        .invoice-info-item h4 {
          margin: 0 0 8px 0;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          font-weight: 600;
        }
        .invoice-info-item p {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
        .invoice-info-item p.status-paid {
          color: #2c5e2d;
          position: relative;
          display: inline-block;
          padding-left: 18px;
        }
        .invoice-info-item p.status-paid::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          font-weight: bold;
          color: #2c5e2d;
        }
        .invoice-info-item p.status-pending {
          color: #f59e0b;
          position: relative;
          display: inline-block;
          padding-left: 18px;
        }
        .invoice-info-item p.status-pending::before {
          content: "⏱";
          position: absolute;
          left: 0;
          top: 0;
          font-weight: bold;
          color: #f59e0b;
        }
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .invoice-details .left, .invoice-details .right {
          width: 48%;
        }
        .invoice-details h3 {
          margin-top: 0;
          font-size: 16px;
          color: #2c5e2d;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 15px;
        }
        .detail-group {
          margin-bottom: 4px;
        }
        .detail-label {
          font-size: 12px;
          color: #666;
        }
        .detail-value {
          font-size: 14px;
          font-weight: 500;
        }
        .addresses {
          margin-bottom: 40px;
        }
        .addresses .shipping {
          width: 100%;
          padding: 25px;
          border-radius: 10px;
          background-color: #f8fafd;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
          position: relative;
          overflow: hidden;
        }
        .addresses .shipping::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 5px;
          height: 100%;
          background: #2c5e2d;
          opacity: 0.7;
        }
        .addresses h3 {
          margin-top: 0;
          font-size: 16px;
          font-weight: 700;
          color: #2c5e2d;
          padding-bottom: 10px;
          margin-bottom: 15px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
        }
        .addresses h3::before {
          content: "📍";
          margin-right: 8px;
          font-size: 18px;
        }
        .address-line {
          margin-bottom: 6px;
          font-size: 14px;
          line-height: 1.4;
        }
        .address-line:first-of-type {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 8px;
        }
        .address-unavailable {
          font-style: italic;
          border-left: 3px solid #f59e0b;
          padding-left: 8px;
          margin: 5px 0;
          background-color: rgba(245, 158, 11, 0.08);
          border-radius: 0 4px 4px 0;
          padding: 6px 10px 6px 10px;
        }
        .address-warning {
          color: #d97706;
          display: flex;
          align-items: center;
          font-weight: 500;
        }
        .warning-icon {
          margin-right: 6px;
          font-style: normal;
        }
        .address-action {
          margin-top: 5px;
          margin-bottom: 10px;
        }
        .address-suggestion {
          color: #2c5e2d;
          font-size: 13px;
          font-style: italic;
          padding-left: 20px;
          position: relative;
        }
        .address-suggestion::before {
          content: "→";
          position: absolute;
          left: 5px;
          top: 0;
          color: #2c5e2d;
          font-weight: bold;
        }
        .text-amber-500 {
          color: #f59e0b;
        }
        .invoice-items {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin-bottom: 40px;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
        }
        .invoice-items th {
          background: linear-gradient(to right, #f8fafb, #f1f5f7);
          padding: 15px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          color: #444;
          border-bottom: 1px solid #e9ecef;
          position: relative;
        }
        .invoice-items th:first-child {
          border-top-left-radius: 10px;
        }
        .invoice-items th:last-child {
          border-top-right-radius: 10px;
        }
        .invoice-items td {
          padding: 16px 15px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          vertical-align: top;
        }
        .invoice-items tr:last-child td {
          border-bottom: none;
        }
        .invoice-items .item-name {
          font-weight: 600;
          color: #333;
        }
        .invoice-items .item-id {
          color: #777;
          font-size: 12px;
          margin-top: 3px;
        }
        .invoice-items tr:hover {
          background-color: #f8fafd;
        }
        .invoice-items tbody tr:last-child td:first-child {
          border-bottom-left-radius: 10px;
        }
        .invoice-items tbody tr:last-child td:last-child {
          border-bottom-right-radius: 10px;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .invoice-totals {
          width: 350px;
          margin-left: auto;
          margin-bottom: 40px;
          padding: 20px;
          border-radius: 10px;
          background-color: #f8fafd;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          border: 1px solid #f0f0f0;
        }
        .invoice-totals table {
          width: 100%;
          border-collapse: collapse;
        }
        .invoice-totals th {
          text-align: left;
          padding: 10px 0;
          font-weight: 500;
          font-size: 14px;
          color: #444;
        }
        .invoice-totals td {
          text-align: right;
          padding: 10px 0;
          font-size: 14px;
          font-weight: 500;
        }
        .invoice-totals tr.divider td, .invoice-totals tr.divider th {
          border-top: 1px solid #e5e8eb;
          padding-top: 15px;
        }
        .invoice-totals .total {
          margin-top: 10px;
          border-top: 2px solid #e0e0e0;
        }
        .invoice-totals .total th {
          font-size: 16px;
          font-weight: 700;
          color: #2c5e2d;
          padding-top: 15px;
        }
        .invoice-totals .total td {
          font-weight: 700;
          font-size: 18px;
          color: #2c5e2d;
          padding-top: 15px;
          position: relative;
        }
        .invoice-totals .total td::after {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(to right, transparent, #2c5e2d, transparent);
          opacity: 0.3;
          border-radius: 3px;
        }
        .invoice-notes {
          margin-top: 40px;
          padding: 20px;
          border-radius: 10px;
          background-color: #f8fafd;
          font-size: 14px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
          position: relative;
          overflow: hidden;
        }
        .invoice-notes::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 5px;
          background-color: #f59e0b;
          opacity: 0.7;
        }
        .invoice-notes h3 {
          margin-top: 0;
          font-size: 16px;
          font-weight: 700;
          color: #2c5e2d;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
        }
        .invoice-notes h3::before {
          content: "📝";
          margin-right: 8px;
          font-size: 18px;
        }
        .note-item {
          display: flex;
          margin-bottom: 10px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #eee;
        }
        .note-item:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .note-label {
          font-weight: 600;
          width: 150px;
          flex-shrink: 0;
          color: #444;
        }
        .note-value {
          color: #555;
          flex: 1;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          text-align: center;
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }
        .print-button {
          margin-top: 30px;
          text-align: center;
        }
        .print-button button {
          background: linear-gradient(to right, #2c5e2d, #38793a);
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(44, 94, 45, 0.25);
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .print-button button::before {
          content: "🖨️";
          margin-right: 8px;
          font-size: 18px;
        }
        .print-button button:hover {
          background: linear-gradient(to right, #224a24, #2c5e2d);
          box-shadow: 0 5px 8px rgba(44, 94, 45, 0.3);
          transform: translateY(-1px);
        }
        @media print {
          body {
            padding: 0;
            background-color: white;
          }
          .invoice-container {
            box-shadow: none;
            padding: 20px;
            max-width: none;
          }
          .print-button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="invoice-header">
          <div class="logo-container">
            <div class="logo">
              Poultry<span>Gear</span>
            </div>
            <div class="company-details">
              123 Poultry Lane, Chicken City, PC 12345<br>
              VAT ID: PG123456789 | Registration: 987654321
            </div>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p>Invoice #: <strong>${order.orderNumber}</strong></p>
            <p>Date: <strong>${formatDate(order.createdAt)}</strong></p>
          </div>
        </div>
        
        <div class="invoice-info">
          <div class="invoice-info-item">
            <h4>Order Status</h4>
            <p>${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          </div>
          <div class="invoice-info-item">
            <h4>Payment Status</h4>
            <p class="${order.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
              ${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </p>
          </div>
          <div class="invoice-info-item">
            <h4>Payment Method</h4>
            <p>${(order.paymentMethod || 'Not specified').charAt(0).toUpperCase() + (order.paymentMethod || 'Not specified').slice(1)}</p>
          </div>
          <div class="invoice-info-item">
            <h4>Currency</h4>
            <p>${order.currency}</p>
          </div>
        </div>
        
        <div class="invoice-details">
          <div class="left">
            <h3>From</h3>
            <div class="detail-group">
              <div class="detail-label">Company</div>
              <div class="detail-value">PoultryGear Co.</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Address</div>
              <div class="detail-value">123 Poultry Lane</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">City, Zip</div>
              <div class="detail-value">Chicken City, PC 12345</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Email</div>
              <div class="detail-value">info@poultrygear.com</div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Phone</div>
              <div class="detail-value">(123) 456-7890</div>
            </div>
          </div>
          <div class="right">
            <h3>Customer</h3>
            <div class="detail-group">
              <div class="detail-label">Name</div>
              <div class="detail-value">
                ${order.shippingAddress?.firstName && order.shippingAddress?.lastName 
                  ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` 
                  : order.user?.username || 'Guest'}
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Customer ID</div>
              <div class="detail-value">
                ${order.userId 
                  ? `<span style="color: #2c5e2d; font-weight: 500;">${order.user?.username || ''}</span> (ID: ${order.userId})` 
                  : '<span style="color: #f59e0b;">Guest</span>'}
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Email</div>
              <div class="detail-value">
                ${order.shippingAddress?.email || order.user?.email || 'Not provided'}
              </div>
            </div>
            <div class="detail-group">
              <div class="detail-label">Phone</div>
              <div class="detail-value">
                ${order.shippingAddress?.phone || 'Not provided'}
              </div>
            </div>
          </div>
        </div>
        
        <div class="addresses">
          <div class="shipping">
            <h3>Shipping Address</h3>
            ${order.shippingAddress ? `
              <div class="address-line">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</div>
              <div class="address-line">${order.shippingAddress.address}</div>
              <div class="address-line">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</div>
              <div class="address-line">${order.shippingAddress.country}</div>
              ${order.shippingAddress.phone ? `<div class="address-line">Phone: ${order.shippingAddress.phone}</div>` : ''}
            ` : order.user ? `
              <div class="address-line"><strong>${order.user.username || 'Customer'}</strong></div>
              <div class="address-line address-unavailable">
                <span class="address-warning"><i class="warning-icon">⚠️</i> No shipping address provided</span>
              </div>
              <div class="address-line address-action">
                <span class="address-suggestion">Please add shipping address during checkout for faster delivery</span>
              </div>
              ${order.user.email ? `<div class="address-line"><strong>Email:</strong> ${order.user.email}</div>` : ''}
            ` : `
              <div class="address-line"><strong>Guest Order</strong></div>
              <div class="address-line address-unavailable">
                <span class="address-warning"><i class="warning-icon">⚠️</i> No shipping address provided</span>
              </div>
              <div class="address-line address-action">
                <span class="address-suggestion">Please register and add shipping address for future orders</span>
              </div>
            `}
          </div>
        </div>
        
        <table class="invoice-items">
          <thead>
            <tr>
              <th width="5%">#</th>
              <th width="45%">Description</th>
              <th width="15%" class="text-center">Quantity</th>
              <th width="15%" class="text-right">Price</th>
              <th width="20%" class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>
                  <div class="item-name">${item.product?.name || 'Product no longer available'}</div>
                  ${item.product?.id ? `<div class="item-id">Product ID: ${item.product.id}</div>` : ''}
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right">${formatCurrency(item.unitPrice, order.currency)}</td>
                <td class="text-right">${formatCurrency(item.subtotal, order.currency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="invoice-totals">
          <table>
            <tr>
              <th>Subtotal</th>
              <td>${formatCurrency(subtotal, order.currency)}</td>
            </tr>
            <tr>
              <th>Shipping</th>
              <td>${formatCurrency(shippingCost, order.currency)}</td>
            </tr>
            ${parseFloat(shippingCost.toString()) > 0 ? `
            <tr class="divider">
              <th>Tax</th>
              <td>${formatCurrency("0", order.currency)}</td>
            </tr>
            ` : ''}
            <tr class="total">
              <th>Total</th>
              <td>${formatCurrency(totalAmount, order.currency)}</td>
            </tr>
          </table>
        </div>
        
        <div class="invoice-notes">
          <h3>Additional Information</h3>
          <div class="note-item">
            <div class="note-label">Payment Status:</div>
            <div class="note-value">${order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</div>
          </div>
          <div class="note-item">
            <div class="note-label">Shipping Method:</div>
            <div class="note-value">${order.shippingMethod || 'Standard Shipping'}</div>
          </div>
          ${order.notes ? `
          <div class="note-item">
            <div class="note-label">Notes:</div>
            <div class="note-value">${order.notes}</div>
          </div>
          ` : ''}
        </div>
        
        <div class="footer">
          Thank you for your business with PoultryGear!<br>
          For any inquiries, please contact our customer service at support@poultrygear.com
        </div>
        
        <div class="print-button">
          <button onclick="window.print()">Print Invoice</button>
        </div>
      </div>
      
      <script>
        // Auto-print when the page loads
        window.onload = function() {
          // Uncomment the line below to automatically trigger printing when opened
          // window.print();
          
          // Make all text elements editable when in edit mode
          document.addEventListener('DOMContentLoaded', function() {
            // Check if parent page has put us in edit mode
            if (window.parent && window.parent.document.querySelector('.edit-mode')) {
              const editableElements = document.querySelectorAll('.invoice-container *:not(script):not(style)');
              editableElements.forEach(el => {
                if (el.children.length === 0 || el.tagName === 'TD' || el.tagName === 'TH' || 
                    el.classList.contains('detail-value') || el.classList.contains('note-value') || 
                    el.classList.contains('address-line')) {
                  el.setAttribute('contenteditable', 'true');
                }
              });
            }
          });
        };
      </script>
    </body>
    </html>
  `;
}