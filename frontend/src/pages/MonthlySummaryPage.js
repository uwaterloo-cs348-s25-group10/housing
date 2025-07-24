import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Box,
  Button,
} from "@mui/material";
import { apiClient } from "../config/api";
import { Link } from "react-router-dom";

export default function MonthlySummaryPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    apiClient
      .post("/monthly-summary/refresh?reset=True")
    
    apiClient
      .get("/monthly-summary/all")
      .then((res) => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Monthly Affordability Summary
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Top and bottom regions by Housing-Affordability Index for this month.
      </Typography>

      <Box mb={2}>
        <Button component={Link} to="/" variant="outlined">
          ← Back Home
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <Paper elevation={1}>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell>Region ID</TableCell>
                  <TableCell align="right">HAI Index</TableCell>
                  <TableCell>Rank Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.region_id}</TableCell>
                    <TableCell align="right">
                      {row.hai.toFixed(2)}
                    </TableCell>
                    <TableCell>{row.rank_type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
}
