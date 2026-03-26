import net from 'net';

type TcpPattern = string | { cmd: string };

export type ServiceName = 'patients' | 'doctors' | 'appointments' | 'analytics';

const SERVICE_MAP: Record<ServiceName, { host: string; port: number }> = {
  patients: {
    host: process.env.PATIENTS_SERVICE_HOST || '127.0.0.1',
    port: 3001,
  },
  doctors: {
    host: process.env.DOCTORS_SERVICE_HOST || '127.0.0.1',
    port: 3002,
  },
  appointments: {
    host: process.env.APPOINTMENTS_SERVICE_HOST || '127.0.0.1',
    port: 3003,
  },
  analytics: {
    host: process.env.ANALYTICS_SERVICE_HOST || '127.0.0.1',
    port: 3004,
  },
};

function extractTcpError(err: unknown): string {
  if (typeof err === 'string') {
    return err;
  }

  if (err && typeof err === 'object') {
    const maybeError = err as {
      message?: unknown;
      error?: unknown;
      status?: unknown;
    };

    if (typeof maybeError.message === 'string') {
      return maybeError.message;
    }

    if (typeof maybeError.error === 'string') {
      return maybeError.error;
    }

    if (typeof maybeError.status === 'string') {
      return maybeError.status;
    }
  }

  return 'Unknown TCP error';
}

export function sendTcpMessage<TResponse>(
  pattern: TcpPattern,
  data: Record<string, unknown> = {},
  service: ServiceName = 'patients',
): Promise<TResponse> {
  return new Promise((resolve, reject) => {
    const { host, port } = SERVICE_MAP[service];

    const client = new net.Socket();
    
    client.connect(port, host, () => {
      const messageObj = {
        pattern,
        data,
        id: Math.random().toString(36).substring(7),
      };
      
      const messageStr = JSON.stringify(messageObj);
      const packet = `${messageStr.length}#${messageStr}`;
      
      client.write(packet);
    });

    let buffer = '';

    client.on('data', (chunk) => {
      buffer += chunk.toString();
      
      const hashIndex = buffer.indexOf('#');
      if (hashIndex !== -1) {
        const lengthStr = buffer.substring(0, hashIndex);
        const length = parseInt(lengthStr, 10);
        const jsonStr = buffer.substring(hashIndex + 1);
        
        if (jsonStr.length >= length) {
          const message = jsonStr.substring(0, length);
          try {
            const parsed = JSON.parse(message);
            client.destroy();
            
            if (parsed.err) {
              reject(new Error(extractTcpError(parsed.err)));
            } else {
              resolve(parsed.response as TResponse);
            }
          } catch (e) {
            reject(new Error('Не вдалося розпарсити відповідь від мікросервісу: ' + String(e)));
          }
        }
      }
    });

    client.on('error', (err) => {
      client.destroy();
      reject(err);
    });
    
    client.setTimeout(5000, () => {
      client.destroy();
      reject(new Error('TCP Timeout: мікросервіс не відповів за 5 секунд'));
    });
  });
}
