# 🐛 Payment Not Working - Debug Checklist

## Step 1: Check if Stripe is configured

Visit: `http://localhost:3000/api/stripe/test-config`

You should see:
```json
{
  "stripeConfigured": true,
  "publishableKeyConfigured": true,
  "premiumPriceIdConfigured": true,
  "lifetimePriceIdConfigured": true,
  "webhookSecretConfigured": true,
  "appUrlConfigured": true,
  "stripeKeyPrefix": "sk_test...",
  "premiumPricePrefix": "price_...",
  "lifetimePricePrefix": "price_..."
}
```

If any are `false`, you're missing that environment variable!

---

## Step 2: Verify .env.local file exists

```bash
ls -la .env.local
```

If it doesn't exist, create it:
```bash
touch .env.local
```

---

## Step 3: Add Stripe variables to .env.local

Your `.env.local` file should have these lines:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_PREMIUM_PRICE_ID=price_YOUR_ID_HERE
STRIPE_LIFETIME_PRICE_ID=price_YOUR_ID_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Get Stripe Keys

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Make sure **Test mode** is ON (toggle top-right)
3. Copy:
   - **Secret key** (sk_test_...)
   - **Publishable key** (pk_test_...)

---

## Step 5: Create Stripe Products

1. Go to: https://dashboard.stripe.com/test/products
2. Click **+ Add product**

### Create Premium Product:
- Name: `Void Premium`
- Price: `39.99`
- Billing: `Recurring` → `Yearly`
- Click **Add product**
- **Copy the Price ID** (starts with `price_`)

### Create Lifetime Product:
- Name: `Void Lifetime`
- Price: `99.99`
- Billing: `One time`
- Click **Add product**
- **Copy the Price ID** (starts with `price_`)

---

## Step 6: Restart Server

**IMPORTANT**: Changes to .env.local require restart!

```bash
# Stop server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Step 7: Check Browser Console

1. Open: `http://localhost:3000/premium`
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Click any plan button
5. Look for errors

Common errors and fixes:

### ❌ "Price ID not configured"
- Add `STRIPE_PREMIUM_PRICE_ID` and `STRIPE_LIFETIME_PRICE_ID` to .env.local
- Restart server

### ❌ "Not authenticated"
- You need to be logged in
- Go to `/login` first

### ❌ "Stripe is not configured"
- Add `STRIPE_SECRET_KEY` to .env.local
- Restart server

### ❌ "No such price"
- Your price ID is wrong
- Double-check in Stripe dashboard: https://dashboard.stripe.com/test/products
- Make sure you're in **Test mode**

---

## Step 8: Check Server Logs

Look at your terminal where `npm run dev` is running.

You should see logs like:
```
Creating Stripe checkout session...
Profile ID: abc123
Plan type: PREMIUM
Price ID: price_xyz...
Creating checkout session with Stripe...
Checkout session created: cs_test_abc123
```

If you see errors, they'll appear here.

---

## Quick Test:

1. ✅ Visit: http://localhost:3000/api/stripe/test-config
2. ✅ All values should be `true`
3. ✅ Login at: http://localhost:3000/login
4. ✅ Go to: http://localhost:3000/premium
5. ✅ Click "GET YEARLY" button
6. ✅ Should redirect to Stripe checkout page

---

## Still not working?

### Check these:

1. **Are you in Test Mode in Stripe?**
   - Toggle should say "Test mode" in Stripe dashboard
   - Keys should start with `sk_test_` not `sk_live_`

2. **Did you restart the server after adding env vars?**
   ```bash
   npm run dev
   ```

3. **Is .env.local in the root directory?**
   ```bash
   ls -la .env.local
   # Should show: .env.local
   ```

4. **Check for typos in variable names**
   - Must be EXACTLY: `STRIPE_SECRET_KEY` (not stripe_secret_key)
   - Must be EXACTLY: `STRIPE_PREMIUM_PRICE_ID` (not STRIPE_PREMIUM_PRICE)

5. **Are the keys valid?**
   - Secret key: starts with `sk_test_`
   - Publishable key: starts with `pk_test_`
   - Price IDs: start with `price_`

---

## Test with Stripe CLI (Advanced)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Test API key
stripe customers list --limit 1

# If this works, your key is valid!
```

---

## Need Help?

Share these details:
1. Output from: http://localhost:3000/api/stripe/test-config
2. Browser console errors
3. Server terminal logs
4. First 7 characters of your keys (safe to share)
