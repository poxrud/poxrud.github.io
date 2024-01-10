---
layout: post
category: posts
title: Connecting GitHub Actions with AWS S3 using CloudFormation
author: Phil Oxrud
comments: true
description: A CloudFormation tutorial for using GitHub Actions with AWS S3. Can be used for deploying static websites.
---

_GitHub Actions_ allows the user to create _workflows_ that can automate tasks that can be triggered on certain actions, such as pull requests to specific branches. Typically a workflow will run tests on a PR before presenting it for merge approval. Another use case, and one that will be discussed here, is using a GitHub Actions workflow to build the static assets for a React project and _syncing_ the resulting _build artifacts_ to an S3 bucket.

For the purpose of this tutorial we will make the following assumptions:

- You have created a **prod** branch, and would like pushes/merges to this branch to trigger the workflow.
- The resulting production build assets should be sync'd to the **s3://my-website** s3 bucket.
- Your GitHub repo is **myorg/my-repo**.
- The React project is called **my-react-project**.
- The React production build command is **npm run build**.

## Connecting GitHub with AWS

GitHub Actions needs permissions to run _aws cli_ commands. Previously this was done by creating a new AWS IAM User with the required permissions, generating **AWS_ACCESS_KEY_ID** and **AWS_SECRET_ACCESS_KEY** credentials and storing those in _GitHub Actions Secrets_. This type of authentication is no longer recommended as a best practice. This is because these credentials are what can be considered as _long lived credentials_. Long-lived credentials should be avoided since they are more difficult to keep track of, rotate, and overall present a higher security risk.

Instead, it is best practice to create IAM Roles for specific applications/services, and then let these applications/services _assume_ the Roles when required.

GitHub and AWS can authenticate with each other through the use of _OIDC Authentication_ protocol. To achieve this, we will use AWS to create an `IODCProvider`, whose job will be to authenticate with GitHub Actions and provide it with an IAM Role. GitHub Actions will then _Assume_ this Role when making aws cli calls on our behalf.

To clarify, we will need to create 2 resources on AWS's side:

- IODCProvider: to authenticate with GitHub and provide it with a Role
- IAM Role: a role that will give GitHub the permissions for our AWS resources. In this case, access to our S3 bucket.

IAM Roles have two parts: **Permissions** and **Trust Policies**. The permission policy assigns to the role permissions for AWS resources, while the Trust Policy simply indicated who can use (assume) this role.

The OIDCProvider, the GitHub access Role and its Trust and Permission policies can all be created using the CloudFormation template below:

```yml
AWSTemplateFormatVersion: "2010-09-09"

Parameters:
  WwwBucketName:
    Type: String

Resources:
  GitHubOIDCProvider:
    Type: "AWS::IAM::OIDCProvider"
    Properties:
      ClientIdList:
        - "sts.amazonaws.com"
      ThumbprintList:
        - "6938fd4d98bab03faadb97b34396831e3780aea1"
      Url: https://token.actions.githubusercontent.com

  GitHubActionsRole:
    Type: "AWS::IAM::Role"
    Properties:
      RoleName: "GitHubActionsRole"
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Federated: !Sub "arn:aws:iam::${AWS::AccountId}:oidc-provider/token.actions.githubusercontent.com"
            Action: "sts:AssumeRoleWithWebIdentity"
            Condition:
              StringEquals:
                {
                  "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
                  "token.actions.githubusercontent.com:sub": "repo:myorg/my-repo:ref:refs/heads/prod"
                }
  SyncToS3BucketPermission:
    Type: "AWS::IAM::Policy"
    Properties:
      PolicyName: SyncToS3BucketPolicy
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Action:
              - "s3:PutObject"
              - "s3:DeleteObject"
              - "s3:ListBucket"
            Resource:
              - !Sub "arn:aws:s3:::${WwwBucketName}"
              - !Sub "arn:aws:s3:::${WwwBucketName}/*"
      Roles:
        - !Ref GitHubActionsRole
```

This CF template will create an OIDCProvider, a GitHubActionsRole with the required s3 sync permissions, and a trust policy to only allow GitHub to assume this role.

Please note that the condition:

```yml
StringEquals: { ? ...
      "token.actions.githubusercontent.com:sub"
    : "repo:myorg/my-repo:ref:refs/heads/prod" }
```

is required to make sure that only pushes to our repo and the **prod** branch get authorized.

## Creating a GitHub Actions Workflow

Once we can establish authenticated GitHub => AWS connections, we are ready to write our GitHub Actions Workflow.

Workflows are made by creating a `.github/workflow` directory and placing in it workflow yaml files. It is possible to have many simultaneous workflows running in parallel.

For this tutorial we will create a workflow file called `frontend-deploy.yml` and place it in `.github/workflow`

```yml
# Build and Deploy the frontend assets to AWS S3

name: Deploy frontend

on:
  push:
    branches: [prod]

env:
  AWS_REGION: "us-east-1"
  BUCKET: "my-website"
  MY_AWS_ACCOUNT: "111111111111"

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-22.04

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18.x"

      - name: Install npm packages
        run: |
          cd my-react-project
          npm i

      - name: Build prod
        run: |
          cd my-react-project
          npm run build

      - name: configure aws credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: "arn:aws:iam::$MY_AWS_ACCOUNT:role/GitHubActionsRole"
          role-session-name: GitHub_OIDC
          aws-region: ${{env.AWS_REGION}}

      - name: sync frontend website
        run: |
          aws s3 sync my-react-project/build/ s3://${{env.BUCKET}}/
```

This workflow has a single job called _deploy_ with many steps required to build the react project, setup the aws credentials, and sync the project with the S3 bucket.

The section:

```yml
on:
  push:
    branches: [prod]
```

is required to make sure that this workflow only triggers on pushes to the `prod` branch.

Finally, the part below is how GitHub sends auth data to AWS:

```yml
permissions:
  id-token: write
  contents: read
```
