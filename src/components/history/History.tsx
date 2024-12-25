import {
  Alert,
  Box,
  ButtonBase,
  Snackbar
} from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import gameContext from "../../contexts/gameContext";
import HistoryList from "./HistoryList";
import { ShowingFont, Refresh, HistoryButtonRow, HistoryButton } from "./History-styles";

export const History = ({ qortAddress, show }) => {
  const [buyHistory, setBuyHistory] = useState({});
  const [sellHistory, setSellHistory] = useState({});

  const { selectedCoin } = useContext(gameContext);
  const [mode, setMode] = useState("buyHistory");
  const [open, setOpen] = useState(false);

  const selectedHistory = useMemo(() => {
    if (mode === "buyHistory") return buyHistory[selectedCoin] || [];
    if (mode === "sellHistory") return sellHistory[selectedCoin] || [];
  }, [selectedCoin, buyHistory, sellHistory, mode]);
  const getBuyHistory = useCallback(
    (address, foreignBlockchain, mode, limit = 20) => {
      setOpen(true);
      let historyUrl;
      if (mode === "buyHistory") {
        historyUrl = `/crosschain/trades?foreignBlockchain=${foreignBlockchain}&buyerAddress=${address}&limit=${limit}&reverse=true`;
      }
      if (mode === "sellHistory") {
        historyUrl = `/crosschain/trades?foreignBlockchain=${foreignBlockchain}&sellerAddress=${address}&limit=${limit}&reverse=true`;
      }

      fetch(historyUrl)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (mode === "buyHistory") {
            setBuyHistory((prev) => {
              return {
                ...prev,
                [foreignBlockchain]: data,
              };
            });
          }
          if (mode === "sellHistory") {
            setSellHistory((prev) => {
              return {
                ...prev,
                [foreignBlockchain]: data,
              };
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          setOpen(false);
        });
    },
    []
  );

  useEffect(() => {
    if (!qortAddress || !selectedCoin) return;
    if (mode === "buyHistory" && buyHistory[selectedCoin]) return;
    if (mode === "sellHistory" && sellHistory[selectedCoin]) return;

    getBuyHistory(qortAddress, selectedCoin, mode);
  }, [qortAddress, selectedCoin, buyHistory, mode]);

  return (
    <Box
      style={{
        width: "100%",
        display: show ? "block" : "none",
      }}
    >
      <HistoryButtonRow>
        <HistoryButton
          activeBtn={mode === "buyHistory"}
          onClick={() => {
            setMode("buyHistory");
          }}
        >
          Buy History
        </HistoryButton>
        <HistoryButton
          activeBtn={mode === "sellHistory"}
          onClick={() => {
            setMode("sellHistory");
          }}
        >
          Sell History
        </HistoryButton>
        <ButtonBase
          onClick={() => {
            getBuyHistory(qortAddress, selectedCoin, mode);
          }}
        >
          <Refresh />
        </ButtonBase>
      </HistoryButtonRow>
      <ShowingFont>Showing most recent 20 results</ShowingFont>
      <HistoryList qortAddress={qortAddress} historyList={selectedHistory} />
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {"Fetching History"}
        </Alert>
      </Snackbar>
    </Box>
  );
};
