# Deploy to Fly.io

1. Set the app `name` and `primary region` at fly.toml.

```
app = "YOUR_APP_NAME"
...
primary_region = "iad"
```

The primary region should match your database (e.g. Supabase) region.

2. Create the app using `fly` CLI:

```
fly apps create YOUR_APP_NAME
```

3. Set your secrets:

You can see the examples at `.env.fly.example`.

```
flyctl secrets set APP_NAME=YOUR_APP_NAME \
DATABASE_URL=postgres://{USER}:{PASSWORD}@{HOST}:{PORT}/{DATABASE} \
SESSION_SECRET=abc123 \
API_ACCESS_TOKEN=1234567890 \
JWT_SECRET=abc123 \
SUPABASE_API_URL= \
SUPABASE_KEY= \
SUPABASE_ANON_PUBLIC_KEY= \
STRIPE_SK= \
SUPPORT_EMAIL= \
POSTMARK_SERVER_TOKEN= \
POSTMARK_FROM_EMAIL= \
--app YOUR_APP_NAME
```

4. Deploy the app:

```
fly deploy --remote-only
```

5. Scale it at least to 2x CPU:

```
fly scale vm shared-cpu-2x --app YOUR_APP_NAME
```

6. (Optional) Set up a custom domain:

Run the following command to get the IPv4 and IPv6 addresses:

```
flyctl ips list -a YOUR_APP_NAME
```

Head over to your DNS provider and add A and AAAA records for example.com with the IPv4 and IPv6 values.

Now you can create a certificate for your custom domain:

```
flyctl certs create -a custom-quartz example.com
```

Your app should be available at your domain. It may take a few minutes for the certificate to be issued.
