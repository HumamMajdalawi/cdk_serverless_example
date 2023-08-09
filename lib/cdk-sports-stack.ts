import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as events from "aws-cdk-lib/aws-lambda-event-sources";
import { ApiTrigger, routes } from "./routes";
import { config } from "./config";
import {
  LambdaIntegration,
  Resource,
  RestApi,
  RestApiProps,
} from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { getResourceName, getRestProps } from "./functions";

export class CdkSportsStack extends cdk.Stack {
  protected apiGatewayResources = new Set<Resource>();
  private api: RestApi;
  private ingestTable: ITable;
  private streamTable: ITable;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.createDynamoDBTables();
    this.api = this.configureApiGateway();
    if (this.api)
      routes(this).forEach((route) => this.configureApiRoute(route));
  }

  createTable(pk: string, sk: string): dynamodb.Table {
    return new dynamodb.Table(this, config.db.mainTable, {
      partitionKey: {
        name: pk,
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: sk,
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      tableName: config.db.mainTable,
    });
  }

  createEventStream() {
    const streamHandler = new lambda.Function(this, "StreamHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: "handleSportsDBStream",
      code: lambda.Code.fromInline("./app/handlers/streamHandler"),
    });
    const streamEventSource = new events.DynamoEventSource(this.ingestTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON,
      batchSize: 1,
      bisectBatchOnError: true,
      retryAttempts: 10,
    });
    streamHandler.addEventSource(streamEventSource);

    return streamHandler;
  }

  createDynamoDBTables() {
    this.ingestTable = this.createTable("match_id", "timestamp");
    const streamHandler = this.createEventStream();
    this.streamTable = this.createTable("match_id", "random_id");
    this.ingestTable.grantReadData(streamHandler);
    this.streamTable.grantFullAccess(streamHandler);
  }

  createLambdaFunction(trigger: ApiTrigger): Function {
    const lastIndexOfSlash = trigger.handler.lastIndexOf("/");

    const postfix = `${trigger.id}-${trigger.api.method}-Lambda`;
    const lambdaName = getResourceName(postfix);

    return new Function(this, lambdaName, {
      functionName: lambdaName,
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset(
        "cdk/build/" + trigger.handler.substr(0, lastIndexOfSlash)
      ),
      handler: trigger.handler.substr(lastIndexOfSlash + 1),
      timeout: cdk.Duration.minutes(1),
      memorySize: 1024,
      environment: {
        dynamoTable: config.db.mainTable,
        ...trigger.environment,
      },
    });
  }

  configureRouteZone(api: cdk.aws_apigateway.RestApi) {
    const zone = cdk.aws_route53.HostedZone.fromLookup(this, "DNS-Zone", {
      domainName: config.api.domain,
    });

    new cdk.aws_route53.ARecord(this, "DNS-Record", {
      zone: zone,
      recordName: config.api.subdomain,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.ApiGateway(api)
      ),
    });

    new cdk.CfnOutput(this, "apiUrl", {
      value: `https://${config.api.subdomain}.${config.api.domain}`,
      exportName: `${config.serviceName}-apigateway-v${config.subStackVersion}-url`,
    });
  }

  configureApiGateway(): RestApi {
    if (!routes(this).length) return {} as RestApi;

    const apiGatewayName = getResourceName("Api");
    let restApiProps: RestApiProps = getRestProps(this, apiGatewayName);
    const api = new RestApi(this, apiGatewayName, restApiProps);
    this.configureRouteZone(api);
    return api;
  }

  configureApiRoute(apiTrigger: ApiTrigger): void {
    const lambdaFunction = this.createLambdaFunction(apiTrigger);
    const resource = this.api.root.resourceForPath(apiTrigger.api.path);
    const integration = new LambdaIntegration(lambdaFunction, {
      ...apiTrigger.lambdaIntegration,
    });

    resource.addMethod(apiTrigger.api.method, integration);
    this.apiGatewayResources.add(resource);
    if (apiTrigger?.environment?.mainTable) {
      this.ingestTable && this.ingestTable.grantReadWriteData(lambdaFunction);
    }
    if (apiTrigger?.environment?.stramTable) {
      this.streamTable && this.streamTable.grantReadWriteData(lambdaFunction);
    }
  }
}
