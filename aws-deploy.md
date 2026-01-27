# AWS Deployment Guide for Loopio MCP Server

This guide explains how to deploy the Loopio MCP Server to AWS using ECS Fargate (serverless containers).

## Prerequisites

- AWS CLI installed and configured
- Docker installed locally
- AWS Account with appropriate permissions

## Deployment Options

### Option 1: AWS ECS Fargate (Recommended)

#### Step 1: Build and Push Docker Image to ECR

```bash
# Set your AWS region and account ID
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY=loopio-mcp-server

# Create ECR repository
aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and tag image
docker build -t loopio-mcp-server .
docker tag loopio-mcp-server:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
```

#### Step 2: Create ECS Task Definition

Save this as `task-definition.json`:

```json
{
  "family": "loopio-mcp-server",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "loopio-mcp-server",
      "image": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/loopio-mcp-server:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "MCP_TRANSPORT",
          "value": "sse"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "LOOPIO_CLIENT_ID",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:loopio/client-id"
        },
        {
          "name": "LOOPIO_CLIENT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:loopio/client-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/loopio-mcp-server",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Step 3: Store Secrets in AWS Secrets Manager

```bash
# Store Loopio credentials
aws secretsmanager create-secret \
  --name loopio/client-id \
  --secret-string "YOUR_CLIENT_ID" \
  --region $AWS_REGION

aws secretsmanager create-secret \
  --name loopio/client-secret \
  --secret-string "YOUR_CLIENT_SECRET" \
  --region $AWS_REGION
```

#### Step 4: Create CloudWatch Log Group

```bash
aws logs create-log-group --log-group-name /ecs/loopio-mcp-server --region $AWS_REGION
```

#### Step 5: Register Task Definition

```bash
# Update task-definition.json with your account ID and region, then:
aws ecs register-task-definition --cli-input-json file://task-definition.json --region $AWS_REGION
```

#### Step 6: Create ECS Cluster (if you don't have one)

```bash
aws ecs create-cluster --cluster-name loopio-mcp-cluster --region $AWS_REGION
```

#### Step 7: Create ECS Service with Application Load Balancer

First, create an Application Load Balancer, Target Group, and Security Groups through the AWS Console or CLI, then:

```bash
aws ecs create-service \
  --cluster loopio-mcp-cluster \
  --service-name loopio-mcp-service \
  --task-definition loopio-mcp-server \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=loopio-mcp-server,containerPort=3000" \
  --region $AWS_REGION
```

### Option 2: AWS App Runner (Simpler, but more expensive)

```bash
# Create App Runner service directly from ECR
aws apprunner create-service \
  --service-name loopio-mcp-server \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/loopio-mcp-server:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "MCP_TRANSPORT": "sse"
        },
        "RuntimeEnvironmentSecrets": {
          "LOOPIO_CLIENT_ID": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:loopio/client-id",
          "LOOPIO_CLIENT_SECRET": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:loopio/client-secret"
        }
      }
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{
    "Cpu": "0.25 vCPU",
    "Memory": "0.5 GB"
  }' \
  --region $AWS_REGION
```

## Access Your MCP Server

Once deployed, your server will be accessible at:
- **ECS with ALB**: `https://your-alb-domain.region.elb.amazonaws.com/sse`
- **App Runner**: `https://xxxxx.region.awsapprunner.com/sse`

## Testing the Deployment

```bash
# Health check
curl https://your-server-url/health

# SSE endpoint (for MCP clients)
# Configure your MCP client with: https://your-server-url/sse
```

## Cost Optimization

- Use Fargate Spot for non-production environments (70% discount)
- Set up auto-scaling based on CPU/memory utilization
- Use CloudWatch alarms to monitor costs

## Security Considerations

Since you mentioned no authentication is required:
- Consider adding API Gateway with rate limiting
- Use AWS WAF to protect against abuse
- Monitor usage with CloudWatch metrics
- Set up budget alerts

## Environment Variables

Required:
- `LOOPIO_CLIENT_ID` - Your Loopio API client ID
- `LOOPIO_CLIENT_SECRET` - Your Loopio API client secret
- `MCP_TRANSPORT=sse` - Enable SSE mode
- `PORT=3000` - HTTP server port

Optional:
- `LOOPIO_API_BASE_URL` - Override default API base URL
