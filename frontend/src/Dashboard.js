import { useState, useEffect } from "react";
import api from "./api";

const token = localStorage.getItem("token");

export default function Dashboard({ token, logout }) {

  // =========================
  // STATES
  // =========================

  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [prescriptions, setPrescriptions] = useState([]);

  // =========================
  // LOAD USER + PRESCRIPTIONS
  // =========================

  useEffect(() => {

    const user =
      JSON.parse(
        localStorage.getItem("user")
      );

    if (user) {
      setUserName(user.name);
    }

    fetchPrescriptions();

  }, [token]);

  // =========================
  // FETCH PRESCRIPTIONS
  // =========================

  const fetchPrescriptions = async () => {

    try {

      const res = await api.get(
        "/api/upload/all",
        
      );

      setPrescriptions(
        res.data.data || []
      );

    } catch (error) {

      console.log(error);

    }

  };

  // =========================
  // UPLOAD PRESCRIPTION
  // =========================

  const upload = async () => {

    try {

      if (!file) {
        return alert("Select file");
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      await api.post("/api/upload/all");
        

      alert(
        "Uploaded Successfully ✅"
      );

      fetchPrescriptions();

    } catch (error) {

      console.log(error);

      alert("Upload failed");

    }

  };

  return (

    <div style={styles.container}>

      {/* HEADER */}

      <div style={styles.header}>

        <h2>
          💊 MediCare Dashboard
        </h2>

        <div>

          <span>
            Welcome, {userName}
          </span>

          <button
            style={styles.logout}
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </div>

      {/* UPLOAD SECTION */}

      <div style={styles.cardRow}>

        <div style={styles.card}>

          <h3>
            📤 Upload Prescription
          </h3>

          <input
            type="file"
            onChange={(e) =>
              setFile(
                e.target.files[0]
              )
            }
          />

          <button
            onClick={upload}
            style={styles.btn}
          >
            Upload
          </button>

        </div>

      </div>

      {/* PRESCRIPTIONS */}

      <h3>
        📋 Uploaded Prescriptions
      </h3>

      {prescriptions.map((p, i) => (

        <div
          key={i}
          style={styles.prescriptionCard}
        >

          <h4>
            Patient:
            {" "}
            {p.patientName}
          </h4>

          <p>
            Doctor:
            {" "}
            {p.doctorName}
          </p>

          <p>
            Hospital:
            {" "}
            {p.hospitalName}
          </p>

          <h4>
            Medicines
          </h4>

          {p.medicines?.map((m, idx) => (

            <div
              key={idx}
              style={styles.medicineCard}
            >

              <h4>
                💊 {m.name}
              </h4>

              <p>
                Dosage:
                {" "}
                {m.dosage || "N/A"}
              </p>

              <p>
                Timing:
                {" "}
                {m.timing || "N/A"}
              </p>

              {/* REMINDER SECTION */}

              <h4>
                Set Reminder
              </h4>

              <select

                value={
                  m.reminderType || ""
                }

                onChange={async (e) => {

                  const type =
                    e.target.value;

                  if (!type) return;

                  const today =
                    new Date();

                  let nextReminderDate =
                    new Date();

                  // WEEKLY

                  if (
                    type === "weekly"
                  ) {

                    nextReminderDate
                      .setDate(
                        today.getDate() + 7
                      );

                  }

                  // EVERY 15 DAYS

                  if (
                    type === "15days"
                  ) {

                    nextReminderDate
                      .setDate(
                        today.getDate() + 15
                      );

                  }

                  // MONTHLY

                  if (
                    type === "monthly"
                  ) {

                    nextReminderDate
                      .setMonth(
                        today.getMonth() + 1
                      );

                  }

                  const formattedDate =
                    nextReminderDate
                      .toISOString()
                      .split("T")[0];

                  try {

                    await api.put(

                      `/api/upload/reminder/${p._id}/${idx}`,

                      {

                        reminderType: type,

                        nextReminderDate: formattedDate

                      }

                    );

                    alert(
                      `Reminder saved for ${m.name}`
                    );

                    fetchPrescriptions();

                  } catch (error) {

                    console.log(error);

                    alert(
                      "Failed to save reminder"
                    );

                  }

                }}

              >

                <option value="">
                  Select Reminder
                </option>

                <option value="weekly">
                  Weekly
                </option>

                <option value="15days">
                  Every 15 Days
                </option>

                <option value="monthly">
                  Monthly
                </option>

              </select>

              {/* REMINDER DETAILS */}

              {m.reminderType && (

                <div style={styles.reminderBox}>

                  <p>

                    <strong>
                      Reminder Type:
                    </strong>

                    {" "}

                    {m.reminderType === "weekly"
                      ? "Weekly"
                      : m.reminderType === "15days"
                      ? "Every 15 Days"
                      : "Monthly"}

                  </p>

                  <p>

                    <strong>
                      Next Reminder:
                    </strong>

                    {" "}
                    {m.nextReminderDate}

                  </p>

                </div>

              )}

            </div>

          ))}

        </div>

      ))}

    </div>

  );

}

/* =========================
   STYLES
========================= */

const styles = {

  container: {
    padding: 20,
    fontFamily: "Arial",
    background: "#f3f4f6",
    minHeight: "100vh"
  },

  header: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    marginBottom: 20

  },

  logout: {

    marginLeft: 10,

    padding: "5px 10px"

  },

  cardRow: {

    display: "flex",

    gap: 20,

    marginBottom: 20

  },

  card: {

    flex: 1,

    padding: 15,

    border: "1px solid #ddd",

    borderRadius: 10,

    background: "white"

  },

  btn: {

    marginTop: 10,

    padding: "8px 12px",

    background: "#007bff",

    color: "white",

    border: "none",

    borderRadius: 5,

    cursor: "pointer"

  },

  prescriptionCard: {

    border: "1px solid #ccc",

    padding: 15,

    marginBottom: 15,

    borderRadius: 10,

    background: "white"

  },

  medicineCard: {

    border: "1px solid #eee",

    padding: 15,

    marginTop: 10,

    borderRadius: 8,

    background: "#fafafa"

  },

  reminderBox: {

    marginTop: 15,

    padding: 15,

    background: "#ffffff",

    border: "1px solid #e5e7eb",

    borderRadius: 12,

    boxShadow:
      "0 2px 8px rgba(0,0,0,0.05)",

    display: "flex",

    flexDirection: "column",

    gap: 10

  }

};