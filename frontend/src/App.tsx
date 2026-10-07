import { useEffect, useState } from 'react';

interface User {
  id: string;
  email?: string;
  name?: string;
}

function App() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const auth0IdpLoginUrl = import.meta.env.VITE_AUTH0_IDP_LOGIN_URL;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${backendUrl}/auth/me`, {
      credentials: 'include',
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return response.json();
      })
      .then((data) => {
        setUser(data?.user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [backendUrl]);

  const handleLogout = async () => {
  await fetch(`${backendUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  setUser(null);
};

  return (
    <main>
      <h1>SAML SSO Demo</h1>

      <p>
        Demonstration of SP-initiated and IdP-initiated SAML SSO using Auth0.
      </p>

      <section>
        <h2>SP-Initiated Login</h2>

        <p>Start authentication from this application.</p>

        <a href={`${backendUrl}/auth/saml/login`}>
          <button>Start SP-Initiated Login</button>
        </a>
      </section>

      <section>
        <h2>IdP-Initiated Login</h2>

        <p>Start authentication from Auth0.</p>

        <a
          href={auth0IdpLoginUrl}
          target="_blank"
          rel="noreferrer"
        >
          <button>Start IdP-Initiated Login</button>
        </a>
      </section>

      <section>
        <h2>Authenticated User</h2>

        {loading && <p>Checking session...</p>}

        {!loading && !user && <p>Not authenticated.</p>}

        {!loading && user && (
          <div>
            <p>
              <strong>Name:</strong> {user.name}
            </p>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p>
              <strong>User ID:</strong> {user.id}
            </p>
                <button onClick={handleLogout}>
      Logout
    </button>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;