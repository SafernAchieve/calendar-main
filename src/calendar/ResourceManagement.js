import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Drawer,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const ResourceManagement = ({ open, onClose }) => {
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({
    name: "",
    location: "",
    purpose: "",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState(null);

  const fetchResources = async () => {
    try {
      const response = await fetch("http://localhost:4000/resources");
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  React.useEffect(() => {
    fetchResources();
  }, []);

  const locations = [...new Set(resources.map(r => r.location).filter(Boolean))];
  const purposes = [...new Set(resources.map(r => r.purpose).filter(Boolean))];

  const handleInputChange = (e) => {
    setNewResource({
      ...newResource,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddResource = async () => {
    if (
      newResource.name.trim() &&
      newResource.location.trim() &&
      newResource.purpose.trim()
    ) {
      const resourceToAdd = {
        ...newResource,
        id: newResource.name.trim(),
      };
      try {
        const response = await fetch("http://localhost:4000/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(resourceToAdd),
        });
        if (response.ok) {
          await fetchResources(); // Refresh the resource list
          setNewResource({ name: "", location: "", purpose: "" });
        } else {
          alert("Failed to add resource.");
        }
      } catch (error) {
        console.error("Error adding resource:", error);
      }
    }
  };

  // Show dialog before deleting
  const handleDeleteResource = (idx) => {
    setDeleteIdx(idx);
    setConfirmOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    const idx = deleteIdx;
    const resourceToDelete = resources[idx];
    try {
      const response = await fetch(
        `http://localhost:4000/api/resources/${encodeURIComponent(resourceToDelete.id)}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        await fetchResources(); // Refresh the resource list
      } else {
        alert("Failed to delete resource.");
      }
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
    setConfirmOpen(false);
    setDeleteIdx(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setDeleteIdx(null);
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
        <Box sx={{ p: 2, minWidth: 350 }}>
          <Typography variant="h6" gutterBottom>
            Resource Management
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={newResource.name}
              onChange={handleInputChange}
              size="small"
              sx={{ minWidth: 120 }}
            />
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Location</InputLabel>
              <Select
                label="Location"
                name="location"
                value={newResource.location}
                onChange={handleInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Purpose</InputLabel>
              <Select
                label="Purpose"
                name="purpose"
                value={newResource.purpose}
                onChange={handleInputChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {purposes.map((purpose) => (
                  <MenuItem key={purpose} value={purpose}>
                    {purpose}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton color="primary" onClick={handleAddResource}>
              <AddIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {resources.map((resource, idx) => (
              <ListItem
                key={idx}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteResource(idx)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={resource.name}
                  secondary={`Location: ${resource.location} | Purpose: ${resource.purpose}`}
                />
              </ListItem>
            ))}
            {resources.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No resources added yet.
              </Typography>
            )}
          </List>
        </Box>
      </Drawer>
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <b>{deleteIdx !== null && resources[deleteIdx]?.name}</b>?
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

export default ResourceManagement;