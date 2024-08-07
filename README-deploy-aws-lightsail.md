# Deploy Remix to AWS Lightsail with Docker

Read the full tutorial [here](https://saasrock.com/docs/articles/deploy-remix-to-aws-lightsail-containers-with-docker).

![Deploy Remix to AWS Lightsail with Docker](https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1717035728671-deploy-remix-to-aws-lightsail-containers-with-docker.png)

**Requirements**:

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Create an [AWS account](https://portal.aws.amazon.com/billing/signup#/start/email)
- Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Install the [Lightsail container services plugin](https://docs.aws.amazon.com/en_us/lightsail/latest/userguide/amazon-lightsail-install-software.html)

**Find and replace**:

- `saasrock-dev-service` with your AWS Lightsail service name
- `saasrock-dev` with your image name
- `us-east-1` with your preferred region

## Deployment Steps:

💿 1. Build the image

```sh
docker build -t saasrock-dev .
```

💿 2. Run the image locally

```sh
docker run -p 8080:8080 --env-file .env saasrock-dev:latest
```

💿 3. Create a Lightsail container service

```sh
aws lightsail create-container-service --region us-east-1 --service-name saasrock-dev-service --power nano --scale 1
```

This is creating a Nano instance ($7/month) with 1 instance:

![AWS Lightsail instance sizes](https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1717020368634-aws-lightsail-create-container-service.png)

You can check the status of the service with:

```sh
aws lightsail get-container-services --region us-east-1 --service-name saasrock-dev-service --query "containerServices[].state"
```

💿 4. Push the image to the AWS Lightsail container service

```sh
aws lightsail push-container-image --region us-east-1 --service-name saasrock-dev-service --label latest --image saasrock-dev:latest
```

💿 5. Create an AWS configuration file `aws-lightsail-containers.json`

```json
{
  "serviceName": "saasrock-dev-service",
  "containers": {
    "saasrock-dev-service": {
      "image": "saasrock-dev:latest",
      "environment": {
        "APP_NAME": "SaasRock Dev AWS Lightsail"
        // ...
      },
      "ports": {
        "8080": "HTTP"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "saasrock-dev-service",
    "containerPort": 8080
  }
}
```

⚠️ IMPORTANT: Add this file to your `.gitignore` to avoid sharing sensitive information.

💿 6. Deploy the image to the AWS Lightsail container service

```sh
aws lightsail create-container-service-deployment --region us-east-1 --cli-input-json file://aws-lightsail-containers.json
```

And that's it! You can access your app at the public endpoint provided by AWS Lightsail.

![AWS Lightsail Deployment](https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1717029967827-aws-lightsail-saasrock.png)

And if you check your [Amazon Lightsail dashboard](https://lightsail.aws.amazon.com/ls/webapp/home/containers), you should see your container service:

![AWS Lightsail Container Service](https://qwcsbptoezmuwgyijrxp.supabase.co/storage/v1/object/public/novel/1717035901570-aws-lightsail-continer-service.png)

## Deploying Updates:

💿 1. Build the image as in step 1

```sh
docker build -t saasrock-dev .
```

💿 2. Push the image as in step 4

```sh
aws lightsail push-container-image --region us-east-1 --service-name saasrock-dev-service --label latest --image saasrock-dev:latest
```

💿 3. Grab the new image tag

```sh
Digest: sha256:5723533c861348b69369fb79d85c6b203713c33b49f0b1b813d9d9bf71454732
Image "saasrock-dev:latest" registered.
Refer to this image as ":saasrock-dev-service.latest.4" in deployments.
```

In this case, the image tag is `saasrock-dev-service.latest.4`.

💿 4. Change the image tag in the `aws-lightsail-containers.json` file

```json
{
  ...
  "containers": {
    "saasrock-dev-service": {
      "image": "UPDATE_IMAGE_TAG_HERE",
      ...
}
```

💿 5. Deploy the image as in step 6

```sh
aws lightsail create-container-service-deployment --region us-east-1 --cli-input-json file://aws-lightsail-containers.json
```

Wait for the deployment to finish, you can check the status with:

```sh
aws lightsail get-container-services --region us-east-1 --service-name saasrock-dev-service --query "containerServices[].state"
```

And that's it! Your app is now updated.

ℹ️ NOTE: If you forgot the URL of your app, you can get it with:

```sh
aws lightsail get-container-services --region us-east-1 --service-name saasrock-dev-service --query "containerServices[].url"
```
