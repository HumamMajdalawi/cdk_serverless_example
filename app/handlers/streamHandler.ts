import { DynamoDBStreamEvent } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'


export const handleSportsDBStream = async (event: DynamoDBStreamEvent): Promise<void> => {
  console.log(`Received ${event.Records.length} Records`)
  console.log(JSON.stringify(event, null, 2))

  const unmarshallRecords = event.Records.map((record:any) => {
    const newImage = unmarshall(record.dynamodb.NewImage || {})
    const oldImage = unmarshall(record.dynamodb.OldImage || {})
    return {
      eventName: record.eventName,
      newImage,
      oldImage,
    }
  })

  console.log(unmarshallRecords)

  
  /*
        This lambda function will get trigger every time new records added to IngestTable     
  */

  // TODO: insert data into stasistics table 
}
