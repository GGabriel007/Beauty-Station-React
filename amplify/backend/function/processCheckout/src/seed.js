const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Create AWS client using default developer credentials (from Amplify setup)
const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

const moduleIds = {
  'Master Waves 2PM a 4PM': '1Qk3ZTR8Mu9cvxdGGVYER',
  'Master Waves 6PM a 8PM': '2lAsVcE1N0gZl4Iiki3GP',
  'Peinados Para Eventos 2PM a 4PM': '3ASSXgw602WiVe4HpldAP',
  'Peinados Para Eventos 6PM a 8PM': '4rfA37M4cMXl6iO6bSwW4',
  'Maestrías en Novias y Tendencias 2PM a 4PM': '5rHw64GkL6be0GIqiVM17',
  'Maestrías en Novias y Tendencias 6PM a 8PM': '6gh7uXaEGwKGk5Ut2xUOR',
  'Curso Completo Peinado 2PM a 4PM': '7PgoPXqtemmdd1EpAhUMq',
  'Curso Completo Peinado 6PM a 8PM': '8o9SHzxxK9yJVOVds7idf',
  'Pieles Perfectas 2PM a 4PM': '92D9cfiMeVtav2HYhUA9Z',
  'Pieles Perfectas 6PM a 8PM': '931hGzkK3hqpEvLB4C4iSm',
  'Maquillaje Social 2PM a 4PM': '93hiNbQKXTUAUAYdRFeeN3',
  'Maquillaje Social 6PM a 8PM': '94wZBdWsajdmn30YInrflP',
  'Maestría en Novias y Tendencias 2PM a 4PM': '95eyWlva5vbnxaXDuVLmK4',
  'Maestría en Novias y Tendencias 6PM a 8PM': '96xtPAxBtiDBNK01FJbwMl',
  'Curso Completo Maquillaje 2PM a 4PM': '98aq0pkxn574RJGFiIB4CQ',
  'Curso Completo Maquillaje 6PM a 8PM': '991XsOABf2lp5CdSMm21YR3',
  'Kit de pieles perfectas' : '992U9kQfUcpxR0FpY9l4mDI',
};

async function seed() {
  console.log("Connecting securely to AWS DynamoDB to seed Modulos table...");
  const entries = Object.entries(moduleIds);
  let successCount = 0;

  for (const [name, id] of entries) {
    const item = {
      id: id,
      [name]: 30
    };
    try {
      await ddbDocClient.send(new PutCommand({
        TableName: 'Modulos',
        Item: item
      }));
      console.log(`    [SUCCESS] Mapped: ${name} -> 30 seats.`);
      successCount++;
    } catch (error) {
      console.error(`    [ERROR] Failed to map ${name}:`, error.message);
    }
  }
  
  console.log(`\nSeeded ${successCount} out of ${entries.length} items successfully!`);
}

seed();
