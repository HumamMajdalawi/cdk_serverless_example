import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { EndpointType } from "aws-cdk-lib/aws-apigateway";
import { config } from "./config";
import { getEnvironment } from "../app/config";

export const  getResourceName = (postfix: string): string => {
    return `${config.serviceName}-V${config.subStackVersion}-${postfix}`;
  }

export const getRestProps = (stack: cdk.Stack , resourceName: string) => {
    return {
      description: `Microservice API for ${config.serviceName} V${config.subStackVersion}`,
      restApiName: resourceName,
      deployOptions: {
        stageName:  getEnvironment(),
        cacheTtl: cdk.Duration.seconds(0),
        cachingEnabled: false,
      },
      domainName: {
        domainName: `${config.api?.domain}`,
        endpointType: EndpointType.REGIONAL,
        certificate: acm.Certificate.fromCertificateArn(
          stack,
          "Certificate",
          config.api.certArn
        ),
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
        ],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
      },
    };
  }