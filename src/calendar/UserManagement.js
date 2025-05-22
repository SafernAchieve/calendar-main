import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  IconButton,
  Drawer,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const UserManagement = ({
  adminUser,
  supervisorUser,
  setAdminUser,
  setSupervisorUser,
  open,
  onClose,
}) => {
  const [newEmail, setNewEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({ email: "", role: "" });

  const handleAddUser = () => {
    if (!newEmail.trim()) {
      setError("Email cannot be empty.");
      return;
    }
    if (role === "admin" && adminUser.includes(newEmail)) {
      setError("This admin already exists.");
      return;
    }
    if (role === "supervisor" && supervisorUser.includes(newEmail)) {
      setError("This supervisor already exists.");
      return;
    }
    if (role === "admin") {
      setAdminUser((prev) => [...prev, newEmail]);
    } else {
      setSupervisorUser((prev) => [...prev, newEmail]);
    }
    setNewEmail("");
    setError("");
  };

  const handleDeleteUser = (email, role) => {
    setDeleteInfo({ email, role });
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    const { email, role } = deleteInfo;
    if (role === "admin") {
      setAdminUser((prev) => prev.filter((user) => user !== email));
    } else {
      setSupervisorUser((prev) => prev.filter((user) => user !== email));
    }
    setConfirmOpen(false);
    setDeleteInfo({ email: "", role: "" });
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteInfo({ email: "", role: "" });
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: "30vw", minWidth: 300, maxWidth: 500 },
        }}
      >
        <Box sx={{ p: 2, height: "100%", boxSizing: "border-box" }}>
          <Typography variant="h6">Manage Users</Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              fullWidth
            />
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={(_, value) => value && setRole(value)}
              size="small"
              sx={{ height: 40 }}
            >
              <ToggleButton value="admin">Admin</ToggleButton>
              <ToggleButton value="supervisor">Supervisor</ToggleButton>
            </ToggleButtonGroup>
            <Button
              variant="contained"
              onClick={handleAddUser}
              sx={{ whiteSpace: "nowrap" }}
            >
              Add
            </Button>
          </Box>
          {error && <Typography color="error">{error}</Typography>}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Admins</Typography>
            <List>
              {adminUser.map((email) => (
                <ListItem
                  key={email}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteUser(email, "admin")}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {email}
                </ListItem>
              ))}
            </List>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Supervisors</Typography>
            <List>
              {supervisorUser.map((email) => (
                <ListItem
                  key={email}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      onClick={() => handleDeleteUser(email, "supervisor")}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {email}
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <b>{deleteInfo.email}</b> from {deleteInfo.role}s?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserManagement;