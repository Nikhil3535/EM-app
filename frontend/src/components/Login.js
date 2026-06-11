import React, { useState } from 'react';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from;
  const destinationLabel = redirectPath
    ? 'Continue'
    : 'Go to Dashboard';

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      setLoading(false);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('EMSusername', username);
        setSuccessOpen(true);
      } else {
        setError(
          'Invalid credentials. Please try again.'
        );
      }
    } catch (err) {
      setLoading(false);
      setError(
        'Invalid credentials or server unavailable. Please try again later.'
      );
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSuccessContinue = () => {
    const target = redirectPath || '/dashboard';
    setSuccessOpen(false);
    navigate(target);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0F172A 0%, #1E293B 40%, #312E81 100%)',
        padding: 2,
        position: 'relative',
      }}
    >
      {/* Canary Badge */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          background:
            'linear-gradient(135deg,#EC4899,#7C3AED)',
          color: '#fff',
          px: 2,
          py: 1,
          borderRadius: 3,
          fontWeight: 'bold',
          zIndex: 9999,
          boxShadow:
            '0 8px 20px rgba(0,0,0,0.3)',
        }}
      >
        🚀 CANARY v2
      </Box>

      <Card
        sx={{
          width: '100%',
          maxWidth: 950,
          borderRadius: 5,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1.1fr 0.9fr',
          },
          boxShadow:
            '0 25px 70px rgba(0,0,0,0.45)',
          border:
            '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            background:
              'linear-gradient(135deg,#7C3AED 0%,#2563EB 100%)',
            color: '#fff',
            padding: { xs: 4, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            🚀 Welcome to EMS v2
          </Typography>

          <Typography>
            Experience the new canary release with
            enhanced design, improved usability, and
            modern UI styling.
          </Typography>

          <Stack spacing={1}>
            <Typography fontWeight={700}>
              Why log in?
            </Typography>

            <Typography variant="body2">
              • Access your employee dashboard.
            </Typography>

            <Typography variant="body2">
              • Manage employees and departments.
            </Typography>

            <Typography variant="body2">
              • View reports and analytics.
            </Typography>

            <Typography variant="body2">
              • Continue from your previous session.
            </Typography>
          </Stack>
        </Box>

        {/* Right Section */}
        <CardContent
          sx={{
            padding: { xs: 3, md: 4 },
            background:
              'rgba(30,41,59,0.97)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Typography
            variant="h5"
            textAlign="center"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Employee Management 🚀 v2
          </Typography>

          <Alert
            severity="success"
            sx={{
              mb: 2,
              fontWeight: 'bold',
            }}
          >
            🚀 Canary Release v2 Active
          </Alert>

          {redirectPath && (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
            >
              Please log in to continue to{' '}
              <strong>{redirectPath}</strong>.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={e =>
                  setUsername(e.target.value)
                }
              />

              <TextField
                fullWidth
                label="Password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={e =>
                  setPassword(e.target.value)
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={
                          handleTogglePasswordVisibility
                        }
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  sx={{
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: 3,
                    background:
                      'linear-gradient(90deg,#7C3AED,#06B6D4)',
                    '&:hover': {
                      background:
                        'linear-gradient(90deg,#8B5CF6,#0891B2)',
                    },
                  }}
                >
                  Login
                </Button>
              )}

              {error && (
                <Typography
                  color="error"
                  textAlign="center"
                >
                  {error}
                </Typography>
              )}

              <Divider />

              <Stack
                spacing={1}
                alignItems="center"
              >
                <Typography variant="body2">
                  Don't have an account?
                  <Button
                    component="a"
                    href="/register"
                    size="small"
                  >
                    Register
                  </Button>
                </Typography>

                <Typography variant="body2">
                  Forgot password?
                  <Button
                    component="a"
                    href="/verify-username"
                    size="small"
                  >
                    Reset Password
                  </Button>
                </Typography>
              </Stack>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Dialog
        open={successOpen}
        onClose={handleSuccessContinue}
        PaperProps={{
          sx: {
            background: '#1E293B',
            color: '#fff',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          🎉 Login Successful
        </DialogTitle>

        <DialogContent>
          <Typography>
            Welcome back, {username || 'User'}!
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            onClick={handleSuccessContinue}
          >
            {destinationLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;