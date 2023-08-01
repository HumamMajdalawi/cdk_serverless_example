import * as aws from 'aws-sdk'
import { createLocalDbTable } from './app/database/db'

const setup = async (): Promise<void> => {
    console.log("process.env.CI",process.env.CI)
  if (!process.env.CI) {
    console.log("entered!")
    process.env.AWS_SDK_LOAD_CONFIG = '1'
    aws.config.credentials = new aws.SharedIniFileCredentials({ profile: 'development' })
  }

  await createLocalDbTable()
}

export default setup
