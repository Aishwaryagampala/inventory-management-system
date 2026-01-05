# Testing Guide: Notifications & Email

## ✅ Frontend Notifications (Toast)

**What was implemented:**

- Replaced all `alert()` calls with modern toast notifications
- Using `react-toastify` library
- Toast appears in top-right corner with 3-second auto-close

**Components Updated:**

1. ✅ **ProductsPage.js** - Product CRUD operations
2. ✅ **AdminInventoryLogsView.js** - Log deletion
3. ✅ **AddProductModal.js** - Product creation
4. ✅ **AddUserModal.js** - User creation
5. ✅ **AdminReportsView.js** - Export operations

**How to Test:**

1. **Add Product**: Click "Add Product" → Fill form → Submit
   - Success: Green toast "Product added successfully!"
2. **Delete Product**: Click delete icon on any product
   - Success: Green toast "Product deleted successfully"
3. **Update Product**: Edit product → Save changes
   - Success: Green toast "Product updated successfully"
4. **Delete Log** (Admin only): Go to Inventory Logs → Click delete on any log
   - Success: Green toast "Log deleted successfully"
5. **Export Data** (Admin): Reports page → Select export option
   - Success: Green toast "[type] exported successfully!"
6. **Error Cases**: Try invalid operations
   - Errors appear as red toasts with descriptive messages

---

## 📧 Email Functionality (Low Stock Alerts)

**What was implemented:**

- Full nodemailer integration in `backend/utils/mailer.js`
- Sends emails to all admin users when stock is low
- Uses SMTP (Gmail configured)

**Email Configuration (.env):**

```
EMAIL_USER=demo4.comp@gmail.com
EMAIL_PASS='utrs iahp izij ecwz'
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

**When Emails are Sent:**
Low stock alerts trigger when a product quantity drops below its reorder level during:

1. Sale operation (`updateQuantity()`)
2. Product update (`updateProduct()`)
3. Barcode scan sale (`updateProductbyBarcode()`)

**Email Content Includes:**

- Product name and SKU
- Current quantity vs reorder level
- Suggested order quantity (calculated from 30-day average sales × 5-day lead time)

**How to Test:**

### Option 1: Console Test (Development Mode)

If EMAIL_USER or EMAIL_PASS not set, emails log to console:

1. **Check console when low stock triggered:**

   ```
   [MAIL:DEV] { to: ['admin@example.com'], subject: 'Low Stock Alert: Product Name' }
   <html content>
   ```

2. **Look for:**
   ```
   Low stock email queued for: admin@example.com
   ```

### Option 2: Real Email Test

1. **Setup Product with Low Reorder Level:**

   - Create/edit product
   - Set quantity: 10
   - Set reorder_level: 15
   - Save

2. **Trigger Low Stock:**

   - Go to Products page
   - Click "Update Quantity" on the product
   - Select "Sale"
   - Enter amount: 1
   - Submit

3. **Check Backend Console:**

   ```
   [MAIL:SENT] Message sent to admin@example.com: <message-id>
   ```

4. **Check Admin Email Inbox:**
   - Subject: "Low Stock Alert: [Product Name]"
   - From: IMS Alert <demo4.comp@gmail.com>

### Option 3: Database Query Test

Check if admin emails are being fetched:

```sql
SELECT email FROM users WHERE user_role = 'admin';
```

Should return email addresses that will receive alerts.

---

## 🛠️ Troubleshooting

### Toasts Not Showing:

- Check browser console for errors
- Verify frontend is running (`npm start`)
- Check if `ToastContainer` is in App.js

### Emails Not Sending:

1. **Check Backend Console:**

   - Look for `[MAIL:ERROR]` messages
   - Verify Gmail credentials are correct

2. **Gmail App Password:**

   - If using Gmail, ensure you're using an App Password, not regular password
   - 2FA must be enabled to generate App Passwords
   - Generate at: https://myaccount.google.com/apppasswords

3. **Test Email Credentials:**

   ```javascript
   // Run in backend terminal
   node -e "const nodemailer = require('nodemailer'); const t = nodemailer.createTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:'demo4.comp@gmail.com',pass:'utrs iahp izij ecwz'}}); t.verify().then(console.log).catch(console.error);"
   ```

4. **Check Firewall/Port:**
   - Ensure port 465 is not blocked
   - Try port 587 with `secure: false`

---

## 📝 Quick Test Checklist

### Frontend Notifications:

- [ ] Product added → Green toast appears
- [ ] Product deleted → Green toast appears
- [ ] Product updated → Green toast appears
- [ ] Log deleted → Green toast appears
- [ ] Export successful → Green toast appears
- [ ] Error occurs → Red toast with error message

### Email Alerts:

- [ ] Backend server running
- [ ] Admin user exists with valid email
- [ ] Product with low stock (qty < reorder_level)
- [ ] Perform sale to trigger low stock
- [ ] Check backend console for `[MAIL:SENT]` or `[MAIL:DEV]`
- [ ] Check admin email inbox for alert

---

## 🔧 Production Recommendations

1. **Email Service:**

   - Consider using SendGrid, AWS SES, or Mailgun for production
   - More reliable than Gmail SMTP
   - Better deliverability

2. **Notification System:**

   - Current implementation is sufficient
   - Consider adding notification history/inbox for admins
   - Add notification preferences (email vs in-app)

3. **Error Handling:**

   - Email failures don't block application
   - Errors logged to console
   - Consider adding retry mechanism

4. **Rate Limiting:**
   - Add cooldown period to prevent spam
   - Don't send multiple emails for same product within X hours
