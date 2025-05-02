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
  ButtonBase,
  Snackbar,
  SnackbarCloseReason,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import { ReusableModal } from "../common/reusable-modal/ReusableModal";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import {
  CoinActionContainer,
  CoinActionRow,
  HeaderRow,
} from "../header/Header-styles";
import { CustomInput, CustomLabel } from "./CreateSell";
import { Spacer } from "../common/Spacer";
import { usePublish, Service, QortalGetMetadata } from "qapp-core";
import { SetLeftFeature } from "ag-grid-community";

function calculateFeeFromRate(feePerKb, sizeInBytes) {
  const fee = (feePerKb / 1000) * sizeInBytes;
  return fee?.toFixed(0);
}

function calculateRateFromFee(totalFee, sizeInBytes) {
  return (totalFee / sizeInBytes) * 1000;
}

export const FeeManager = ({ selectedCoin, setFee, fee }) => {
  const [feeLocation, setFeeLocation] = useState<QortalGetMetadata>({
    name: "",
    identifier: "",
    service: "JSON",
  });
  const { resource } = usePublish(3, "JSON", feeLocation);
  const [editFee, setEditFee] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [recommendedFee, setRecommendedFee] = useState("m");
  const [openAlert, setOpenAlert] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const { getCoinLabel } = useContext(gameContext);
  console.log("editFee", editFee);
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
  const coin = useMemo(() => {
    return getCoinLabel(selectedCoin)?.toLowerCase();
  }, [selectedCoin, getCoinLabel]);

  const establishUpdateFeeForm = useCallback(async (coin) => {
    setFee("");
    // if the coin or type is not set, then abort
    if (!coin) {
      return;
    }
    console.log("selectedCoin", coin);
    // const coinRequest = coin.current.toLowerCase();
    const typeRequest = "feerequired";

    try {
      const response = await qortalRequestWithTimeout(
        {
          action: "GET_FOREIGN_FEE",
          coin: coin,
          type: typeRequest,
        },
        1800000
      );
      if (response && !isNaN(+response)) {
        setFee(response);
      }

      console.log("response", response);
    } catch (error) {
      setFee("");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    establishUpdateFeeForm(coin);
    console.log("editFee or fetch changed");
  }, [coin, establishUpdateFeeForm]);

  const recommendedFeeData = useMemo(() => {
    if (!resource?.data) return null;
    if (
      !resource?.data?.["BTC"] ||
      !resource?.data?.["LTC"] ||
      !resource?.data?.["DOGE"]
    )
      return null;
    return resource.data;
  }, [resource?.data]);

  const recommendedFeeDisplay = useMemo(() => {
    if (!selectedCoin || !recommendedFeeData) return;
    const coin = getCoinLabel(selectedCoin)?.toUpperCase();
    return recommendedFeeData[coin][recommendedFee];
  }, [recommendedFeeData, recommendedFee, selectedCoin]);

  const updateFee = async () => {
    const typeRequest = "feerequired";

    try {
        let feeToSave = editFee
        if(recommendedFee !== 'custom'){
            feeToSave = calculateFeeFromRate(recommendedFeeDisplay, 300)
        }
        console.log('feeToSave', feeToSave)
      const response = await qortalRequestWithTimeout(
        {
          action: "UPDATE_FOREIGN_FEE",
          coin: coin,
          type: typeRequest,
          value: feeToSave,
        },
        1800000
      );

      if (response && !isNaN(+response)) {
        setFee(response);
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

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if(newAlignment){
        setRecommendedFee(newAlignment);
    }
  };

 

  const getLatestFees = useCallback(async () => {
    try {
      const res = await fetch(
        `http://devnet-nodes.qortal.link:11112/arbitrary/resources/searchsimple?service=JSON&identifier=foreign-fee&name=Foreign-Fee-Publisher&prefix=true&limit=1&reverse=true`
      );
      const data = await res.json();
      if (data && data?.length > 0) {
        setFeeLocation(data[0]);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    getLatestFees();
  }, [getLatestFees]);

  if (!fee) return;
  return (
    <>
      <ButtonBase
        onClick={() => {
          setOpenModal(true);
          setEditFee(fee);
        }}
        sx={{
          minHeight: "42px",
          border: "1px solid gray",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "5px 5px",
          gap: "10px",
          borderRadius: "5px",
          "&:hover": {
            border: "1px solid white", // Border color on hover
          },
        }}
      >
        <Typography>Fee: {fee}</Typography>

        <ChangeCircleIcon
          sx={{
            color: "white",
          }}
        />
      </ButtonBase>
      {openModal && (
        <ReusableModal
          onClickClose={() => {
            setOpenModal(false);
            setEditFee(fee);
          }}
          backdrop
        >
          <CoinActionContainer sx={{
            width: '450px',
            maxWidth: '95vw'
          }}>
            <CoinActionRow>
              <HeaderRow>
                <Typography
                  variant="h4"
                  sx={{
                    color: "white",
                  }}
                >
                  Update unlocking fee for {selectedCoin}
                </Typography>
              </HeaderRow>
            </CoinActionRow>
            <CoinActionRow>
              <HeaderRow>
                <Box sx={{
                    width: '100%'
                }}>
                    <Box sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                  <CustomLabel htmlFor="standard-adornment-name">
                    Recommended fee selection
                  </CustomLabel>
           
                  <Spacer height="10px" />
                  <ToggleButtonGroup
                    color="primary"
                    value={recommendedFee}
                    exclusive
                    onChange={handleChange}
                    aria-label="Platform"
                  >
                    <ToggleButton value="l">Low</ToggleButton>
                    <ToggleButton value="m">Medium</ToggleButton>
                    <ToggleButton value="h">High</ToggleButton>
                    <ToggleButton value="custom">Custom</ToggleButton>
                  </ToggleButtonGroup>
                  </Box>
                  {recommendedFeeDisplay && (
                    <>
                      <Spacer height="15px" />
                      <Typography
                        sx={{
                          color: "white",
                          fontSize: "18px",
                        }}
                      >
                        New fee:{" "}
                        {calculateFeeFromRate(recommendedFeeDisplay, 300)}
                      </Typography>
                      <Spacer height="10px" />
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                        }}
                      >
                        <QuestionMarkIcon
                          sx={{
                            color: "white",
                          }}
                        />

                        <Typography
                          sx={{
                            color: "white",
                          }}
                        >
                          This recommended fee is derived from{" "}
                          {recommendedFeeDisplay} per kb, for a transaction that
                          is approximately 300 kB in size.
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </HeaderRow>
            </CoinActionRow>
            {recommendedFee === "custom" && (
              <CoinActionRow>
                <HeaderRow>
                  <Box>
                    <CustomLabel htmlFor="standard-adornment-name">
                      Custom fee
                    </CustomLabel>
                    <Spacer height="5px" />
                    <CustomInput
                      id="standard-adornment-name"
                      type="number"
                      value={editFee}
                      onChange={(e) => setEditFee(e.target.value)}
                      autoComplete="off"
                    />
                  </Box>
                </HeaderRow>
              </CoinActionRow>
            )}

            <ButtonBase
              onClick={updateFee}
              disabled={(recommendedFee === 'custom' && !editFee)}
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
              <Typography>Update fee</Typography>
            </ButtonBase>
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
