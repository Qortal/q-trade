import { useState, useEffect, useRef, useContext, ChangeEvent } from "react";
import {
  BubbleCardColored1,
  CoinActionsRow,
  CoinReceiveBtn,
  CoinSelectRow,
  CoinSendBtn,
  HeaderNav,
  HeaderText,
  LogoColumn,
  NameRow,
  RightColumn,
  TotalCol,
  Username,
} from "./Header-styles";
import gameContext from "../../contexts/gameContext";
import { UserContext } from "../../contexts/userContext";
import { cropAddress } from "../../utils/cropAddress";
import qtradeLogo from "../../components/common/icons/qtradeLogo.png";
import qortIcon from "../../assets/img/qort.png";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  MenuItem,
  Select,
  Snackbar,
  SnackbarCloseReason,
  Switch,
  styled,
} from "@mui/material";
import { sendRequestToExtension } from "../../App";
import { Terms } from "../Terms";
import ltcIcon from "../../assets/img/ltc.png";
import btcIcon from "../../assets/img/btc.png";
import dogeIcon from "../../assets/img/doge.png";
import rvnIcon from "../../assets/img/rvn.png";
import dgbIcon from "../../assets/img/dgb.png";
import arrrIcon from "../../assets/img/arrr.png";
import { Spacer } from "../common/Spacer";

const checkIfLocal = async () => {
  try {
    const response = await sendRequestToExtension("CHECK_IF_LOCAL");

    if (!response.error) {
      return response;
    }
  } catch (error) {
    return false;
  }
};

export const Label = styled("label")(
  ({ theme }) => `
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 14px;
  display: block;
  margin-bottom: 4px;
  font-weight: 400;
  `
);

const getCoinIcon = (coin) => {
  let img;

  switch (coin) {
    case "LTC":
      img = ltcIcon;
      break;
    case "BTC":
      img = btcIcon;
      break;

    case "DOGE":
      img = dogeIcon;
      break;
    case "RVN":
      img = rvnIcon;
      break;

    case "ARRR":
      img = arrrIcon;
      break;
    case "DGB":
      img = dgbIcon;
      break;
    default:
      null;
  }
  return img;
};

const SelectRow = ({ coin }) => {
  let img = getCoinIcon(coin);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        height: "25px",
      }}
    >
      <img
        style={{
          height: "20px",
          width: "auto",
        }}
        src={img}
      />
      <p>{coin}</p>
    </div>
  );
};

export const Header = ({ qortBalance, foreignCoinBalance }: any) => {
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<any>(null);
  const { isUsingGateway } = useContext(gameContext);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChecked(false);
    setOpen(true);
    setInfo({
      type: "error",
      message: "Change the node you are using at the authentication page",
    });
  };
  const { userInfo, selectedCoin, setSelectedCoin, getCoinLabel } =
    useContext(gameContext);
  const { avatar, setAvatar } = useContext(UserContext);

  const LocalNodeSwitch = styled(Switch)(({ theme }) => ({
    padding: 8,
    "& .MuiSwitch-track": {
      borderRadius: 22 / 2,
      "&::before, &::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        width: 16,
        height: 16,
      },
      "&::before": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main)
        )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
        left: 12,
      },
      "&::after": {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
          theme.palette.getContrastText(theme.palette.primary.main)
        )}" d="M19,13H5V11H19V13Z" /></svg>')`,
        right: 12,
      },
    },
    "& .MuiSwitch-thumb": {
      boxShadow: "none",
      width: 16,
      height: 16,
      margin: 2,
    },
  }));

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
    setInfo(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // // Fetch avatar on userInfo change
  // useEffect(() => {
  //   if (userInfo?.name) {
  //     getAvatar();
  //   }
  // }, [userInfo]);

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          background: "rgba(39, 40, 44, 1)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "10px",
          }}
        >
          <LogoColumn>
            <img
              src={qtradeLogo}
              style={{
                height: "40px",
              }}
            />
          </LogoColumn>
          <FormControlLabel
            sx={{
              color: "white",
            }}
            control={
              <LocalNodeSwitch
                checked={isUsingGateway}
                onChange={handleChange}
              />
            }
            label="Is using Gateway"
          />
        </Box>
      </AppBar>
      <HeaderNav
        sx={{
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Spacer height="10px" />
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <NameRow>
            {userInfo?.name ? (
              <Avatar
                sx={{
                  height: "30px",
                  width: "30px",
                  fontSize: "16px",
                }}
                src={`/arbitrary/THUMBNAIL/${userInfo?.name}/qortal_avatar?async=true`}
                alt={`${userInfo?.name}`}
              >
                {userInfo?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            ) : userInfo?.address ? (
              <BubbleCardColored1 style={{ height: "35px", width: "35px" }} />
            ) : null}
            {userInfo?.name ? (
              <Username>{userInfo?.name}</Username>
            ) : userInfo?.address ? (
              <Username>{cropAddress(userInfo?.address)}</Username>
            ) : null}
          </NameRow>
          <Terms />
        </Box>

        <RightColumn
          sx={{
            alignItems: "center",
          }}
        >
          <Card
            variant="outlined"
            sx={{
              backgroundColor: "#292929",
              "&.MuiCard-root": {
                cursor: "default",
              },
            }}
          >
            <CardContent>
              <HeaderText>Total Balance</HeaderText>
              <Spacer height="10px" />
              <TotalCol>
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={qortIcon}
                    style={{
                      height: "25px",
                      width: "auto",
                    }}
                  />
                  <HeaderText>{qortBalance} QORT</HeaderText>
                </Box>
                <CoinActionsRow>
                  <CoinSendBtn>Send</CoinSendBtn>
                  <CoinReceiveBtn>Receive</CoinReceiveBtn>
                </CoinActionsRow>
              </TotalCol>
              <Spacer height="10px" />
              <TotalCol>
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={getCoinIcon(getCoinLabel())}
                    style={{
                      height: "25px",
                      width: "auto",
                    }}
                  />
                  {foreignCoinBalance === null ? "N/A" : foreignCoinBalance}{" "}
                  {getCoinLabel()}
                </Box>
                <CoinActionsRow>
                  <CoinSendBtn>Send</CoinSendBtn>
                  <CoinReceiveBtn>Receive</CoinReceiveBtn>
                </CoinActionsRow>
              </TotalCol>
            </CardContent>
          </Card>
        </RightColumn>

        <CoinSelectRow>
          <Select
            size="small"
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
          >
            <MenuItem value={"LITECOIN"}>
              <SelectRow coin="LTC" />
            </MenuItem>
            <MenuItem value={"DOGECOIN"}>
              <SelectRow coin="DOGE" />
            </MenuItem>
            <MenuItem value={"BITCOIN"}>
              <SelectRow coin="BTC" />
            </MenuItem>
            <MenuItem value={"DIGIBYTE"}>
              <SelectRow coin="DGB" />
            </MenuItem>
            <MenuItem value={"RAVENCOIN"}>
              <SelectRow coin="RVN" />
            </MenuItem>
            <MenuItem value={"PIRATECHAIN"}>
              <SelectRow coin="ARRR" />
            </MenuItem>
          </Select>
        </CoinSelectRow>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          open={open}
          autoHideDuration={6000}
          onClose={handleClose}
        >
          <Alert
            onClose={handleClose}
            severity={info?.type}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {info?.message}
          </Alert>
        </Snackbar>
      </HeaderNav>
    </>
  );
};
