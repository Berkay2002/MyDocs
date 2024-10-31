// src/components/ConfirmModal.js
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const ConfirmModal = ({
  isOpen = false,
  onClose,
  onSubmit,
  title = "Create a New Doc",
  body,
  inputValue,
  setInputValue,
  buttonText = "Create",
  isWarning = false,
}) => {
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          {body}
        </Typography>
        {setInputValue && (
          <TextField
            fullWidth
            margin="normal"
            type="text"
            placeholder="File name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            color={isWarning ? "error" : "primary"}
            variant="contained"
            disabled={inputValue && inputValue.trim() === ""}
            sx={{ ml: 2 }}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;