import { styled } from "@mui/system";
import { Box, Button, Typography } from "@mui/material";
import { HomeSVG } from "../common/icons/HomeSVG";
import { QortalLogoSVG } from "../common/icons/QortalLogoSVG";
import { CaretDownSVG } from "../common/icons/CaretDownSVG";

export const HeaderNav = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  padding: "0 30px",
  [theme.breakpoints.only("xs")]: {
    padding: "0",
  },
}));

export const BubbleCardColored1 = styled(Box)({
  height: "77px",
  width: "77px",
  background: "linear-gradient(124.49deg, #70BAFF 7.03%, #F29999 94.22%)",
  boxShadow: "0px 0px 25.8px -1px #1C5A93",
  borderRadius: "50%",
});

export const HomeIcon = styled(HomeSVG)({
  cursor: "pointer",
});

export const QortalLogoIcon = styled(QortalLogoSVG)({
  cursor: "pointer",
});

export const CaretDownIcon = styled(CaretDownSVG)({
  color: "none",
});

export const DropdownContainer = styled(Box)({
  position: "relative",
  display: "flex",
  flexDirection: "row",
  gap: "18px",
  alignItems: "center",
  justifyContent: "center",
});

export const GameSelectDropdown = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px",
  width: "fit-content",
  height: "35px",
  top: "38px",
  left: "38px",
  opacity: "0px",
  fontFamily: "Fira Sans, sans-serif",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "19.2px",
  border: `1px solid ${theme.palette.text.secondary}`,
  color: theme.palette.text.secondary,
  borderRadius: "30px",
  gap: "11px",
  userSelect: "none",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    border: `1px solid #5f5e5e`,
    color: "#5f5e5e",
    "& ${CaretDownIcon}": {
      "& path": {
        transition: "all 0.3s ease-in-out",
        stroke: "#5f5e5e",
      },
    },
  },
}));

export const GameSelectDropdownMenu = styled(Box)({
  position: "absolute",
  bottom: "-60px",
  left: 0,
  backgroundColor: "#222222",
  border: "1.07px solid #0000001A",
  borderRadius: "5px",
  width: "250px",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  boxShadow: "0px 4.27px 14.93px 0px #00000026",
  "& :first-child": {
    borderTopLeftRadius: "5px",
    borderTopRightRadius: "5px",
  },
  "& :last-child": {
    borderBottomLeftRadius: "5px",
    borderBottomRightRadius: "5px",
  },
});

export const GameSelectDropdownMenuItem = styled(Box)(({ theme }) => ({
  fontFamily: "Inter, sans-serif",
  color: theme.palette.text.primary,
  fontSize: "18px",
  lineHeight: "19.36px",
  fontWeight: 400,
  height: "50px",
  width: "100%",
  padding: "15px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.primary.main,
    cursor: "pointer",
  },
}));

export const Username = styled(Typography)(({ theme }) => ({
  fontFamily: "Fira Sans, sans-serif",
  fontSize: "20px",
  lineHeight: "19.2px",
  fontWeight: 400,
  color: theme.palette.text.primary,
  transition: "all 0.3s ease-in-out",
  userSelect: "none",
}));

export const NameRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  alignItems: "center",
});
export const LogoColumn = styled(Box)({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  alignItems: "center",
});
export const RightColumn = styled(Box)({
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  alignItems: "flex-start",
  padding: "10px",
});
export const AvatarCircle = styled("img")({
  borderRadius: "50%",
  width: "35px",
  height: "35px",
  objectFit: "cover",
  userSelect: "none",
});

export const HeaderText = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  color: theme.palette.text.primary,
  textAlign: "center",
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: 1.2,
  userSelect: "none",
}));

export const TotalCol = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
});

export const CoinActionsRow = styled(Box)({
  display: "flex",
  flexDirection: "row",
  gap: "5px",
  alignItems: "center",
  justifyContent: "center",
});

export const CoinSendBtn = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "#000000",
  border: `1px solid ${theme.palette.primary.main}`,
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "16px",
  padding: "5px 10px",
  borderRadius: "0px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    border: `1px solid ${theme.palette.text.primary}`,
    backgroundColor: theme.palette.text.primary,
  },
}));

export const CoinReceiveBtn = styled(Button)(({ theme }) => ({
  backgroundColor: "transparent",
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.text.primary}`,
  fontFamily: "Inter, sans-serif",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "16px",
  padding: "5px 10px",
  borderRadius: "0px",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    color: "#000000",
    backgroundColor: theme.palette.text.primary,
  },
}));

export const CoinSelectRow = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  alignSelf: "flex-start",
});
