const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const moduleIds = {
  'Master Waves 2PM a 4PM': '1Qk3ZTR8Mu9cvxdGGVYER'
};

async function test() {
  const cartItems = [{ name: 'Master Waves 2PM a 4PM', price: 1500 }];
  
  try {
    for (const item of cartItems) {
      const moduleId = moduleIds[item.name];
      console.log("Targeting ID:", moduleId);
      
      const data = await ddbDocClient.send(new GetCommand({ TableName: 'Modulos', Key: { id: moduleId } }));
      console.log("Get success:", data.Item);
      
      const updateResult = await ddbDocClient.send(new UpdateCommand({
        TableName: 'Modulos',
        Key: { id: moduleId },
        UpdateExpression: 'SET #name = #name - :inc',
        ExpressionAttributeNames: { '#name': item.name },
        ExpressionAttributeValues: { ':inc': 1 }
      }));
      console.log("Update success");
    }
    
    // Put payment
    const paymentId = crypto.randomUUID();
    await ddbDocClient.send(new PutCommand({ TableName: 'Payments', Item: { id: paymentId, test: true } }));
    console.log("Put success");
  } catch(e) {
    console.error("CRASH TRACE:", e.stack);
  }
}
test();
