#!/bin/bash

# Deploy Loopio MCP Server to AWS ECS Fargate
# Usage: ./deploy-to-aws.sh

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY=loopio-mcp-server
CLUSTER_NAME=loopio-mcp-cluster
SERVICE_NAME=loopio-mcp-service
TASK_FAMILY=loopio-mcp-server

echo "🚀 Deploying Loopio MCP Server to AWS"
echo "Region: $AWS_REGION"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Account ID: $AWS_ACCOUNT_ID"

# Step 1: Create ECR repository if it doesn't exist
echo ""
echo "📦 Step 1: Creating ECR repository..."
aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION 2>/dev/null || \
  aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Step 2: Login to ECR
echo ""
echo "🔐 Step 2: Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 3: Build Docker image
echo ""
echo "🏗️  Step 3: Building Docker image..."
docker build -t $ECR_REPOSITORY:latest .

# Step 4: Tag and push to ECR
echo ""
echo "⬆️  Step 4: Pushing to ECR..."
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Step 5: Update task definition with account ID
echo ""
echo "📝 Step 5: Updating task definition..."
cat task-definition.json | \
  sed "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" | \
  sed "s/us-east-1/$AWS_REGION/g" > task-definition-updated.json

# Step 6: Register task definition
echo ""
echo "📋 Step 6: Registering task definition..."
aws ecs register-task-definition --cli-input-json file://task-definition-updated.json --region $AWS_REGION

# Step 7: Create cluster if it doesn't exist
echo ""
echo "🏢 Step 7: Creating ECS cluster..."
aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION 2>/dev/null | grep -q "ACTIVE" || \
  aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $AWS_REGION

# Step 8: Update or create service
echo ""
echo "🔄 Step 8: Updating ECS service..."
EXISTING_SERVICE=$(aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION --query 'services[0].status' --output text 2>/dev/null)

if [ "$EXISTING_SERVICE" == "ACTIVE" ]; then
  echo "Service exists, updating..."
  aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $TASK_FAMILY \
    --force-new-deployment \
    --region $AWS_REGION
else
  echo "⚠️  Service does not exist. Please create it manually with:"
  echo "   aws ecs create-service --cluster $CLUSTER_NAME --service-name $SERVICE_NAME ..."
  echo "   See aws-deploy.md for complete instructions"
fi

# Cleanup
rm -f task-definition-updated.json

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure your load balancer or use public IP"
echo "2. Access the MCP server at: https://your-domain/sse"
echo "3. Test health endpoint: https://your-domain/health"
