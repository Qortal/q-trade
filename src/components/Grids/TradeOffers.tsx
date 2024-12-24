import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, RowClassParams, RowStyle, SizeColumnsToContentStrategy } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { sendRequestToExtension } from '../../App';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, SnackbarCloseReason, Typography } from '@mui/material';
import gameContext from '../../contexts/gameContext';
import { subscribeToEvent, unsubscribeFromEvent } from '../../utils/events';
import { useModal } from '../common/useModal';
import FileSaver from 'file-saver';
import { BuyContainer } from './Table-styles';

export const baseLocalHost = window.location.host
// export const baseLocalHost = '127.0.0.1:12391'

interface RowData {
  amountQORT: number;
  priceUSD: number;
  totalUSD: number;
  seller: string;
}

export const saveFileToDisk = async (data) => {
   
  const dataString = JSON.stringify(data);
  const blob = new Blob([dataString], { type: 'application/json' });
const fileName = "traderecord_" + Date.now() + '_'  + ".json";

await FileSaver.saveAs(blob, fileName);

}

export const autoSizeStrategy: SizeColumnsToContentStrategy = {
  type: 'fitCellContents'
};

export const TradeOffers: React.FC<any> = ({foreignCoinBalance}:any) => {
  const [offers, setOffers] = useState<any[]>([])
  const [qortalNames, setQortalNames] = useState({})
  const { fetchOngoingTransactions, onGoingTrades, updateTransactionInDB, isUsingGateway, getCoinLabel, selectedCoin } = useContext(gameContext);
  const listOfOngoingTradesAts = useMemo(()=> {
      return onGoingTrades?.filter((item)=> item?.status !== 'trade-failed')?.map((trade)=> trade?.qortalAtAddress) || []
  }, [onGoingTrades])
  const {
    isShow: isShowInfo,
    onCancel: onCancelInfo,
    onOk: onOkInfo,
    show: showInfo,
    message: messageInfo,
  } = useModal();

  const offersWithoutOngoing = useMemo(()=> {
    return offers.filter((item)=> !listOfOngoingTradesAts.includes(item.qortalAtAddress))
  }, [listOfOngoingTradesAts, offers])
  const initiatedFetchPresence = useRef(false)
  const initiatedFetchPresenceSocket = useRef(false)

  const socketRef = useRef(null)
  const socketPresenceRef = useRef(null)
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [selectedOffers, setSelectedOffers] = useState<any>([])
  const [record, setRecord] = useState(null)
  const tradePresenceTxns = useRef<any[]>([])
  const offeringTrades = useRef<any[]>([])
  const blockedTradesList = useRef([])
  const gridRef = useRef<any>(null)

 
  const [open, setOpen] = useState(false)
  const [info, setInfo] = useState<any>(null)
  const BuyButton = () => {
    return (
      <button onClick={buyOrder} style={{borderRadius: '8px', width: '74px', height:"30px", background: "#4D7345",
         color: 'white',  cursor: 'pointer', border: '1px solid #375232', boxShadow: '0px 2.77px 2.21px 0px #00000005'
          }}>
        BUY
      </button>
    );
  };
 
  const defaultColDef = {
    resizable: true, // Make columns resizable by default
    sortable: true, // Make columns sortable by default
    suppressMovable: true, // Prevent columns from being movable
  };

  const getName = async (address)=> {
    try {
      const response = await fetch("/names/address/" + address);
    const nameData = await response.json();
    if (nameData?.length > 0) {
      setQortalNames((prev)=> {
        return {
          ...prev,
          [address]: nameData[0].name
        }
      })
    } else {
      setQortalNames((prev)=> {
        return {
          ...prev,
          [address]: null
        }
      })
    }
    } catch (error) {
      // error
    }
  }

    const restartTradeOffers = ()=> {
    if (socketRef.current) {
      socketRef.current.close(1000, 'forced'); // Close with a custom reason
      socketRef.current = null
    }
    offeringTrades.current = []
    setOffers([])
    setSelectedOffer(null)
  }

  const restartPresence = ()=> {
    if (socketPresenceRef.current) {
      socketPresenceRef.current.close(1000, 'forced'); // Close with a custom reason
      socketPresenceRef.current = null
    }
  }

  const columnDefs: ColDef[] = useMemo(()=> {
    return [
      { 
        headerCheckboxSelection: true, // Adds a checkbox in the header for selecting all rows
        checkboxSelection: true, // Adds checkboxes in each row for selection
        headerName: "", // You can customize the header name
        width: 50, // Adjust the width as needed
        pinned: 'left', // Optional, to pin this column on the left
        resizable: false,
      },
      { headerName: "QORT AMOUNT", field: "qortAmount" , flex: 1, // Flex makes this column responsive
      minWidth: 150, // Ensure it doesn't shrink too much
      resizable: true },
      { headerName: `${getCoinLabel()}/QORT`, valueGetter: (params) => +params.data.foreignAmount / +params.data.qortAmount, sortable: true, sort: 'asc', flex: 1, // Flex makes this column responsive
      minWidth: 150, // Ensure it doesn't shrink too much
      resizable: true  },
      { headerName: `Total ${getCoinLabel()} Value`, field: "foreignAmount", flex: 1, // Flex makes this column responsive
      minWidth: 150, // Ensure it doesn't shrink too much
      resizable: true },
      { headerName: "Seller", field: "qortalCreator", flex: 1, // Flex makes this column responsive
      minWidth: 300, // Ensure it doesn't shrink too much
      resizable: true, valueGetter: (params)=> {
        if(params?.data?.qortalCreator){
          if(qortalNames[params?.data?.qortalCreator]){
            return qortalNames[params?.data?.qortalCreator] 
          } else if(qortalNames[params?.data?.qortalCreator] === undefined){
            getName(params?.data?.qortalCreator)
  
            return params?.data?.qortalCreator
          } else {
            return params?.data?.qortalCreator
  
          }
        }
      } },
    ];
  },[qortalNames])

 

  // const onRowClicked = (event: any) => {
  //   if(listOfOngoingTradesAts.includes(event.data.qortalAtAddress)) return
  //   setSelectedOffer(event.data)

  // };

  const restartTradePresenceWebSocket = () => {
    restartPresence()
    setTimeout(() => initTradePresenceWebSocket(true), 50)
  }



  const getNewBlockedTrades = async () => {
    const unconfirmedTransactionsList = async () => {

      const unconfirmedTransactionslUrl = `/transactions/unconfirmed?txType=MESSAGE&limit=0&reverse=true`

      var addBlockedTrades = JSON.parse(localStorage.getItem('failedTrades') || '[]')

      await fetch(unconfirmedTransactionslUrl).then(response => {
        return response.json()
      }).then(data => {
        data.map((item: any) => {
          const unconfirmedNessageTimeDiff = Date.now() - item.timestamp
          const timeOneHour = 60 * 60 * 1000
          if (Number(unconfirmedNessageTimeDiff) > Number(timeOneHour)) {
            const addBlocked = {
              timestamp: item.timestamp,
              recipient: item.recipient
            }
            addBlockedTrades.push(addBlocked)
          }
        })
        localStorage.setItem("failedTrades", JSON.stringify(addBlockedTrades))
        blockedTradesList.current = JSON.parse(localStorage.getItem('failedTrades') || '[]')
      })
    }

    await unconfirmedTransactionsList()

    const filterUnconfirmedTransactionsList = async () => {
      let cleanBlockedTrades = blockedTradesList.current.reduce((newArray, cut: any) => {
        if (cut && !newArray.some((obj: any) => obj.recipient === cut.recipient)) {
          newArray.push(cut)
        }
        return newArray
      }, [] as any[])
      localStorage.setItem("failedTrades", JSON.stringify(cleanBlockedTrades))
      blockedTradesList.current = JSON.parse(localStorage.getItem("failedTrades") || "[]")
    }

    await filterUnconfirmedTransactionsList()
    processOffersWithPresence()
  }

  const executeGetNewBlockTrades = useCallback(()=> {
    getNewBlockedTrades()
   
  }, [])

  useEffect(() => {
    subscribeToEvent("execute-get-new-block-trades", executeGetNewBlockTrades);

    return () => {
      unsubscribeFromEvent("execute-get-new-block-trades", executeGetNewBlockTrades);
    };
  }, []);

  const processOffersWithPresence = () => {
    if (offeringTrades.current === null) return
    async function asyncForEach(array: any, callback: any) {
      for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array)
      }
    }


    const filterOffersUsingTradePresence = (offeringTrade: any) => {
      return offeringTrade.tradePresenceExpiry > Date.now();
    }

    const startOfferPresenceMapping = async () => {
      if (tradePresenceTxns.current) {
        for (const tradePresence of tradePresenceTxns.current) {
          const offerIndex = offeringTrades.current.findIndex(offeringTrade => offeringTrade.qortalCreatorTradeAddress === tradePresence.tradeAddress);
          if (offerIndex !== -1) {
            offeringTrades.current[offerIndex].tradePresenceExpiry = tradePresence.timestamp;
          }
        }
      }

      let filteredOffers = offeringTrades.current?.filter((offeringTrade) => filterOffersUsingTradePresence(offeringTrade)) || []
      let tradesPresenceCleaned: any[] = filteredOffers


      blockedTradesList.current.forEach((item: any) => {
        const toDelete = item.recipient
        tradesPresenceCleaned = tradesPresenceCleaned?.filter(el => {
          return el.qortalCreatorTradeAddress !== toDelete
        }) || []
      })

      if (tradesPresenceCleaned) {
        updateGridData(tradesPresenceCleaned)
      }
    }

    startOfferPresenceMapping()
  }

  const restartTradeOffersWebSocket = () => {
    setTimeout(() => initTradeOffersWebSocket(true), 50)
  }

  const initTradePresenceWebSocket = (restarted = false) => {
    if(socketPresenceRef.current) return
    let socketTimeout: any
    let socketLink 
    if(isUsingGateway){
      socketLink = `wss://appnode.qortal.org/websockets/crosschain/tradepresence`
    } else {
      socketLink = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${baseLocalHost}/websockets/crosschain/tradepresence`;

    }
    
   
    socketPresenceRef.current = new WebSocket(socketLink)
    socketPresenceRef.current.onopen = () => {
      setTimeout(pingSocket, 50)
    }
    socketPresenceRef.current.onmessage = (e) => {
      tradePresenceTxns.current = !initiatedFetchPresenceSocket.current ? JSON.parse(e.data) : [...tradePresenceTxns.current, ...JSON.parse(e.data)]
      initiatedFetchPresenceSocket.current = true
      processOffersWithPresence()
      restarted = false
    }
    socketPresenceRef.current.onclose = (event) => {
      clearTimeout(socketTimeout)
      if (event.reason === 'forced') {
        return
      }
      restartTradePresenceWebSocket()
    }
    socketPresenceRef.current.onerror = (e) => {
      clearTimeout(socketTimeout)
      restartTradePresenceWebSocket()
    }
    const pingSocket = () => {
      socketPresenceRef.current.send('ping')
      socketTimeout = setTimeout(pingSocket, 295000)
    }
  }




  const initTradeOffersWebSocket = (restarted = false) => {

    if(socketRef.current) return
    let socketTimeout: any

    let socketLink 
    if(isUsingGateway){
      socketLink = `wss://appnode.qortal.org/websockets/crosschain/tradeoffers?foreignBlockchain=${selectedCoin}&includeHistoric=true`
    } else {
      socketLink = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${baseLocalHost}/websockets/crosschain/tradeoffers?foreignBlockchain=${selectedCoin}&includeHistoric=true`

    }
    socketRef.current = new WebSocket(socketLink)
    socketRef.current.onopen = () => {
      setTimeout(pingSocket, 50)
    }
    socketRef.current.onmessage = (e) => {
      offeringTrades.current = [...offeringTrades.current?.filter((coin)=> coin?.foreignBlockchain === selectedCoin), ...JSON.parse(e.data)?.filter((coin)=> coin?.foreignBlockchain === selectedCoin)]
      restarted = false
      processOffersWithPresence()
    }
    socketRef.current.onclose = (event) => {
      clearTimeout(socketTimeout)
      if (event.reason === 'forced') {
        return
      }
      restartTradeOffersWebSocket()
      socketRef.current = null
    }
    socketRef.current.onerror = (e) => {
      clearTimeout(socketTimeout)
    }
    const pingSocket = () => {
      socketRef.current.send('ping')
      socketTimeout = setTimeout(pingSocket, 295000)
    }
  }


  useEffect(() => {
    blockedTradesList.current = JSON.parse(localStorage.getItem('failedTrades') || '[]')
    if(!initiatedFetchPresence.current){
      initiatedFetchPresence.current = true
      initTradePresenceWebSocket()

    }
    getNewBlockedTrades()
    const intervalBlockTrades = setInterval(() => {
      
      initiatedFetchPresenceSocket.current = false
      restartPresence()
      initTradePresenceWebSocket()
      getNewBlockedTrades()
    }, 150000)

    return () => {
      clearInterval(intervalBlockTrades)
    }
  }, [isUsingGateway])

 

  useEffect(() => {
    if(selectedCoin === null) return
    restartTradeOffers()
    setTimeout(() => {
      initTradeOffersWebSocket()

    }, 500);
    return () => {
      if(socketRef.current){
        socketRef.current.close(1000, 'forced');
      }
    }
  }, [isUsingGateway, selectedCoin])





  const selectedTotalLTC = useMemo(() => {
    return selectedOffers.reduce((acc: number, curr: any) => {
      return acc + (+curr.foreignAmount || 0); // Ensure qortAmount is defined
    }, 0);
  }, [selectedOffers]);


  const buyOrder = async () => {
    try {
      if(+foreignCoinBalance < +selectedTotalLTC.toFixed(4)){
        setOpen(true)
        setInfo({
          type: 'error',
          message: `You don't have enough ${getCoinLabel()} or your balance was not retrieved`
        })
        return
      }
      
      if (selectedOffers?.length <  1) return
      setOpen(true)
      setInfo({
        type: 'info',
        message: "Attempting to submit buy order. Please wait..."
      })
      const listOfATs = selectedOffers
      const response = await qortalRequestWithTimeout({
        action: "CREATE_TRADE_BUY_ORDER",
        crosschainAtInfo: listOfATs,
        foreignBlockchain: selectedCoin
      }, 900000);
 
      if(response?.error){
        setOpen(true)
      setInfo({
        type: 'error',
        message: response?.error || "Failed to submit trade order."
      })
      return
      }
      if (response?.extra?.atAddresses) {
        setSelectedOffers([])
        const transactionData = {
          qortalAtAddresses: response?.extra?.atAddresses,
          qortAddress: response?.extra?.senderAddress,
          node: response?.extra?.node,
          status:response?.extra?.status ? response?.extra?.status : response.callResponse === true ? 'trade-ongoing' : 'trade-failed',
          encryptedMessageToBase58: response?.encryptedMessageToBase58,
          chatSignature: response?.chatSignature,
          sender: response?.extra?.senderAddress,
          senderPublicKey: response?.extra?.senderPublicKey,
          reference: response?.callResponse?.reference,
        };


    
        // Update transactions in IndexedDB
        const result = await updateTransactionInDB(transactionData);
        setOpen(true)
        setInfo({
          type: 'success',
          message: "Submitted Order"
        })
        fetchOngoingTransactions()
        if(isUsingGateway){
          setRecord(transactionData)
          await showInfo({
            message: `Keep a record of your order in case your trade gets stuck`,
           })
        }
        
      }

    } catch (error) {
      setOpen(true)
      setInfo({
        type: 'error',
        message: error?.error || error?.message || "Failed to submit trade order."
      })
      console.error(error)
    }
  }

 
  const getRowStyle = (params: RowClassParams<any, any>): RowStyle | undefined => {
  
    if (listOfOngoingTradesAts.includes(params.data.qortalAtAddress)) {
      return { background: '#D9D9D91A'};
    }
    if (params.data.qortalAtAddress === selectedOffer?.qortalAtAddress) {
      return { background: '#6D94F533'};
    }
    return undefined;
  };
  // const onGridReady = (params) => {
  //   const allColumnIds = params.columnApi.getAllColumns().map(col => col.getColId());
  //   params.columnApi.autoSizeColumns(allColumnIds, false);
  // };

  const onSelectionChanged = (event: any) => {
    const selectedRows = event.api.getSelectedRows();
    
    setSelectedOffers([...selectedRows]); // Set all selected rows
  };
  
  const onRowClicked = (event: any) => {
    if (listOfOngoingTradesAts.includes(event.data.qortalAtAddress)) return;
    const selectedRows = gridRef.current?.api.getSelectedRows();
    setSelectedOffers([...selectedRows]); // Always spread the array to ensure state updates correctly
  };


  const updateGridData = (newData: any) => {
    if (gridRef.current) {

      setOffers(newData);

    }
  };

  const getRowId = useCallback(function (params: any) {
    return String(params.data.qortalAtAddress);
}, []);

const selectedTotalQORT = useMemo(() => {
  return selectedOffers.reduce((acc: number, curr: any) => {
    return acc + (+curr.qortAmount || 0); // Ensure qortAmount is defined
  }, 0);
}, [selectedOffers]);


const onGridReady = useCallback((params: any) => {
  params.api.sizeColumnsToFit(); // Adjust columns to fit the grid width
  const allColumnIds = params.columnApi.getAllColumns().map((col: any) => col.getColId());
  params.columnApi.autoSizeColumns(allColumnIds); // Automatically adjust the width to fit content
}, []);


const handleClose = (
  event?: React.SyntheticEvent | Event,
  reason?: SnackbarCloseReason,
) => {
  if (reason === 'clickaway') {
    return;
  }

  setOpen(false);
  setInfo(null)
};


 

  return (
    <Box sx={{
      width: '100%',
    }}>
    <div className="ag-theme-alpine-dark" style={{ height: 400, width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        rowData={offersWithoutOngoing}
        onRowClicked={onRowClicked}
        onSelectionChanged={onSelectionChanged}
        getRowStyle={getRowStyle}
        autoSizeStrategy={autoSizeStrategy}
        rowSelection={selectedCoin ===  'PIRATECHAIN' ? "single" :"multiple"} // Enable multi-select
        rowMultiSelectWithClick={true}
        suppressHorizontalScroll={false} // Allow horizontal scroll on mobile if needed
        suppressCellFocus={true} // Prevents cells from stealing focus in mobile
        // pagination={true}
        // paginationPageSize={10}
        onGridReady={onGridReady}
      //  domLayout='autoHeight'
        getRowId={(params) => params.data.qortalAtAddress} // Ensure rows have unique IDs 
      />
      {/* {selectedOffer && (
        <Button onClick={buyOrder}>Buy</Button>

      )} */}
    </div>
    <div style={{
      height: '120px'
    }} />
    <BuyContainer>
      <Box sx={{
        display: 'flex',
        gap: '5px',
        flexDirection: 'column',
        width: '100%'
      }}>
       <Typography sx={{
          fontSize: '16px',
          color: 'white',
          width: 'calc(100% - 75px)'
        }}>{selectedTotalQORT?.toFixed(3)} QORT</Typography> 
        <Box sx={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        width: 'calc(100% - 75px)'
      }}>
         <Typography sx={{
          fontSize: '16px',
          color: selectedTotalLTC > foreignCoinBalance ? 'red' : 'white',
        }}><span>{selectedTotalLTC?.toFixed(4)}</span> <span style={{
          marginLeft: 'auto'
        }}>{`${getCoinLabel()} `}</span></Typography>


        </Box>
        <Typography sx={{
          fontSize: '16px',
          color: 'white',
          
        }}><span>{foreignCoinBalance?.toFixed(4)}</span> <span style={{
          marginLeft: 'auto'
        }}>{`${getCoinLabel()} `} balance</span></Typography>
      </Box>
      {BuyButton()}
    </BuyContainer>
    <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={open}  onClose={handleClose}>
        <Alert
                

          onClose={handleClose}
          severity={info?.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {info?.message}
        </Alert>
      </Snackbar>
      {isShowInfo && (
        <Dialog
          open={isShowInfo}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Download record"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{
              color: 'white'
            }}>
              {messageInfo.message}
            </DialogContentText>
            <Button onClick={async ()=> {
              try {
                const fileName = "traderecord_" + Date.now() + '_'  + ".json";
                const dataString = JSON.stringify(record);
  const blob = new Blob([dataString], { type: 'application/json' });
                await qortalRequest({
                  action: 'SAVE_FILE',
                  filename: fileName,
                  blob
                })
              } catch (error) {
                
              }
            }}>Save Record</Button>
          </DialogContent>
          <DialogActions>
            
            <Button variant="contained" onClick={onOkInfo} autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

