import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import '../styles/editProfile.css';

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000"; 

function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    voter_id: "",
    first_name: "",
    last_name: "",
    address: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("voterInfo");
    if (stored) {
      const { voter_id } = JSON.parse(stored);
      // axios.get(`http://localhost:5000/voter/${voter_id}`)
      axios.get(`${API_BASE}/voter/${voter_id}`) 
        .then((res) => {
          const voter = res.data;
          setForm((prev) => ({
            ...prev,
            voter_id: voter.voter_id,
            first_name: voter.first_name,
            last_name: voter.last_name,
            address: voter.address || "",
            phone: voter.phone || "",
          }));
        })
        .catch(() => setMessage("Error loading profile."));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setMessage("Phone number must be exactly 10 digits.");
      return;
    }

    const updateData = {
      address: form.address,
      phone: form.phone,
    };

    if (form.password) {
      updateData.password = form.password;
    }

    try {
      // await axios.put(`http://localhost:5000/voter/${form.voter_id}`, updateData);
      await axios.put(`${API_BASE}/voter/${form.voter_id}`, updateData);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Error updating profile.");
    }
  };

  return (
    <div className="edit-container">
      <div className="edit-card">
        <h3 className="text-center mb-3 edit-head">Edit Your Profile</h3>

        {message && <div className="alert alert-info text-center">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Voter ID</label>
            <input type="text" className="form-control" value={form.voter_id} readOnly />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input type="text" className="form-control" value={form.first_name} readOnly />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input type="text" className="form-control" value={form.last_name} readOnly />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>New Password (leave blank to keep current)</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="button-group mt-4">
            <button type="submit" className="custom-save-button mx-2">
              Save Changes
            </button>
            <button
              type="button"
              className="custom-back-button mx-2"
              onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
