"use client"

import { useState, useEffect } from "react"
import supabase from "../helper/supabaseClient"
import { useNavigate, Link } from "react-router-dom"

function Signup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState([])

  const navigate = useNavigate()

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase.from("departments").select("*")
      if (data) setDepartments(data)
      if (error) console.error(error)
    }
    fetchDepartments()
  }, [])

  const handleregister = async (e) => {
    e.preventDefault()
    setMessage("")
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const userId = data.user.id

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          username: name,
          is_official: false,
          department_id: city,
          role: "city_head",
        },
      ])

      if (profileError) {
        setMessage("Account created, but could not save profile data.")
        console.error("Profile insertion error:", profileError)
      } else {
        setMessage("User account created successfully!")
        navigate("/Login")
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary mb-2">Join NammaCity</h2>
                  <p className="text-muted">Create your account to start reporting issues</p>
                </div>

                {message && (
                  <div
                    className={`alert ${message.includes("successfully") ? "alert-success" : "alert-danger"}`}
                    role="alert"
                  >
                    <i
                      className={`bi ${message.includes("successfully") ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}
                    ></i>
                    {message}
                  </div>
                )}

                <form onSubmit={handleregister}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name-input" className="form-label fw-medium">
                        Full Name
                      </label>
                      <input
                        id="name-input"
                        type="text"
                        className="form-control form-control-lg"
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label htmlFor="email-input" className="form-label fw-medium">
                        Email Address
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        className="form-control form-control-lg"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password-input" className="form-label fw-medium">
                      Password
                    </label>
                    <input
                      id="password-input"
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="city-select" className="form-label fw-medium">
                      Department/City
                    </label>
                    <select
                      id="city-select"
                      className="form-select form-select-lg"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    >
                      <option value="">Select your department/city</option>
                      {departments.map((dep) => (
                        <option key={dep.id} value={dep.id}>
                          {dep.department_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    id="signup-button"
                    type="submit"
                    className="btn btn-primary btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{" "}
                    <Link to="/Login" className="text-primary text-decoration-none fw-medium">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <Link to="/" className="text-muted text-decoration-none">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
