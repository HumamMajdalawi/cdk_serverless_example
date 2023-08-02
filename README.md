# AWS CDK Serverless Example

This is a simple example with AWS CDK for infastructure as a code services. written in typescript. 

## Services
 * `API Gateway`
 * `Lambda Function`
 * `DynamoDB`
 * `DynamoDB Stream`
 * `Route53`


The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Requirments
* ` Node js ` 
* ` Docker ` mock DynamoDb for tests
* ` ~/.aws/credentials ` aws profile configurtions 


## How to run 

* ` npm run deploy:development ` Deploy to development enviroment
* ` npm run deploy:production ` Deploy to production enviroment 
* ` npm run local:db ` Run local docker dynamodb instance
* ` npm run test ` Run tests