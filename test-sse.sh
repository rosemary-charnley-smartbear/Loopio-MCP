#!/bin/bash

# Test script for Loopio MCP Server (SSE mode)

echo "🧪 Testing Loopio MCP Server in SSE mode"
echo ""

# Start server in background
echo "Starting server..."
MCP_TRANSPORT=sse PORT=3000 node dist/index.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test health endpoint
echo ""
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
echo "Response: $HEALTH_RESPONSE"

if echo "$HEALTH_RESPONSE" | grep -q "ok"; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
fi

# Test SSE endpoint
echo ""
echo "Testing SSE endpoint..."
SSE_RESPONSE=$(curl -s -N -H "Accept: text/event-stream" http://localhost:3000/sse &)
SSE_PID=$!
sleep 2

if ps -p $SSE_PID > /dev/null; then
  echo "✅ SSE endpoint is streaming"
  kill $SSE_PID 2>/dev/null
else
  echo "❌ SSE endpoint failed"
fi

# Cleanup
echo ""
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "✅ Test complete"
