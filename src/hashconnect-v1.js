import { Hbar, AccountId, Client, PrivateKey, TransferTransaction, ContractCallQuery, ContractExecuteTransaction, ContractFunctionParameters, AccountBalanceQuery, ContractId } from "@hashgraph/sdk";
import { HashConnect } from "hashconnect";

const saveData = {
    topic: "",
    pairingString: "",
    encryptionKey: "",
    pairedWalletData: "",
    pairedAccounts: ""
}
let accountId;
let hashconnect = new HashConnect();

export const connectToWallet = async () => {

    hashconnect.pairingEvent.on(pairingData => {
        pairingData.accountIds.forEach(id => {
            accountId = id;
        })
    })

    let appData = {
        name: "dApp Example",
        description: "An example hedera dApp",
        icon: "https://absolute.url/to/icon.png"
    }

    let initData = await hashconnect.init(appData);
    let state = await hashconnect.connect();

    saveData.pairingString = hashconnect.generatePairingString(state, "testnet", false)
    saveData.encryptionKey = initData.privKey;
    saveData.topic = state.topic;

    const wallets = hashconnect.findLocalWallets();
    hashconnect.connectToLocalWallet(saveData.pairingString);

    console.log({ saveData, wallets })
}

export const sendTransaction = async () => {
    if (accountId) {
        const provider = hashconnect.getProvider("testnet", saveData.topic, accountId)
        const signer = hashconnect.getSigner(provider);
        const contractId = ContractId.fromString('0.0.47859171');

        //Execute a contract function (transfer)
        const contractExecTx2 = await new ContractExecuteTransaction()
            .setContractId(contractId)
            .setGas(3000000)
            .setFunction(
                "tokenTransfer",
                new ContractFunctionParameters()
                    .addAddress(AccountId.fromString(accountId).toSolidityAddress())
                    .addAddress(AccountId.fromString('0.0.47762050').toSolidityAddress())
                    .addInt64(5)
            )
            .setMaxTransactionFee(new Hbar(2))
            .freezeWithSigner(signer);

        const res = await contractExecTx2.executeWithSigner(signer)
        console.log({ res })

        // let trans = await new TransferTransaction()
        //     .addTokenTransfer('0.0.47859169', AccountId.fromString(accountId), -100)
        //     .addTokenTransfer('0.0.47859169', AccountId.fromString('0.0.47762050'), 100)
        //     .freezeWithSigner(signer);

        // const res = await trans.executeWithSigner(signer)
    } else {
        alert("No Account Id")
    }
}


export const getPhoneNumber = async () => {
    const provider = hashconnect.getProvider("testnet", saveData.topic, accountId)

    // //Create new keys
    const newAccountPrivateKey = await PrivateKey.generateED25519();
    // const newAccountPublicKey = newAccountPrivateKey.publicKey;
    // //Create new account ID
    // const newAccountId = await createNewAccountId(newAccountPublicKey);


    const client = Client.forTestnet().setOperator(accountId, '302e020100300506032b6570042204205be849b707e015eff1fc37419bb7b4b6ab4b7ba8593c1e61402ef190c520ac4e');

    const signer = hashconnect.getSigner(provider);
    const contractId = ContractId.fromString('0.0.47862101');
    const contractQueryTx = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Alice"));


    const result = await contractQueryTx.executewith(signer);
    const phoneNumber = result?.getUint256(0);
    console.log({ result, phoneNumber })

    // let trans = new ContractCallQuery()
    //     .setContractId(contractId)
    //     .setGas(100000)
    //     .setFunction("getMobileNumber", new ContractFunctionParameters().addString("Alice"));

    // let transactionByte = await trans.toBytes();

    // const transaction = {
    //     topic: saveData.topic,
    //     byteArray: transactionByte,
    //     metadata: {
    //         accountToSign: accountId,
    //         returnTransaction: false,
    //         hideNft: false
    //     }
    // }

    // let res = await hashconnect.sendTransaction(saveData.topic, transaction);
    // console.log({ trans, transactionByte, res })
    // console.log(new TextDecoder().decode(res.receipt))

    // var encodedString = String.fromCharCode.apply(null, res.receipt),
    //     decodedString = decodeURIComponent(escape(encodedString));
    // console.log({ decodedString });

    // console.log("The contract message: " + res.receipt.toString());
}

export const getBalance = async () => {
    if (accountId) {
        const provider = hashconnect.getProvider("testnet", saveData.topic, accountId)

        let balance = await provider.getAccountBalance(accountId);
        console.log({ balance })
        console.log(`balance: ${balance.tokens._map.get("0.0.47862257")}`)
    } else {
        alert("No Account Id")
    }
}