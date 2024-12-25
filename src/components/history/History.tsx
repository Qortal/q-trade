import { Alert, Box, Button, ButtonBase, DialogActions, DialogContent, DialogTitle, IconButton, InputLabel, Snackbar, SnackbarCloseReason, TextField, Typography, styled } from '@mui/material'
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BootstrapDialog } from '../Terms'
import CloseIcon from '@mui/icons-material/Close';
import { Spacer } from '../common/Spacer';
import gameContext from '../../contexts/gameContext';
import HistoryList from './HistoryList';
import RefreshIcon from "@mui/icons-material/Refresh";


  

export const History = ({qortAddress, show}) => {
    const [buyHistory, setBuyHistory] = useState({})
    const [sellHistory, setSellHistory] = useState({})

    const { getCoinLabel, selectedCoin} = useContext(gameContext)
    const [mode, setMode] = useState('buyHistory')
    const [open, setOpen] = useState(false)

    const selectedHistory = useMemo(()=> {
        if(mode === 'buyHistory') return buyHistory[selectedCoin] || []
        if(mode === 'sellHistory') return sellHistory[selectedCoin] || []
    }, [selectedCoin, buyHistory, sellHistory, mode])
    const getBuyHistory = useCallback((address, foreignBlockchain, mode, limit = 20)=> {
        setOpen(true)
            let  historyUrl
            if(mode === 'buyHistory'){
                historyUrl = `/crosschain/trades?foreignBlockchain=${foreignBlockchain}&buyerAddress=${address}&limit=${limit}&reverse=true`;

            }
            if(mode === 'sellHistory'){
                historyUrl = `/crosschain/trades?foreignBlockchain=${foreignBlockchain}&sellerAddress=${address}&limit=${limit}&reverse=true`;

            }

           
      
             fetch(historyUrl)
              .then((response) => {
                return response.json();
              })
              .then((data) => {
                if(mode === 'buyHistory'){
                    setBuyHistory((prev)=> {
                        return {
                            ...prev,
                            [foreignBlockchain]: data
                        }
                    })
                }
                if(mode === 'sellHistory'){
                    setSellHistory((prev)=> {
                        return {
                            ...prev,
                            [foreignBlockchain]: data
                        }
                    })
                }
               
            }).catch(()=> {}).finally(()=> {
                setOpen(false)
            })
    }, [])

    useEffect(()=> {
        if(!qortAddress || !selectedCoin) return
        if(mode === 'buyHistory' && buyHistory[selectedCoin])return
        if(mode === 'sellHistory' && sellHistory[selectedCoin])return

        getBuyHistory(qortAddress, selectedCoin, mode)
    }, [qortAddress, selectedCoin, buyHistory, mode])
 
  return (
    <div style={{
      width: '100%',
      display: show ? 'block' : 'none'
    }}>
        <Button variant='outlined' onClick={()=> {
            setMode('buyHistory')
        }}>Buy History</Button>
        <Button onClick={()=> {
             setMode('sellHistory')
        }} variant='outlined'>Sell History</Button>
        <ButtonBase onClick={()=> {
             getBuyHistory(qortAddress, selectedCoin, mode)
        }}>
            <RefreshIcon />
        </ButtonBase>
        <Typography>Showing most recent 20 results</Typography>
        <HistoryList qortAddress={qortAddress} historyList={selectedHistory}  />
        <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={open}
        onClose={()=> {
            setOpen(false)
        }}
      >
        <Alert
          onClose={()=> setOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {'Fetching History'}
        </Alert>
      </Snackbar>
    </div>
  )
}
