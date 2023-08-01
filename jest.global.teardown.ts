import { deleteLocalDBTable } from "./app/database/db"

const setup = async (): Promise<void> => {
  await deleteLocalDBTable()
}
export default setup
