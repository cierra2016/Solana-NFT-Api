const {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} = require("@solana/spl-token")
const { programs } = require("@metaplex/js")
const anchor = require("@project-serum/anchor")
const axios = require('axios')
const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl('devnet'))
const { metadata: { Metadata } } = programs
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
)
const dotenv = require('dotenv')
const { bs58 } = require("@project-serum/anchor/dist/cjs/utils/bytes")
dotenv.config()

class NFTService {
  static createAssociatedTokenAccountInstruction = (
    accosiatedTokenAddress,
    payer,
    walletAddress,
    splTokenMintAddress,
  ) => {
    const keys = [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: accosiatedTokenAddress, isSigner: false, isWritable: true },
      { pubkey: walletAddress, isSigner: false, isWritable: false },
      { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
      {
        pubkey: anchor.web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      {
        pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new anchor.web3.TransactionInstruction({
      keys,
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
      data: Buffer.from([]),
    });
  }
  
  static info = async (
    mint,
    owner,
  ) => {
    try{
      const mintKey = new anchor.web3.PublicKey(mint)
      const ownerKey = new anchor.web3.PublicKey(owner)
      let [pda] = await anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKey.toBuffer(),
      ], TOKEN_METADATA_PROGRAM_ID)
    
      const accountInfo = await connection.getParsedAccountInfo(pda)
      let metadata = new Metadata(ownerKey.toString(), accountInfo.value)
      const { data } = await axios.get(metadata.data.data.uri)
      
      return data
    } catch(error) {
      return error.message
    }
  }
  
  static getAssociatedTokenAddress = async(
    wallet,
    mint,
  ) => {
    return (
      await anchor.web3.PublicKey.findProgramAddress([
        wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()
      ], ASSOCIATED_TOKEN_PROGRAM_ID)
    )[0]
  }
  
  static transfer = async( 
    mint,
    to,
  ) => {
    try{
      const mintKey = new anchor.web3.PublicKey(mint)
      const toKey = new anchor.web3.PublicKey(to)
      const fromAccount = anchor.web3.Keypair.fromSecretKey(bs58.decode(process.env.CREATOR))
      const fromNFTAccount = await this.getAssociatedTokenAddress(fromAccount.publicKey, mintKey)
      const toNFTAccount = await this.getAssociatedTokenAddress(toKey, mintKey)
    
      let transaction = new anchor.web3.Transaction()
      if(await connection.getAccountInfo(toNFTAccount) == null){
        transaction.add(
          this.createAssociatedTokenAccountInstruction(
            toNFTAccount,
            fromAccount.publicKey,
            toKey,
            mintKey
          )
        )
     }
      transaction.add(
        createTransferInstruction(
          fromNFTAccount,
          toNFTAccount,
          fromAccount.publicKey,
          1,
          []
        )
      )
      var signature = await anchor.web3.sendAndConfirmTransaction( connection, transaction, [ fromAccount ] )
      
      return signature
    }catch(error) {
      return error.message
    }
  }
}

module.exports = NFTService