import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import axios from 'axios';

import { contractAddress } from '../config';
import NFTMarketplace from '../abi/NFTMarketplace.json';
import ProductList from '../components/ProductList';

function MyNFTs() {
  const [nfts, setNfts] = React.useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const getnetwork = await provider.getNetwork();
    const goerliChainId = 5;

    if (getnetwork.chainId != goerliChainId) {
      alert('Please connect to Goerli Testnet');
      return;
    }

    // sign the transaction
    const signer = provider.getSigner();
    const marketplaceContract = new ethers.Contract(contractAddress, NFTMarketplace.abi, signer);
    const data = await marketplaceContract.fetchMyNFTs();
    const items: any = await Promise.all(data.map(async (i: any) => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenURI);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        tokenURI
      };

      return item;
    }));

    setNfts(items);
    setLoadingState('loaded');
  }

  if (loadingState == 'not-loaded') return (
    <h1 className="text-3xl">Wait loading...</h1>
  )

  if (loadingState == 'loaded' && !nfts.length) return (
    <h1 className="text-3xl">No items in marketplace</h1>
  )

  return (
    <div>
      <ProductList products={nfts} onBuyNFT={() => null} />
    </div>
  )
}

export default MyNFTs