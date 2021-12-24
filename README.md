# ssu-it-locker (Unofficial)

Just a toy project with AWS. It'll never be official. Not related with SSU IT Collage.

## To-Dos and Done
 - [X] Create monorepo containing backend(Lambda with SAM) and frontend(sveltekit)
 - [X] Create simple validation and obtaining id from SSU SSO
 - [X] Simple frontend with sso login PoC
 - [X] Deploy Mocked Lambda functions to AWS with SAM
 - [X] Local testing env w/ DynamoDB
 - [ ] Make Connection with DynamoDB and create session auth with it
 - [ ] Create S3 Bucket with SAM CloudFormation template
 - [ ] Deploy static svelte frontend to S3 Bucket
 - [ ] Create CloudFront with CloudFormation and connect route for it
 - [ ] Create Proxy with API Gateway with Lambda and S3 Bucket with frontend
 - [ ] Create beautiful frontend with svelte-material-ui
 - [ ] Make administration page

## Used Techs
* Many AWS Services, this service is deeply integrated with AWS.
    * SAM(Serverless Application Model)
    * Lambda
    * CloudFormation(IaaS, integrated with SAM)
    * DynamoDB
    * API Gateway
    * CloudFront
    * S3 Bucket
    * Route 53
* Used PNPM for Monorepo package manager - It's fast!
* Svelte(sveltekit) for Frontend - Lightweight and new.

# How to run
```bash
Prerequisites: aws-sam-cli, aws-cli, docker, node, pnpm
```

1. Run `pnpm i` in the root directory.
2. Run `pnpm dev` for testing.(No hot-reload for backend because of limitation of `sam local start-api`)
3. Run `pnpm build` for production-ready build. (file generated to `ssu-it-locker-lambda/.aws-sam/build` for backend, `ssu-it-locker-frontend/.svelte-kit/build` for frontend)
4. Run `pnpm deploy` for deploy project to aws(Disclaimer: Auto-deploy for frontend is not done yet. You have to setup S3 bucket, CloudFront and API Gateway manually)
5. Run `pnpm delete` for delete service stack from AWS.