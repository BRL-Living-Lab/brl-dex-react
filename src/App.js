import React from 'react';
import './App.css';
import Web3 from 'web3'
import {downloadFile,  NftFactory, calculateEstimatedGas, sendTx, ZERO_ADDRESS, ProviderInstance, Datatoken, getHash, Nft, Aquarius, generateDid }  from '@oceanprotocol/lib';
import { web3Provider, oceanConfig }  from './config';
// const Web3 = require("web3");



const web3 = new Web3(web3Provider);
const nft = new Nft(web3);
const datatoken = new Datatoken(web3);

function App() {


  const createDataNFTwithDatatoken = async () => {

    const Factory = new NftFactory(oceanConfig.erc721FactoryAddress, web3);
  
    const accounts = await web3.eth.getAccounts();
    const publisherAccount = accounts[0];
  
    console.log(`publisher account : ${publisherAccount}`);
  
    // Define dataNFT parameters
    const nftParams = {
      name: 'Data Asset with Datatoken',
      symbol: 'BRLData',
      templateIndex: 1,
      tokenURI: 'https://jsonkeeper.com/b/W72H',
      transferable: true,
      owner: publisherAccount
    };

    // Datatoken parameters
    const dtParams = {
        name: "Datatoken",
        symbol: "SDT",
        templateIndex: 2,
        cap: '4',
        feeAmount: '0',
        // paymentCollector is the address
        paymentCollector: ZERO_ADDRESS,
        feeToken: ZERO_ADDRESS,
        minter: publisherAccount,
        mpFeeAddress: ZERO_ADDRESS
      };
  
    // Call a Factory.createNFT(...) which will create a new dataNFT
    const result = await Factory.createNftWithDatatoken(
      publisherAccount,
      nftParams,
      dtParams
    );
  
    const numOfToken = await Factory.getCurrentTokenCount();
    const numOfNFTToken = await Factory.getCurrentNFTCount();
    console.log( `number of token count from this factory: ${numOfToken}`)
    console.log( `number of NFT token: ${numOfNFTToken}`)

    const nftAddress = result.events.NFTCreated.returnValues[0];
    const datatokenAddress = result.events.TokenCreated.returnValues[0];
  
    return {
      nftAddress,
      datatokenAddress
    };
  };


  // const handleSubmit = event => {
  //   event.preventDefault();
  //   alert('You have submitted the form.')
  // }

  return (
    <div className="wrapper">
      <h1>Data Exchange Marketplace</h1>
      <form onSubmit={createDataNFTwithDatatoken}>
      <fieldset>
         <label>
           <p>Name</p>
           <input name="name" />
         </label>
       </fieldset>
       <button type="submit">Publish</button>
      </form>
    </div>
  )
}

export default App;