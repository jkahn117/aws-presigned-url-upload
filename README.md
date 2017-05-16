# aws-presigned-url-upload

This project is an example of how to leverage Amazon S3 Presigned URLs to securely upload objects from a web client to an S3 Bucket.  This approach is useful when you want to allow your end users to upload a file, but do not want to require them to have AWS credentials or permissions.

You may also note that it is possible to upload a file (`PutObject`) to an S3 Bucket using the AWS SDK (for [example](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#putObject-property)).  Not only does this approach require AWS Credentials, but also inclusion of the AWS SDK in your client project, which is unnecessary to only upload a file.

## Getting Started

To get started, clone this repository locally:

```
$ git clone https://github.com/jkahn117/aws-presigned-url-upload
```

The repository contains a [CloudFormation](https://aws.amazon.com/cloudformation/) template and source code to deploy and run a complete sample application.

### Prerequisites

To run the aws-presigned-url-upload sample, you will need to:

1. Select an AWS Region into which you will deploy services. Be sure that all required services (AWS Lambda and Amazon API Gateway) are available in the Region you select.
2. Confirm your [installation of the latest AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) (at least version 1.11.21).
3. Confirm the [AWS CLI is properly configured](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-quick-configuration) with credentials that have administrator access to your AWS account.
4. [Install Node.js and NPM](https://docs.npmjs.com/getting-started/installing-node).

## Setting Up the Environment

Before deploying the sample, install several dependencies using NPM:

```
$ cd server
$ npm install
```

## Deploy AWS Resources

The deployment of our AWS resources is managed by the [Serverless Application Model](https://github.com/awslabs/serverless-application-model), which is an extension of CloudFormation.

1. Rename `server/app-sam.sample.yaml` to `server/app-sam.yaml` and replace the value `<BUCKET_NAME>` with a name of your choosing.  This will be the S3 Bucket into which files are uploaded (remember S3 Bucket names are globally unique).

2. Rename `server/swagger.sample.yaml` to `server/swagger.yaml` and replace the value `<REGION>` with the AWS Region selected (e.g. us-east-1) and the value `<ACCOUNT_NUMBER>` with your [AWS account number](https://docs.aws.amazon.com/general/latest/gr/acct-identifiers.html).

3. If you would like your uploaded file to leverage server-side encryption, you can uncomment line 29 in the file `server/api/index.js`.

4. Create a new S3 bucket from which to deploy our source code (ensure that the bucket is created in the same AWS Region as your network and services will be deployed):

    ```
    $ aws s3 mb s3://<MY_BUCKET_NAME>
    ```
5. Using the SAM, package your source code and serverless stack:

    ```
    $ aws cloudformation package --template-file app-sam.yaml --s3-bucket <MY_BUCKET_NAME> --output-template-file app-sam-output.yaml
    ```
6. Once packaging is complete, deploy the stack (note: this step may require 10-15 minutes as ElastiCache is deployed):

    ```
    $ aws cloudformation deploy --template-file app-sam-output.yaml --stack-name aws-presigned-url-upload --capabilities CAPABILITY_IAM
    ```
7. After your stack has been created, the sample API has been deployed and you can retrieve the domain of the API (going forward, we will refer to it as API_DOMAIN):

    ```
    $ aws cloudformation describe-stacks --stack-name public-bikes-dev --query 'Stacks[0].Outputs[?OutputKey==`ApiDomain`].OutputValue'
    ```

## Configure Web Client

With our backend ready, we will make a quick change to the frontend to reference our newly deployed API:

1. Rename `app/js/config.sample.js` to `app/js/config.js` and open the file.  Replace `<API_DOMAIN>` with the value found above and `<REGION>` with your deployment region (e.g. us-east-1).

2. Save the file.

## Test

Open the sample frontend by double-clicking on `app/index.html`.  This page provides an overview of this sample as well as simple implementation.

Click the 'Choose File' button and pick an image file from your desktop.  Then click 'Upload'.

On the right, the Console section will log information as the sample runs.  The general flow is as follows:

1. Grab file metadata, specifically name and type.
2. `GET` pre-signed URL from API, passing the file name and type as query string parameters.
3. Use `PUT` request to put the object in the S3 Bucket.
4. Confirm the file has been uploaded by visiting the S3 Console.

## Cleaning Up

Finally, we will clean up the AWS environment using CloudFormation:

```
$ aws cloudformation delete-stack --stack-name aws-presigned-url-upload
```

## Additional Notes

Now that you have seen our sample live, a few notes on the implementation:

* At least for the purposes of this demo, [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS) is required for both the backend API and S3 Bucket.  The CORS configuration / headers are setup for you in the demo, but this can often be a source of trouble (unless all resources are hosted on a single domain).

* Our Lambda function to create the pre-signed URL must have a role with permission to put an object (`PutObject`) in our upload bucket.  Again, this is configured for you (see `app-sam.yaml`, specifically `SignedUrlFunctionPolicy`), but without this permission, the end user will not be able to upload to the bucket.

* Our sample makes use of jQuery to interact with the API and S3.  While numerous other options exist for these interactions, we found using jQuery's `$.ajax` method most effective to put the image object in the S3 Bucket.  Other approaches utilized `multipart/form-data` which tended to cause problems.

