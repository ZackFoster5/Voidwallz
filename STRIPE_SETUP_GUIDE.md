# Stripe Payment Integration Guide - Test Mode

## 📋 Prerequisites
- Stripe account (create one at https://stripe.com)
- Node.js and npm installed
- Voidwallz project running locally

---

## 🔑 Step 1: Get Your Stripe Test API Keys

1. **Sign up/Login to Stripe**
   - Go to https://stripe.com and create an account
   - Verify your email

2. **Enable Test Mode**
   - In the Stripe Dashboard, toggle the **"Test mode"** switch (top right corner)
   - Make sure it's ON (you should see "Test mode" badge)

3. **Get API Keys**
   - Go to **Developers** → **API keys**
   - Copy these keys:
     ```
     Publishable key: pk_test_xxxxxxxxxxxxx
     Secret key: sk_test_xxxxxxxxxxxxx
     ```

---

## 💰 Step 2: Create Products in Stripe

1. **Go to Products**
   - Click **Products** in the left sidebar
   - Click **+ Add product**

2. **Create Premium Yearly Plan**
   - Name: `Void Premium`
   - Description: `Premium wallpaper access - Yearly`
   - Click **Add pricing**
   - Price: `39.99` USD
   - Billing period: `Recurring` → `Yearly`
   - Click **Add product**
   - **Copy the Price ID** (e.g., `price_1AbCdEfGhIjKlMnO`)

3. **Create Lifetime Plan**
   - Name: `Void Lifetime`
   - Description: `Lifetime access to all wallpapers`
   - Click **Add pricing**
   - Price: `99.99` USD
   - Billing period: `One time`
   - Click **Add product**
   - **Copy the Price ID** (e.g., `price_1PqRsTuVwXyZaBcD`)

---

## 🔗 Step 3: Set Up Webhook Endpoint

1. **Go to Webhooks**
   - **Developers** → **Webhooks**
   - Click **+ Add endpoint**

2. **Configure Webhook**
   - Endpoint URL: `http://localhost:3000/api/stripe/webhook`
     *(For production, use your domain: `https://yourdomain.com/api/stripe/webhook`)*
   
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Get Webhook Secret**
   - After creating, click on the webhook
   - Click **"Reveal"** under "Signing secret"
   - **Copy the secret** (e.g., `whsec_xxxxxxxxxxxxx`)

---

## ⚙️ Step 4: Add Environment Variables

Create or update your `.env.local` file in the project root:

```bash
# Stripe API Keys (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Stripe Price IDs
STRIPE_PREMIUM_PRICE_ID=price_YOUR_PREMIUM_PRICE_ID_HERE
STRIPE_LIFETIME_PRICE_ID=price_YOUR_LIFETIME_PRICE_ID_HERE

# Stripe Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Example with real test values:**
```bash
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCDEFGHIJKLMNOP
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
STRIPE_PREMIUM_PRICE_ID=price_1AbCdEfGhIjKlMnO
STRIPE_LIFETIME_PRICE_ID=price_1PqRsTuVwXyZaBcD
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🚀 Step 5: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

---

## 🧪 Step 6: Test the Payment Flow

### Test Credit Cards (Stripe Test Mode)

Use these test card numbers:

| Card Type | Number | CVC | Expiry |
|-----------|--------|-----|--------|
| **Success** | `4242 4242 4242 4242` | Any 3 digits | Any future date |
| **Requires Auth** | `4000 0027 6000 3184` | Any 3 digits | Any future date |
| **Decline** | `4000 0000 0000 0002` | Any 3 digits | Any future date |

### Test the Flow:

1. **Go to Premium Page**
   ```
   http://localhost:3000/premium
   ```

2. **Click on a Plan**
   - Click "GET YEARLY" or "GET LIFETIME"
   - You'll be redirected to Stripe Checkout

3. **Fill in Test Payment Details**
   - Email: `test@example.com`
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`
   - Name: `Test User`
   - Click **Pay**

4. **Verify Success**
   - You'll be redirected back to `/profile?success=true`
   - Check the database - user's plan should be updated to `PREMIUM` or `LIFETIME`

---

## 🔍 Step 7: Test Webhooks Locally (Optional)

To test webhooks on localhost, use Stripe CLI:

### Install Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### Login to Stripe:
```bash
stripe login
```

### Forward Webhooks to Localhost:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### Trigger Test Events:
```bash
# Test successful payment
stripe trigger checkout.session.completed

# Test subscription update
stripe trigger customer.subscription.updated
```

---

## 📊 Step 8: Monitor in Stripe Dashboard

1. **View Payments**
   - Go to **Payments** → **All payments**
   - You'll see test transactions

2. **View Customers**
   - Go to **Customers**
   - See test customer profiles

3. **View Webhooks**
   - Go to **Developers** → **Webhooks**
   - Click on your webhook
   - See delivery attempts and responses

---

## ✅ Verification Checklist

- [ ] Stripe account created and in Test Mode
- [ ] Premium and Lifetime products created with prices
- [ ] All API keys and Price IDs copied
- [ ] Webhook endpoint configured
- [ ] `.env.local` file updated with all keys
- [ ] Development server restarted
- [ ] Test purchase completed successfully
- [ ] User plan updated in database
- [ ] Webhook events received

---

## 🐛 Troubleshooting

### "Price ID not configured"
- Make sure `STRIPE_PREMIUM_PRICE_ID` and `STRIPE_LIFETIME_PRICE_ID` are set in `.env.local`
- Restart your dev server

### "Invalid signature" on webhook
- Make sure `STRIPE_WEBHOOK_SECRET` is correct
- For localhost, use Stripe CLI to forward webhooks

### Payment succeeds but plan doesn't update
- Check webhook events in Stripe Dashboard
- Look at server console for webhook errors
- Make sure webhook includes correct metadata

### Can't find test transactions
- Make sure you're in **Test Mode** in Stripe Dashboard
- Test data is separate from live data

---

## 🎉 You're All Set!

Your Stripe test integration is complete. Users can now:
- ✅ Purchase Premium and Lifetime plans
- ✅ Pay with test cards
- ✅ Get automatically upgraded
- ✅ Access premium features

## 🚢 Going Live

When ready for production:
1. Switch Stripe to **Live Mode**
2. Get live API keys and webhook secret
3. Update production environment variables
4. Update webhook URL to production domain
5. Test with real payment methods in small amounts first

---

## 📚 Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
