import { Alert, Box, Button, DialogActions, DialogContent, DialogTitle, IconButton, InputLabel, Snackbar, SnackbarCloseReason, TextField, Typography, styled } from '@mui/material'
import React, { useContext } from 'react'
import { BootstrapDialog } from '../Terms'
import CloseIcon from '@mui/icons-material/Close';
import { Spacer } from '../common/Spacer';
import gameContext from '../../contexts/gameContext';
import TradeBotList from './TradeBotList';

export const CustomLabel = styled(InputLabel)`
  font-weight: 400;
  font-family: Inter;
  font-size: 10px;
  line-height: 12px;
  color: rgba(255, 255, 255, 0.5);

`

export const minimumAmountSellTrades = {
  'LITECOIN': {
    value: 0.01,
    ticker: 'LTC'
  },
  DOGECOIN: {
    value: 1,
    ticker: "DOGE",
  },
  BITCOIN: {
    value: 0.001,
    ticker: "BTC",
  },
  DIGIBYTE: {
    value: 0.01,
    ticker: "DGB",
  },
  RAVENCOIN: {
    value: 0.01,
    ticker: "RVN",
  },
  PIRATECHAIN: {
    value: 0.0002,
    ticker: "ARRR",
  },
}

export const CustomInput = styled(TextField)({
    width: "183px", // Adjust the width as needed
    borderRadius: "5px",
    // backgroundColor: "rgba(30, 30, 32, 1)",
    outline: "none",
    input: {
      fontSize: 10,
      fontFamily: "Inter",
      fontWeight: 400,
      color: "white",
      "&::placeholder": {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.2)",
      },
      outline: "none",
      padding: "10px",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        border: '0.5px solid rgba(255, 255, 255, 0.5)',
      },
      "&:hover fieldset": {
       border: '0.5px solid rgba(255, 255, 255, 0.5)',
      },
      "&.Mui-focused fieldset": {
       border: '0.5px solid rgba(255, 255, 255, 0.5)',
      },
    },
    "& .MuiInput-underline:before": {
      borderBottom: "none",
    },
    "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
      borderBottom: "none",
    },
    "& .MuiInput-underline:after": {
      borderBottom: "none",
    },
  });
  

export const CreateSell = ({qortAddress, show}) => {
    const [open, setOpen] = React.useState(false);
    const [qortAmount, setQortAmount] = React.useState(0)
    const [foreignAmount, setForeignAmount] = React.useState(0)
    const {updateTemporaryFailedTradeBots, sellOrders, fetchTemporarySellOrders, isUsingGateway, getCoinLabel, selectedCoin} = useContext(gameContext)
    const [openAlert, setOpenAlert] = React.useState(false)
  const [info, setInfo] = React.useState<any>(null)
    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
      setForeignAmount(0)
              setQortAmount(0)
    };

    const createSellOrder = async() => {
        try {
          setInfo({
            type: 'info',
            message: "Attempting to create sell order. Please wait..."
          })
           const res = await qortalRequestWithTimeout({
                action: "CREATE_TRADE_SELL_ORDER",
                qortAmount,
                foreignBlockchain: selectedCoin,
                foreignAmount: qortAmount * foreignAmount
              }, 900000);
             
            if(res?.error && res?.failedTradeBot){
                await updateTemporaryFailedTradeBots({
                    atAddress: res?.failedTradeBot?.atAddress,
                    status: 'FAILED',
                    qortAddress: res?.failedTradeBot?.creatorAddress,
                    
                })
                fetchTemporarySellOrders()
                setOpenAlert(true)
                setInfo({
                  type: 'error',
                  message: "Unable to create sell order. Please try again."
                })
            }
            if(!res?.error){
              setOpenAlert(true)
              setForeignAmount(0)
              setQortAmount(0)
              setOpen(false)

              setInfo({
                type: 'success',
                message: "Sell order created. Please wait a couple of minutes for the network to propogate the changes."
              })
            }
        } catch (error) {
          if(error?.error && error?.failedTradeBot){
            await updateTemporaryFailedTradeBots({
                atAddress: error?.failedTradeBot?.atAddress,
                status: 'FAILED',
                qortAddress: error?.failedTradeBot?.creatorAddress,
                
            })
            fetchTemporarySellOrders()
            setOpenAlert(true)
            setInfo({
              type: 'error',
              message: "Unable to create sell order. Please try again."
            })
        } 
        }
    }

    const handleCloseAlert = (
      event?: React.SyntheticEvent | Event,
      reason?: SnackbarCloseReason,
    ) => {
      if (reason === 'clickaway') {
        return;
      }
    
      setOpenAlert(false);
      setInfo(null)
    };
    
    if(isUsingGateway){

      return (
        <div style={{
          width: '100%',
          display: show ? 'flex' : 'none',
          height: '500px',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Typography sx={{
            color: 'white',
            maxWidth: '340px',
            padding: '10px'
          }}>
            Managing your sell orders is not possible using a gateway node. Please switch to a local or custom node at the authentication page
          </Typography>
          </div>
      )
    }
  return (
    <div style={{
      width: '100%',
      display: show ? 'block' : 'none'
    }}>
        <Button onClick={handleClickOpen}>New Sell Order</Button>
        <TradeBotList qortAddress={qortAddress} failedTradeBots={sellOrders.filter((item)=> item.status === 'FAILED')}  />

        <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        sx={{
            '& .MuiDialogContent-root': {
                width: '300px'
              },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {`New Sell Order - QORT for ${getCoinLabel()}`}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
        <Box>
            <CustomLabel htmlFor="standard-adornment-name">QORT amount</CustomLabel>
            <Spacer height="5px" />
            <CustomInput
              id="standard-adornment-name"
              type="number"
              value={qortAmount}
              onChange={(e) => setQortAmount(+e.target.value)}
              autoComplete="off"
            />
            <Spacer height="6px" />
            <CustomLabel htmlFor="standard-adornment-amount">
              {`Price Each (${getCoinLabel()})`}
            </CustomLabel>
            <Spacer height="5px" />
            <CustomInput
              id="standard-adornment-amount"
              type="number"
              value={foreignAmount}
              onChange={(e) => setForeignAmount(+e.target.value)}
              autoComplete="off"
            />
            <Spacer height="6px" />
           <Typography>{`${qortAmount * foreignAmount} ${getCoinLabel()}`} for {qortAmount} QORT</Typography>
            <Typography sx={{
              fontSize: '12px'
            }}>Total sell amount needs to be greater than: {minimumAmountSellTrades[selectedCoin]?.value} {' '} {minimumAmountSellTrades[selectedCoin]?.ticker}</Typography>
          </Box>

        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            Close
          </Button>
          <Button disabled={!qortAmount || !(qortAmount * foreignAmount > minimumAmountSellTrades[selectedCoin]?.value)} autoFocus onClick={createSellOrder}>
            Create sell order
          </Button>
        </DialogActions>
      </BootstrapDialog>
      <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} open={openAlert}  onClose={handleCloseAlert}>
        <Alert
                

          onClose={handleCloseAlert}
          severity={info?.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {info?.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
