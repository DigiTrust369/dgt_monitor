const { Provider, Network, AptosClient } = require("aptos");
class MoveFund{
    async fetchList(){
        let moduleAddress = "0xa78aa00f1e4b7f02b14154b54c16cc78dc2fc84a217b21b84ef677b63a2120fe"
        
        const alice = new AptosAccount();

        const payload= {
        function: `${moduleAddress}::sample::Sample`,
        type_arguments: [],
        arguments: ["read aptos.dev"],
        };

        const rawTxn = await client.generateTransaction(alice.address(), payload);
        const bcsTxn = AptosClient.generateBCSTransaction(alice, rawTxn);
        const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);

        const todoListResource = await aptos.getAccountResource(
            {
                accountAddress:'0xff88b86b6e70d70fc63bd2142aeb8e76ad44a512139cb2a93606b2315e4432f7',
                resourceType:`${moduleAddress}::sample::Sample`
            }
        );
        // tasks table handle
        const tableHandle = todoListResource.data.tasks.handle;
        // tasks table counter
        const taskCounter = todoListResource.data.task_counter;
  
        let tasks = [];
        let counter = 1;
        while (counter <= taskCounter) {
          const tableItem = {
            key_type: "u64",
            value_type: `${moduleAddress}::sample::Task`,
            key: `${counter}`,
          };
          const task = await aptos.getTableItem<Task>({handle:tableHandle, data:tableItem});
          tasks.push(task);
          counter++;
        }

        return tasks;
    }
    // try {
        
    //     // set tasks in local state
    //     setTasks(tasks);
    // } catch (e: any) {
    //     setAccountHasList(false);
    // }    
}

module.exports = MoveFund;