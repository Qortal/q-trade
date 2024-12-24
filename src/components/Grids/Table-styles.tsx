import { Box, styled } from "@mui/system";
import { Typography } from "@mui/material";

export const TextTableTitle = styled(Typography)(({ theme }) => ({
  fontFamily: "Inter",
  color: theme.palette.text.primary,
  fontWeight: 400,
  fontSize: "20px",
  lineHeight: "40px",
  userSelect: "none",
}));

export const BuyContainer = styled(Box)({
  width: "calc(100% - 60px)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "fixed",
  bottom: "0px",
  height: "100px",
  padding: "7px 14px",
  background: "#323336",
});
