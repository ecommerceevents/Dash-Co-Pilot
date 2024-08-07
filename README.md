# SaasRock Enterprise 🚀 Edition

## Getting Started

### 1. Installation

💿 1.1. Install all the dependencies:

```
npm install
```

If you get any issues, try with `yarn`.

💿 1.2. Rename the `.env.example` file to &rarr; `.env`.

💿 1.3. Seed the database:

```
npx prisma migrate dev --name init
```

You should get the following output:

```
🌱  The seed command has been executed.
```

If you get any issues, try updating the database and seeding manually:

```
npx prisma db push
npx prisma db seed
```

By default, the codebase seeds the following data _(using the `prisma/seed.ts` file)_:

- **1 admin user**: Email is `admin@email.com` and password is `password`.
- **2 account users**: _john.doe@company.com_ and _luna.davis@company.com_.
- **2 accounts**: _Acme Corp 1_ and _Acme Corp 2_.
- **1 linked account** between these accounts.
- **2 blog posts**.
- **2 custom entities**: _Employee_ and _Contract_.

<InfoBanner title="NOTE">
  If you're using <b>sqlite</b>, you can restart your
  database by deleting the generated{" "}
  <b class="italic">prisma/dev.db</b> file + the{" "}
  <b class="italic">prisma/migrations</b> folder, and run
  the command again.
</InfoBanner>

💿 1.4. Start the application:

```
npm run dev
```

Open [localhost:3000](http://localhost:3000), you'll see the landing page:

![Landing Page Hero](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/1.3.png)

💿 1.5. **Switch to Dark Mode** and Select the **Spanish language** from the Navbar items:

![Dark mode and Spanish Hero](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/1.4.png)

### 2. Set up Subscription Plans

💿 2.1. Set up the `STRIPE_SK` and `STRIPE_WEBHOOK_SIGNING_SECRET`.

- `STRIPE_SK`: env variable and restart the app. [Click here to view your Stripe secret key](https://dashboard.stripe.com/test/apikeys)
- `STRIPE_WEBHOOK_SIGNING_SECRET`: `stripe listen --forward-to localhost:3000/api/stripe/webhooks` will generate a webhook signing secret, copy it to your `.env` file.

💿 2.2. Log in as your admin user _(`admin@email.com` and `password`)_.

You will see the **Admin Dashboard**:

![Admin Dashboard](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/2.2.png)

💿 2.3. Click on **"Pricing → Set up"**, or click the sidebar item **"Set up → Pricing Plans"**.

![Pricing Plans](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/2.3.png)

<InfoBanner title="NOTE">
  You can change the default pricing plans on the{" "}
  <b class="italic">plans.server.ts</b> file
</InfoBanner>

💿 2.4. Click on **"Click here to create them"**.

Navigate to your [Stripe Dashboard](https://dashboard.stripe.com/test/products) to see the created Products:

![Stripe Products](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/2.4.png)

💿 2.5. Visit your Pricing page at [/pricing](http://localhost:3000/pricing).

You will see the recently created pricing plans:

![Pricing](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/2.5.png)

### 3. Set up Transactional Email Templates (OPTIONAL)

<InfoBanner title="NOTE">
  You can skip this step, but you will not get emails. To
  skip this step, make sure you don't set the env variable
  values of <b class="italic">POSTMARK_SERVER_TOKEN</b> and
  <b class="italic">POSTMARK_FROM_EMAIL</b>.
</InfoBanner>

💿 3.1. Create a [Postmark](https://postmarkapp.com/) account if you haven't already, they have the best development experience for transactional emails _(you can use the code **REMIXSAASPOSTMARK** for -20%)_.

💿 3.2. Create an [email server](https://account.postmarkapp.com/servers/new).

![New Postmark Server](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/3.2.png)

💿 3.3. Click on **"API Tokens"**, copy the Server API token, and set it to the `POSTMARK_SERVER_TOKEN` env variable.

💿 3.4. [Add a Domain or Sender signature](https://account.postmarkapp.com/signatures/add) and set it to the `POSTMARK_FROM_EMAIL` env variable.

<InfoBanner title="NOTE">
  In order to use a valid email, you will be asked to verify
  the domain ownership with <i>TXT</i> and <i>CNAME</i>{" "}
  records.
</InfoBanner>

![Domain Verification](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/3.4.png)

![Domain Verified](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/3.4-verified.png)

💿 3.5. Restart the app, log in as your admin user, and click on **"Set up → Email Templates"**.

You can override the default templates at the `/public/emails` folder.

![Email Templates](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/3.5.png)

💿 3.6. Click on **"Create all"**.

Navigate to your Postmark Templates to confirm they were created:

![Postmark Email Templates](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/3.6.png)

### 4. Creating an Account

💿 4.1. Go to the [/register](http://localhost:3000/register) page, and create an account with a valid email.

If you didn't skip the previous, you should get a **Welcome email**:

![Welcome email](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/4.1-email.png)

💿 4.2. Click on **"Login"**.

You will be redirected to the App portal Dashboard at _**/app/:your-account-name/dashboard**_:

![App Portal Dashboard](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/4.2.png)

Note there are 3 main sections:

- **Sidebar**
  - **_Sidebar Menu_**: The sidebar items are loaded on the `app/application/sidebar/AppSidebar.tsx` file.
  - **_Current account_**: Same behavior as the _Search bar_.
- **Top**
  - **_Search bar_**: This button opens up the Command palette _(switch accounts, logout...)_. You can customize the commands on the `app/components/ui/commandPalettes/AppCommandPalette.tsx` component.
  - **_Top Left Buttons_**: Subscription, Linked accounts, and Profile buttons.
- **Content**
  - **_Dashboard_**: By default, it loads a summary of the application **Custom Entities**: _Contracts_ and _Employees_. You can customize the dashboard on the `app/routes/app.$account/dashboard.tsx` route component.

### 5. Use the App Portal

💿 5.1. Go to **"Settings &rarr; Profile"**, and change your name and avatar.

![Profile Settings](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.1.png)

💿 5.2. Go to **"Settings &rarr; Members"**, and invite yourself with another valid email.

![New Member](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.2.png)

If you didn't step 3, you should get an **Invitation email**:

![Invitation email](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.2-email.png)

And if you click on the **"Set up account"** button, it will redirect you to set a password _(if you do this, log out and log in as the admin user for this account)_:

![Set up account](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.2-setup.png)

💿 5.3. Go to **"Settings &rarr; Subscription"**, and subscribe to the _**"Free"**_ plan, it will redirect you to a [Stripe Checkout](https://stripe.com/docs/payments/checkout) page, use any [testing card](https://stripe.com/docs/testing#cards).

![My Subscription](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.3.png)

💿 5.4. Try to add another user, it should not let you since the _**"Free plan"**_ includes 2 users only.

![Upgrade Subscription](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.4.png)

💿 5.5. Go back to **"Settings &rarr; Subscription"**, upgrade your plan, and try to add another user. This time you should not get any warnings.

💿 5.5. Go to **"Settings &rarr; Account"**, and change the account/tenant name, slug and icon.

<InfoBanner title="NOTE">
  I changed the account slug to{" "}
  <b class="italic">acme-corp-3</b>, notice how it
  redirected me to{" "}
  <b class="italic">/app/acme-corp-3/settings/account</b>.
</InfoBanner>

![Upgrade Account](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.5.png)

💿 5.6. Go to **"Settings &rarr; Audit Trails"**.

You should see at least 3 events:

1. We subscribed to the _**Free**_ plan.
2. We upgraded our plan.
3. We updated the account details.

![Audit Trails](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/5.6.png)

### 6. Using the Autogenerated Views and Forms

By default, the codebase seeds the Entity model with: Employee and Contract.

- **Employee** - Has 4 dynamic properties: _**First name, Last name, Email, and Salary**_.
- **Contract** - Has 4 hard-coded properties _(DB model columns)_: _**Name, Description, Status, and File**_.

These 2 entities will help you understand the [Entity Builder](/docs/features/entity-builder) feature.

💿 6.1. Go to **"Employees"**.

This is an autogenerated table view for the Entity _**"Employee"**_, we plan to add more views: _Kanban, Grid, and more_.

![Employees](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/6.1.png)

💿 6.2. We don't have any employees, so click on _**New**_.

![New employee](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/6.2.png)

💿 6.3. Edit the employee.

You should now have 2 audit trails: _**Created**_ and _**Updated**_.

<InfoBanner title="NOTE">
  You can also see these events at{" "}
  <b class="italic">/app/:account/settings/audit-trails</b>.
</InfoBanner>

![Edit employee](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/6.4.png)

### 7. Adding a Custom Property

Let's say we want our SaaS users to add employee's documents, we need a property of type _**"MEDIA"**_.

💿 7.1. Log out, log in as your admin user, go to **"Entities"**, and click on the **Employee** properties cell.

![Employee Properties](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/7.1.png)

💿 7.2. Click on _**"Add new field"**_ and set the following values.

Define these values:

- **Type**: _Media_.
- **Title**: _Documents_.
- **Name**: _documents_.

![Added Documents Property](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/7.2-added.png)

💿 7.3. Click on the _**"Switch to app"**_ sidebar item, or log out and log in as your account user.

💿 7.4. Go to **"Employees"**, and click on _**"New"**_.

💿 7.4. Edit any employee, and add 1 PDF and 1 image to the new property field _(Documents)_.

<WarningBanner title="WARNING">
  Currently, there are 2 supported file type preview: PDF's
  and images (click on the eye icon to preview a file).
</WarningBanner>

![Edited Documents Field](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/7.4-added.png)

### 8. Adding Employees to Google Sheets using Webhooks

💿 8.1. As an admin user, go to [/admin/entities/employees/webhooks](/admin/entities/employees/webhooks).

As you can see, there are 3 supported events for Webhooks: _**Created**_, _**Updated**_, and _**Deleted**_. But you can add your own, just use the `createRowLog` function with a custom action.

![Employee Entity Webhooks](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/8.1.png)

💿 8.2. In a new tab, create a new [Webhooks by Zapier zap](https://zapier.com/app/editor/157140476/nodes/157140476/setup), with the _Trigger Event_: _**Catch Hook**_.

![Webhooks by Zapier](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/8.2.png)

💿 8.3. Copy the _**Custom Webhook URL**_.

💿 8.4. Go back to the Employee's Webhooks and click on _**Edit**_ for the _**Created**_ event.

💿 8.5. Paste the Zapier _**Custom Webhook URL**_ hook on the _**Endpoint**_ field, and save.

![Webhook Endpoint](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/8.5.png)

💿 8.6. Create another Employee at the /app portal.

This should call the webhook endpoint.

<InfoBanner title="NOTE">
  Customize the webhook calls on the{" "}
  <b class="italic">callEntityWebhooks</b> function.
</InfoBanner>

💿 8.7. Go back to the Zapier's zap creator, and test the trigger.

As you can see, the webhook call was received successfully.

![Test Trigger](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/8.7.png)

💿 8.8. Create a Google Sheet document on [Google Drive](https://drive.google.com), name it _**"Employees"**_, and add the headers: _**First name, Last name, Email, Salary, and Documents**_.

![Google Sheet](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/8.8.png)

💿 8.9. Select the _**"Create Spreadsheet Row"**_ _Google Sheets_ Action.

<InfoBanner title="NOTE">
  You can hook with any application you want: Notion,
  Airtable, Dropbox...
</InfoBanner>

💿 8.10. Select your sheet, and link the corresponding properties, and turn on your Zap.

![Google Sheet Fields](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/8.10.png)

💿 8.11. Finally, add another employee and verify that the webhook is called.

![Added Employee to Google Sheet](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/8.11.png)

### 9. Using the autogenerated API

💿 9.1. As an account user, generate a new API Key at _**/app/:account/settings/api/keys/new**_.

![Generate a new API Key](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/9.1.png)

💿 9.2. Click on _**Copy to clipboard**_, and save it somewhere (you'll use it on step 9.4).

![Copy to clipboard](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/9.2.png)

💿 9.3. Install [Thunder Client for VS Code](https://www.thunderclient.com/).

💿 9.4. Create a new request with the following values:

- **Method**: GET.
- **URL**: http://localhost:3000/api/employees
- **Headers**: add the "_X-API-Key_" header with your API Key _(generated in step 9.2)_.

💿 9.5. Call the API by clicking _**"Send"**_.

![Send GET API request](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/9.5.png)

💿 9.6. Test the **POST**, **GET** (/:id), **PUT**, and **DELETE** methods as you might expect them to work (or [follow this guide](/docs/learning-center/guides/entities/use-the-custom-entity-api)).

### 10. Customizing the Views and Forms

The **Contract** model is the best of both worlds, Custom Entity and Custom Views and Forms.

If you want to create another database model from scratch, [follow this guide](/docs/learning-center/guides/entities/extend-existing-models).

💿 10.1. Go to **"Settings &rarr; Linked Accounts &rarr; New"**, and create a link:

- **Email**: john.doe@company.com
- **Account**: Acme Corp 1

![New linked account](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/10.1.png)

You could also create another account with a valid email to get the following email:

![Link invitation email](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/10.1-email.png)

💿 10.2. Log in as that account, and accept the invitation.

![Accept link invitation](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/10.2.png)

💿 10.3. Create a contract:

- **Linked Account**: Created linked account
- **Name**: Contract 1
- **Description**: Lorem ipsum...
- **File**: _Any PDF file_
- **Signatories**: Select 2 signatories _(required)_
- **Employees**: Select at least 1 employee _(optional)_

![Create a Contract](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/10.3.png)

Once created, you should get an email:

![Contract Email](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/10.3-email.png)

💿 10.4. Finally, go to your dashboard.

You should have at least 2 stats: Total **Employees** and Total **Contracts**.

![Dashboard](https://yahooder.sirv.com/saasrock/tutorials/quick-start-v-0-2-6/10.4.png)

## Deployment

- [Deploy to Fly.io](https://saasrock.com/docs/articles/deploy-to-fly-io)
- - [Deploy to Vercel](https://saasrock.com/docs/articles/deploy-remix-to-vercel)
- [Deploy to AWS Lightsail with Docker](https://saasrock.com/docs/articles/deploy-remix-to-aws-lightsail-containers-with-docker)
