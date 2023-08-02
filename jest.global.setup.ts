import * as aws from 'aws-sdk'
import { createLocalDbTable } from './app/database/db'

const setup = async (): Promise<void> => {
  if (!process.env.CI) {
    process.env.AWS_SDK_LOAD_CONFIG = '1'
    aws.config.credentials = new aws.SharedIniFileCredentials({ profile: 'default' })
  }

  await createLocalDbTable()
}

export default setup
