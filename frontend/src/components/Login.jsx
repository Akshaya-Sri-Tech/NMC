import { useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Database,
  AlertCircle,
} from "lucide-react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setError("");

    // No authentication.
    // Simply open the dashboard.
    onLogin();
  };

  return (
    <div className="login-page">

      {/* =================================================
          LEFT VIDEO SECTION
      ================================================= */}

      <div className="login-visual">

        <video
          className="login-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source
            src="/login-animation.mp4"
            type="video/mp4"
          />
        </video>

        <div className="login-video-overlay"></div>

        <div className="login-brand-overlay">

          <div className="login-brand-mark">
            <Database size={25} />
          </div>

          <div>
            <strong>
              Sangam_IN
            </strong>

            <span>
              Material Intelligence
            </span>
          </div>

        </div>

        <div className="login-visual-content">

          <div className="login-visual-eyebrow">
            NATIONAL MATERIAL INTELLIGENCE PLATFORM
          </div>

          <h1>
  One Nation
  <br />
  <span>One Code.</span>
</h1>

          <p>
            AI-driven material intelligence for
            standardized procurement and
            cross-CPSE collaboration.
          </p>

        </div>

        <div className="login-visual-footer">
          SIH • Sangam_IN MATERIAL INTELLIGENCE
        </div>

      </div>


      {/* =================================================
          RIGHT LOGIN SECTION
      ================================================= */}

      <div className="login-form-section">

        <div className="login-form-container">

          {/* BRAND */}

          <div className="login-mobile-brand">

            <div className="login-mobile-mark">
              <Database size={21} />
            </div>

            <div>
              <strong>
                Sangam_IN
              </strong>

              <span>
                Material Intelligence
              </span>
            </div>

          </div>


          {/* HEADER */}

          <div className="login-heading">

            <div className="login-eyebrow">
              PLATFORM ACCESS
            </div>

            <h2>
              Sangam_IN
            </h2>

            <p>
              Sign in to access the Sangam_IN Material
              Intelligence platform.
            </p>

          </div>


          {/* FORM */}

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            {/* USERNAME */}

            <div className="login-field">

              <label htmlFor="username">
                Username
              </label>

              <div className="login-input-wrapper">

                <User size={17} />

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your username"
                  autoComplete="username"
                  autoFocus
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <div className="login-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="login-input-wrapper">

                <Lock size={17} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div className="login-error">

                <AlertCircle size={15} />

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="login-button"
            >

              <span>
                Sign In
              </span>

              <ArrowRight size={17} />

            </button>

          </form>


          {/* FOOTER */}

          <div className="login-footer">

            <span>
              Sangam_IN Material Intelligence Platform
            </span>

            <span>
              SIH • v1.0.0
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;