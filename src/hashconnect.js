import {
    Client,
    AccountId,
    ContractCallQuery,
    ContractExecuteTransaction,
    ContractFunctionParameters,
} from "@hashgraph/sdk";
import { HashConnect } from "hashconnect";

const saveData = {
    topic: "",
    pairingString: "",
    encryptionKey: "",
    pairedWalletData: "",
    pairedAccounts: ""
}
let accountId;

//create the hashconnect instance
const hashconnect = new HashConnect();
const contractId = '0.0.47901147';
const tokenId = '0.0.47901145';
const privateKey = '302e020100300506032b6570042204205be849b707e015eff1fc37419bb7b4b6ab4b7ba8593c1e61402ef190c520ac4e';

export const connectToWallet = async () => {
    const appMetadata = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://absolute.url/to/icon.png"
    }

    //register events
    setUpHashConnectEvents();

    let { encryptionKey, pairingString, topic } = await hashconnect.init(appMetadata, "testnet", false);
    saveData.pairingString = pairingString;
    saveData.topic = topic;
    saveData.encryptionKey = encryptionKey;
}

export const setUpHashConnectEvents = () => {
    hashconnect.foundExtensionEvent.once((walletMetadata) => {
        hashconnect.connectToLocalWallet(saveData.pairingString, walletMetadata);
    })

    hashconnect.pairingEvent.on(pairingData => {
        pairingData.accountIds.forEach(id => {
            accountId = id;
        })
    })
}

export const sendTransaction = async () => {
    if (accountId) {
        const provider = hashconnect.getProvider("testnet", saveData.topic, accountId)
        const signer = hashconnect.getSigner(provider);

        //Execute a contract function (transfer)
        const contractExecTx1 = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(3000000)
            .setFunction(
                "tokenTransfer",
                new ContractFunctionParameters()
                    .addAddress(AccountId.fromString(accountId).toSolidityAddress())
                    .addAddress(AccountId.fromString('0.0.47762050').toSolidityAddress())
                    .addInt64(5)
            )
            .freezeWithSigner(signer);

        const res = await contractExecTx1.executeWithSigner(signer);
        console.log({ res })
    } else {
        alert("No Account Id")
    }
}


export const getPhoneNumber = async () => {
    const client = Client.forTestnet().setOperator(accountId, privateKey);

    const contractQueryTx = new ContractCallQuery()
        .setContractId("0.0.47909686")
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Alice"));

    const result = await contractQueryTx.execute(client);
    const phoneNumber = result?.getUint256(0).toString();
    console.log({ result, phoneNumber })
}

export const getBalance = async () => {
    if (accountId) {
        const provider = hashconnect.getProvider("testnet", saveData.topic, accountId)
        const accountBalance = await provider.getAccountBalance(accountId);
        const tokenBalance = accountBalance.toJSON().tokens.find(token => token.tokenId === tokenId);

        console.log(`balance: ${tokenBalance.balance}`);
    } else {
        alert("No Account Id")
    }
}