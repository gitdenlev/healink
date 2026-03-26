'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Group,
  Button,
  rem,
  Stack,
  Image as MantineImage,
} from '@mantine/core';
import { IconLock, IconMail } from '@tabler/icons-react';
import { Alert } from '@/components/Alert/Alert';
import { useAuth } from '@/context/AuthContext';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import classes from './LoginPage.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      {/* Left Image Section */}
      <div className={classes.imageSection}>
        <MantineImage
          src="/loginphoto.avif"
          alt="Login background"
          style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        />
        <div className={classes.imageOverlay}>
          <Stack gap={10}>
            <Group>
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />
              <Title order={1} c="dark.5" style={{ fontSize: rem(32), lineHeight: 1.1, fontWeight: 900 }}>
                Healink
              </Title>
            </Group>
          </Stack>
        </div>
      </div>

      {/* Right Form Section */}
      <div className={classes.formSection}>
        <Stack justify="center" h="100%" style={{ maxWidth: 420, margin: '0 auto' }}>
          <Paper withBorder={false} p={0} bg="transparent">
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert title="Authentication Error" tone="error" mb="lg">
                  {error}
                </Alert>
              )}

              <Stack gap="md">
                <TextInput
                  label="Email Address"
                  placeholder="name@healink.com"
                  required
                  size="md"
                  radius="md"
                  leftSection={<IconMail size={18} stroke={1.5} />}
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                />
                <PasswordInput
                  label="Password"
                  placeholder="Enter your security key"
                  required
                  size="md"
                  radius="md"
                  mt={10}
                  leftSection={<IconLock size={18} stroke={1.5} />}
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                />



                <Button
                  fullWidth
                  mt="xl"
                  type="submit"
                  loading={loading}
                  color="teal"
                  size="lg"
                  radius="md"
                  style={{ boxShadow: '0 4px 15px rgba(13, 148, 136, 0.2)' }}
                >
                  Sign in
                </Button>

                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                  <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'dummy'} locale="en">
                    <GoogleLogin
                      onSuccess={async (credentialResponse) => {
                        if (credentialResponse.credential) {
                          setLoading(true);
                          setError(null);
                          try {
                            await loginWithGoogle(credentialResponse.credential);
                          } catch (err: any) {
                            setError(err.message || 'Google Login failed');
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      onError={() => setError('Google Login Failed')}
                      useOneTap
                      theme="outline"
                      shape="rectangular"
                    />
                  </GoogleOAuthProvider>
                </div>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </div>
    </div>
  );
}
