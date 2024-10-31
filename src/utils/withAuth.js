import { useAuth } from "../../AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

const withAuth = (WrappedComponent) => {
  const ComponentWithAuth = (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/login"); // Redirect to login page if not authenticated
      }
    }, [user, loading, router]);

    // Display a modern loading screen
    if (loading) {
      return (
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            backgroundColor: "#f0f2f5",
          }}
        >
          <Box>
            <CircularProgress color="primary" />
            <Typography variant="h6" sx={{ marginTop: 2 }}>
              Loading your experience...
            </Typography>
          </Box>
        </Container>
      );
    }

    // Fallback if user is not authenticated after loading completes
    if (!user) {
      return (
        <Container
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            textAlign: "center",
            backgroundColor: "#f0f2f5",
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ marginBottom: 2, color: "gray" }}>
              Access Restricted
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: 4, color: "gray" }}>
              Please sign in to access this page.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.replace("/login")}
            >
              Go to Login
            </Button>
          </Box>
        </Container>
      );
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;
