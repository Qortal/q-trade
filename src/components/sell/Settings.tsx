import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import gameContext from "../../contexts/gameContext";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  SnackbarCloseReason,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import { ReusableModal } from "../common/reusable-modal/ReusableModal";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  CoinActionContainer,
  CoinActionRow,
  CoinSelectRow,
  HeaderRow,
} from "../header/Header-styles";
import { CustomInput, CustomLabel } from "./CreateSell";
import { Spacer } from "../common/Spacer";
import { usePublish, Service, QortalGetMetadata } from "qapp-core";
import { SetLeftFeature } from "ag-grid-community";
import { formatTimestampForum } from "../../utils/formatTime";
import { SelectRow } from "../header/Header";
import { useAtom } from "jotai/react";
import { selectedFeePublisherAtom } from "../../global/state";

export const Settings = () => {
  const [openModal, setOpenModal] = useState(false);
  const [lockingFee, setLockingFee] = useState("");
  const [editLockingFee, setEditLockingFee] = useState("");
  const [openAlert, setOpenAlert] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const [selectedCoin, setSelectedCoin] = useState("LTC");
  const [selectedFeePublisher, setSelectedFeePublisher] = useAtom(selectedFeePublisherAtom)
  const handleCloseAlert = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAlert(false);
    setInfo(null);
  };

  const updateLockingFee = async () => {
    const typeRequest = "feekb";

    try {
      const feeToSave = editLockingFee;

      const response = await qortalRequestWithTimeout(
        {
          action: "UPDATE_FOREIGN_FEE",
          coin: selectedCoin,
          type: typeRequest,
          value: feeToSave,
        },
        1800000
      );

      if (response && !isNaN(+response)) {
        setLockingFee(response);
        setEditLockingFee(response);
        setOpenAlert(true);
        setInfo({
          type: "success",
          message: "Fee updated!",
        });
        setOpenModal(false);
      } else throw new Error("Unable to update fee");
    } catch (error) {
      setOpenAlert(true);
      setInfo({
        type: "error",
        message: error?.message || "Unable to update fee",
      });
    }
  };

  const establishUpdateFeeForm = useCallback(async (coin) => {
    setLockingFee("");
    setEditLockingFee("");
    // if the coin or type is not set, then abort
    if (!coin) {
      return;
    }
    // const coinRequest = coin.current.toLowerCase();
    const typeRequest = "feekb";

    try {
      const response = await qortalRequestWithTimeout(
        {
          action: "GET_FOREIGN_FEE",
          coin: coin.toLowerCase(),
          type: typeRequest,
        },
        1800000
      );
      if (response !== null && response !== undefined && !isNaN(+response)) {
        setLockingFee(response);
        setEditLockingFee(response);
      }
    } catch (error) {
      setLockingFee("");
      setEditLockingFee("");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    establishUpdateFeeForm(selectedCoin);
  }, [selectedCoin, establishUpdateFeeForm]);

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => {
          setOpenModal(true);
          setEditLockingFee(lockingFee);
        }}
      >
        <SettingsIcon
          sx={{
            color: "white",
          }}
        />
      </Button>
      {openModal && (
        <ReusableModal
          onClickClose={() => {
            setOpenModal(false);
            setEditLockingFee(lockingFee);
          }}
          backdrop
          styles={{
            width: "450px",
            maxWidth: "95vw",
            padding: "15px",
          }}
          open={openModal}
        >
          <CoinActionContainer sx={{
            border: '1px solid #3F3F3F',
            borderRadius: '5px',
            padding: '5px'
          }}>
            <Typography>Locking fees</Typography>
            <CoinSelectRow sx={{
                gap: '20px'
            }}>
              <Select
                size="small"
                value={selectedCoin}
                onChange={(e) => {
                  setLockingFee("");
                  setEditLockingFee("");
                  setSelectedCoin(e.target.value);
                }}
              >
                <MenuItem value={"LTC"}>
                  <SelectRow coin="LTC" />
                </MenuItem>
                <MenuItem value={"DOGE"}>
                  <SelectRow coin="DOGE" />
                </MenuItem>
                <MenuItem value={"BTC"}>
                  <SelectRow coin="BTC" />
                </MenuItem>
                <MenuItem value={"DGB"}>
                  <SelectRow coin="DGB" />
                </MenuItem>
                <MenuItem value={"RVN"}>
                  <SelectRow coin="RVN" />
                </MenuItem>
              </Select>
              <Box>
                  <CustomLabel htmlFor="standard-adornment-name">
                    Locking fee for {selectedCoin} (sats)
                  </CustomLabel>
                  <Spacer height="5px" />
                  <CustomInput
                    id="standard-adornment-name"
                    type="number"
                    value={editLockingFee}
                    onChange={(e) => setEditLockingFee(e.target.value)}
                    autoComplete="off"
                  />
                </Box>
            </CoinSelectRow>

            <ButtonBase
              onClick={updateLockingFee}
              disabled={!editLockingFee}
              sx={{
                minHeight: "42px",
                border: "1px solid gray",
                color: "white",
                display: "flex",
                alignItems: "center",
                padding: "5px 20px",
                gap: "10px",
                borderRadius: "5px",
                "&:hover": {
                  border: "1px solid white", // Border color on hover
                },
              }}
            >
              <ChangeCircleIcon
                sx={{
                  color: "white",
                }}
              />
              <Typography>Update locking fee</Typography>
            </ButtonBase>
          </CoinActionContainer>
            <Spacer height="20px"/>
          <CoinActionContainer sx={{
            border: '1px solid #3F3F3F',
            borderRadius: '5px',
            padding: '5px'
          }}>
            <Typography>Fee publisher</Typography>
            <Select
                size="small"
                value={selectedFeePublisher}
                onChange={(e) => {
                  setSelectedFeePublisher(e.target.value);
                }}
              >
                <MenuItem value={"Foreign-Fee-Publisher"}>
                  <SelectRow coin="Foreign-Fee-Publisher" />
                </MenuItem>
                <MenuItem value={"Ice.JSON"}>
                  <SelectRow coin="Ice.JSON" />
                </MenuItem>
              </Select>
            </CoinActionContainer>
        </ReusableModal>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={openAlert}
        onClose={handleCloseAlert}
        autoHideDuration={6000}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={info?.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {info?.message}
        </Alert>
      </Snackbar>
    </>
  );
};
