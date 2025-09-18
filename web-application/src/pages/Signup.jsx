"use client"

import { useState, useEffect } from "react"
import supabase from "../helper/supabaseClient"
import { useNavigate, Link } from "react-router-dom"

function Signup() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [password, setPassword] = useState("")
  const [city, setCity] = useState("")
  const [userType, setUserType] = useState("regular") // New state for user type
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

    // If user wants to be admin, check if department already has one
    if (userType === "admin") {
      console.log("Checking for existing admin in department:", city)
      
      const { data: existingAdmins, error: checkError } = await supabase
        .from("profiles")
        .select("id, username, department_id, role")
        .eq("department_id", city)
        .eq("role", "city_head")

      console.log("Existing admins query result:", { existingAdmins, checkError })

      if (checkError) {
        setMessage("Error checking existing administrators. Please try again.")
        setLoading(false)
        return
      }

      if (existingAdmins && existingAdmins.length > 0) {
        const departmentName = departments.find(d => d.id.toString() === city.toString())?.department_name || "this department"
        setMessage(`An administrator (${existingAdmins[0].username}) already exists for ${departmentName}. Only one admin per department is allowed.`)
        setLoading(false)
        return
      }
    }

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

      // Set role based on user selection
      const role = userType === "admin" ? "city_head" : "regular_user"

      const { error: profileError } = await supabase.from("profiles").insert([
        {
          id: userId,
          username: name,
          is_official: userType === "admin", // true if admin, false if regular
          department_id: city, // Keep as string since that's what the select returns
          role: role,
        },
      ])

      if (profileError) {
        setMessage("Account created, but could not save profile data.")
        console.error("Profile insertion error:", profileError)
      } else {
        const accountType = userType === "admin" ? "administrator" : "regular user"
        setMessage(`${accountType} account created successfully!`)
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
                  <p className="text-muted">Create your account to start managing issues</p>
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

                  {/* Account Type Selection */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">Account Type</label>
                    <div className="row">
                      <div className="col-6">
                        <div className="form-check form-check-lg p-3 border rounded">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="userType"
                            id="regular-user"
                            value="regular"
                            checked={userType === "regular"}
                            onChange={(e) => setUserType(e.target.value)}
                          />
                          <label className="form-check-label w-100" htmlFor="regular-user">
                            <strong className="text-primary">Staff Member</strong>
                            <small className="d-block text-muted">Can work on assigned tasks</small>
                          </label>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="form-check form-check-lg p-3 border rounded">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="userType"
                            id="admin-user"
                            value="admin"
                            checked={userType === "admin"}
                            onChange={(e) => setUserType(e.target.value)}
                          />
                          <label className="form-check-label w-100" htmlFor="admin-user">
                            <strong className="text-success">Administrator</strong>
                            <small className="d-block text-muted">Can assign tasks and manage department</small>
                          </label>
                        </div>
                      </div>
                    </div>
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
                      `Create ${userType === "admin" ? "Admin" : "Staff"} Account`
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