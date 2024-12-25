import {
  ReusableModalBackdrop,
  ReusableModalCloseIcon,
  ReusableModalContainer,
} from "./ReusableModal-styles";
interface ReusableModalProps {
  backdrop?: boolean;
  onClickClose: () => void;
  children: React.ReactNode;
}

export const ReusableModal: React.FC<ReusableModalProps> = ({
  backdrop,
  children,
  onClickClose,
}) => {
  return (
    <>
      <ReusableModalContainer>
        <ReusableModalCloseIcon onClick={onClickClose} />
        {children}
      </ReusableModalContainer>
      {backdrop && <ReusableModalBackdrop onClick={onClickClose} />}
    </>
  );
};
