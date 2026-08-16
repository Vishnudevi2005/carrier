import { useEffect, useState } from "react";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Administrator",
    username: "admin",
    email: "admin@carrierselect.com",
    phone: "+91 98765 43210",
    role: "Transportation Manager",
    department: "Logistics & Transportation",
  });

  // Load saved profile
  useEffect(() => {
    const savedProfile = localStorage.getItem(
      "carrierUserProfile"
    );

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error(
          "Unable to load profile:",
          error
        );
      }
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  };

  // Save profile
  const handleSave = () => {
    localStorage.setItem(
      "carrierUserProfile",
      JSON.stringify(profile)
    );

    setIsEditing(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  // Cancel editing
  const handleCancel = () => {
    const savedProfile = localStorage.getItem(
      "carrierUserProfile"
    );

    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error(error);
      }
    }

    setIsEditing(false);
  };

  return (
    <div className="profile-page">

      {/* PAGE HEADER */}
      <div className="page-header">
        <div>
          <h1>Profile</h1>

          <p>
            Manage your account and personal information
          </p>
        </div>
      </div>


      {/* PROFILE HEADER CARD */}
      <div className="profile-header-card">

        <div className="profile-avatar">
          {profile.name
            .charAt(0)
            .toUpperCase()}
        </div>

        <div className="profile-header-info">
          <h2>{profile.name}</h2>

          <p>{profile.role}</p>

          <span className="profile-status">
            ● Active Account
          </span>
        </div>

        <div className="profile-header-action">

          {!isEditing ? (
            <button
              className="primary-button"
              onClick={() => {
                setIsEditing(true);
                setSaved(false);
              }}
            >
              Edit Profile
            </button>
          ) : (
            <div className="profile-actions">

              <button
                className="secondary-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleSave}
              >
                Save Changes
              </button>

            </div>
          )}

        </div>

      </div>


      {/* SUCCESS MESSAGE */}
      {saved && (
        <div className="profile-success">
          ✓ Profile updated successfully
        </div>
      )}


      {/* PERSONAL INFORMATION */}
      <div className="profile-card">

        <div className="profile-card-header">

          <div>
            <h2>Personal Information</h2>

            <p>
              Update your personal account details
            </p>
          </div>

        </div>


        <div className="profile-form-grid">

          {/* NAME */}
          <div className="form-group">

            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter your name"
            />

          </div>


          {/* USERNAME */}
          <div className="form-group">

            <label>Username</label>

            <input
              type="text"
              name="username"
              value={profile.username}
              disabled
            />

            <small>
              Username cannot be changed
            </small>

          </div>


          {/* EMAIL */}
          <div className="form-group">

            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter email address"
            />

          </div>


          {/* PHONE */}
          <div className="form-group">

            <label>Phone Number</label>

            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Enter phone number"
            />

          </div>


          {/* ROLE */}
          <div className="form-group">

            <label>Role</label>

            <input
              type="text"
              name="role"
              value={profile.role}
              disabled
            />

          </div>


          {/* DEPARTMENT */}
          <div className="form-group">

            <label>Department</label>

            <input
              type="text"
              name="department"
              value={profile.department}
              disabled={!isEditing}
            />

          </div>

        </div>

      </div>


      {/* ACCOUNT INFORMATION */}
      <div className="profile-card">

        <div className="profile-card-header">

          <div>
            <h2>Account Information</h2>

            <p>
              Information about your Carrier Select account
            </p>
          </div>

        </div>


        <div className="account-info-list">

          <div className="account-info-item">

            <div>
              <span>Account Status</span>

              <strong className="account-active">
                Active
              </strong>
            </div>

            <span className="info-icon">
              ✓
            </span>

          </div>


          <div className="account-info-item">

            <div>
              <span>Account Type</span>

              <strong>
                Administrator
              </strong>
            </div>

            <span className="info-icon">
              👤
            </span>

          </div>


          <div className="account-info-item">

            <div>
              <span>System Access</span>

              <strong>
                Full Access
              </strong>
            </div>

            <span className="info-icon">
              🔐
            </span>

          </div>


          <div className="account-info-item">

            <div>
              <span>Platform</span>

              <strong>
                Carrier Select TMS
              </strong>
            </div>

            <span className="info-icon">
              🚚
            </span>

          </div>

        </div>

      </div>


      {/* SECURITY */}
      <div className="profile-card">

        <div className="profile-card-header">

          <div>
            <h2>Security</h2>

            <p>
              Manage your account security
            </p>
          </div>

        </div>


        <div className="security-row">

          <div>

            <strong>Password</strong>

            <p>
              Your password is securely protected
            </p>

          </div>

          <button
            className="secondary-button"
            onClick={() =>
              alert(
                "Password change functionality can be connected to your backend authentication system."
              )
            }
          >
            Change Password
          </button>

        </div>


        <div className="security-row">

          <div>

            <strong>Session</strong>

            <p>
              You are currently logged in to Carrier Select
            </p>

          </div>

          <span className="session-active">
            ● Active
          </span>

        </div>

      </div>


      {/* FOOTER */}
      <div className="profile-footer">

        <strong>
          Carrier Select
        </strong>

        <span>
          Transportation Management System
        </span>

      </div>

    </div>
  );
}

export default Profile;